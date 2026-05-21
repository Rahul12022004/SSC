import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { put } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);
const ALLOWED_PDF_MIME   = new Set(["application/pdf"]);
const MAX_SIZE = 10 * 1024 * 1024;

// ── Local disk fallback (offline dev only) ───────────────────────────────────
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
};

const saveLocally = (buffer: Buffer, filename: string): string => {
  ensureUploadsDir();
  const safe = filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").replace(/-+/g, "-");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buffer);
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/${name}`;
};

// ── Cloudinary upload (production fallback when Vercel Blob not configured) ──
const uploadToCloudinary = (
  buffer: Buffer,
  options: object
): Promise<{ secure_url: string }> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(result as { secure_url: string });
      })
      .end(buffer);
  });

// ── Multer memory storage ─────────────────────────────────────────────────────
const buildPath = (prefix: string, name = "file") => {
  const safe = name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").replace(/-+/g, "-");
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safe}`;
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      const err = Object.assign(new Error("Only PNG, JPEG, WEBP, and GIF images are allowed."), { code: "INVALID_MIME" });
      return cb(err as unknown as null, false);
    }
    cb(null, true);
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_PDF_MIME.has(file.mimetype)) {
      const err = Object.assign(new Error("Only PDF files are allowed."), { code: "INVALID_MIME" });
      return cb(err as unknown as null, false);
    }
    cb(null, true);
  },
});

// ── Handlers ─────────────────────────────────────────────────────────────────
const handleImageUpload: RequestHandler = (req, res) => {
  imageUpload.single("file")(req, res, async (err) => {
    if (err) {
      const status = (err as { code?: string }).code === "LIMIT_FILE_SIZE" ? 413
        : (err as { code?: string }).code === "INVALID_MIME" ? 415 : 400;
      res.status(status).json({ success: false, message: err.message });
      return;
    }
    if (!req.file) { res.status(400).json({ success: false, message: "No file uploaded." }); return; }

    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(buildPath("quiz-images", req.file.originalname), req.file.buffer, {
          access: "public", contentType: req.file.mimetype, addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        res.json({ success: true, url: blob.url });
      } else if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await uploadToCloudinary(req.file.buffer, {
          public_id: buildPath("quiz-images", req.file.originalname),
          resource_type: "image",
        });
        res.json({ success: true, url: result.secure_url });
      } else {
        const url = saveLocally(req.file.buffer, req.file.originalname);
        res.json({ success: true, url });
      }
    } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
  });
};

const handleFileUpload: RequestHandler = (req, res) => {
  pdfUpload.single("file")(req, res, async (err) => {
    if (err) {
      const status = (err as { code?: string }).code === "LIMIT_FILE_SIZE" ? 413
        : (err as { code?: string }).code === "INVALID_MIME" ? 415 : 400;
      res.status(status).json({ success: false, message: err.message });
      return;
    }
    if (!req.file) { res.status(400).json({ success: false, message: "No file uploaded." }); return; }

    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(buildPath("solution-pdfs", req.file.originalname), req.file.buffer, {
          access: "public",
          contentType: "application/pdf",
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        res.json({ success: true, url: blob.url });
      } else if (process.env.NODE_ENV === "production") {
        res.status(500).json({ success: false, message: "BLOB_READ_WRITE_TOKEN is not configured. PDF uploads require Vercel Blob in production." });
      } else {
        const url = saveLocally(req.file.buffer, req.file.originalname);
        res.json({ success: true, url });
      }
    } catch (e) { res.status(500).json({ success: false, message: "Upload failed" }); }
  });
};

export const imageRouter = Router();
imageRouter.post("/", authenticateToken, requireAdmin, handleImageUpload);
imageRouter.post("", authenticateToken, requireAdmin, handleImageUpload);

export const fileRouter = Router();
fileRouter.post("/", authenticateToken, requireAdmin, handleFileUpload);
fileRouter.post("", authenticateToken, requireAdmin, handleFileUpload);
