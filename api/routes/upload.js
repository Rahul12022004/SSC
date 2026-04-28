import express from "express";
import multer from "multer";
import { put } from "@vercel/blob";

const router = express.Router();

// -----------------------------------------------------------------------------
// Image upload route — uploads images to Vercel Blob and returns a public URL.
//
// Why this exists:
//   On Vercel serverless, the platform enforces a hard ~4.5 MB request body cap.
//   Embedding images as base64 inside the quiz JSON payload blows past that cap
//   very quickly (a 2 MB image becomes ~2.7 MB after base64). We instead upload
//   each image individually here, store ONLY the resulting URL on the quiz
//   document, and keep the JSON payload tiny.
//
// Storage choice:
//   multer.memoryStorage() — disk is read-only on Vercel serverless functions,
//   so we hold the file in memory just long enough to forward its buffer to
//   Vercel Blob's `put()` and then drop it.
//
// Routing note:
//   This router is mounted in api/index.js at `/api/upload-image`. We register
//   handlers on BOTH `/` and `""` to make Express 5's stricter path matching
//   tolerate calls with and without a trailing slash. Without this, requests
//   to POST /api/upload-image (no trailing slash) return 404 in Express 5.
//
// Required env var (set in Vercel dashboard, not committed):
//   BLOB_READ_WRITE_TOKEN
// -----------------------------------------------------------------------------

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB hard cap per image

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      const err = new Error(
        "Only PNG, JPEG, WEBP, and GIF images are allowed."
      );
      err.code = "INVALID_MIME";
      return cb(err);
    }
    cb(null, true);
  },
});

// Generate a collision-resistant blob path. We keep the original extension so
// downstream consumers (e.g. <img>) can rely on Content-Type heuristics.
const buildBlobPath = (originalName = "image") => {
  const safeName = (originalName || "image")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `quiz-images/${ts}-${rand}-${safeName}`;
};

// Single shared handler — wired to multiple paths below to absorb Express 5
// trailing-slash strictness.
const handleUpload = (req, res) => {
  upload.single("file")(req, res, async (multerErr) => {
    if (multerErr) {
      let status = 400;
      let message = multerErr.message || "Invalid upload";

      if (multerErr.code === "LIMIT_FILE_SIZE") {
        status = 413;
        message = "File too large. Maximum allowed size is 10 MB.";
      } else if (multerErr.code === "INVALID_MIME") {
        status = 415;
      }

      return res.status(status).json({
        success: false,
        message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Expected multipart form field 'file'.",
        });
      }

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message:
            "Image upload is not configured: BLOB_READ_WRITE_TOKEN is missing on the server. Set it in your Vercel project's Environment Variables.",
        });
      }

      const path = buildBlobPath(req.file.originalname);

      const blob = await put(path, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({
        success: true,
        url: blob.url,
      });
    } catch (err) {
      console.error("[upload-image] failed:", err);
      return res.status(500).json({
        success: false,
        message: err?.message || "Failed to upload image",
      });
    }
  });
};

// Register against both bare and trailing-slash paths so the route resolves
// regardless of how the client formats the URL. Express 5's `strict` routing
// is off by default, but path-prefix mounting + sub-router "/" still has edge
// cases that have bitten us — being explicit removes the ambiguity.
router.post("/", handleUpload);
router.post("", handleUpload);

export default router;
