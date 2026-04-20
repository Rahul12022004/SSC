import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary, {
  generateSignedUrl,
  deleteFile,
} from "../utils/cloudinary.js";

const router = express.Router();

// ✅ Upload storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "SSC-cameraRecording",
    resource_type: "video",
  },
});

const upload = multer({ storage });

// -----------------------------
// ✅ Upload Video
// -----------------------------
router.post("/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    url: req.file.path,
  });
});

// -----------------------------
// ✅ Get all recordings (SIGNED URL)
// -----------------------------
router.get("/recordings", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder="SSC-cameraRecording"')
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute();

    const recordings = result.resources.map((file, index) => ({
      id: file.public_id,
      title: `Recording ${index + 1}`,
      url: generateSignedUrl(file.public_id, "video"), // 🔥 FIX
    }));

    res.json({
      success: true,
      total: recordings.length,
      recordings,
    });
  } catch (err) {
    console.error("Cloudinary error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recordings",
    });
  }
});

// -----------------------------
// 🗑 DELETE RECORDING
// -----------------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const public_id = req.params.id;

    const result = await deleteFile(public_id, "video");

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

export default router;