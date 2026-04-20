import express from "express";
import { Readable } from "stream";
import axios from "axios";

import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

// ===============================
// 🔥 Upload JSON to Cloudinary
// ===============================
const uploadToCloudinary = (buffer, public_id) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: `quizzes/${public_id}`,
        format: "json",
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

// ===============================
// ✅ CREATE QUIZ
// ===============================
router.post("/create-quiz", async (req, res) => {
  try {
    const {
      title,
      duration,
      eachMarks,
      negativeMarking,
      negativeValue,
      questions,
    } = req.body;

    // 🔐 AUTH CHECK
    if (!req.session?.user || req.session.user.roleLevel < 3) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🧪 VALIDATION
    if (!title || !questions || questions.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    if (!duration || duration < 1) {
      return res.json({ success: false, message: "Invalid duration" });
    }

    if (!eachMarks || eachMarks < 1) {
      return res.json({ success: false, message: "Invalid marks" });
    }

    if (negativeMarking && (!negativeValue || negativeValue >= 0)) {
      return res.json({ success: false, message: "Invalid negative marking" });
    }

    for (const q of questions) {
      if (!q.question && !q.questionImage) {
        return res.status(400).json({ success: false, message: "Empty question" });
      }

      if (!q.options || q.options.length !== 4) {
        return res.status(400).json({ success: false, message: "Invalid options" });
      }

      if (q.correctAnswer === "") {
        return res.status(400).json({ success: false, message: "Correct answer missing" });
      }
    }

    // 📊 CALCULATIONS
    const totalQuestions = questions.length;
    const totalMarks = totalQuestions * eachMarks;

    const timestamp = Date.now();
    const safeTitle = title.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${safeTitle}-${timestamp}`;

    const quizData = {
      title,
      duration,
      eachMarks,
      totalMarks,
      totalQuestions,
      negativeMarking,
      negativeValue: negativeMarking ? negativeValue : 0,
      createdAt: timestamp,
      scheduled: null,
      questions,
    };

    // ☁️ Upload to Cloudinary
    const buffer = Buffer.from(JSON.stringify(quizData));

    const result = await uploadToCloudinary(buffer, fileName);

    res.json({
      success: true,
      fileName,
      url: result.secure_url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create quiz" });
  }
});

// ===============================
// 📥 GET QUIZ
// ===============================
router.get("/quiz/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/quizzes/${fileName}.json`;

    const response = await axios.get(url);

    res.json({
      success: true,
      quiz: response.data,
    });

  } catch (err) {
    res.status(404).json({ success: false, message: "Quiz not found" });
  }
});

// ===============================
// ⏰ SCHEDULE QUIZ
// ===============================
router.post("/schedule-quiz", async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!req.session?.user || req.session.user.roleLevel < 3) {
      return res.status(401).json({ success: false });
    }

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "fileName is required",
      });
    }

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/quizzes/${fileName}.json`;

    const response = await axios.get(url);
    const quiz = response.data;

    // 🇮🇳 IST TIME
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const date = istTime.toISOString().split("T")[0];
    const time = istTime.toTimeString().slice(0, 5);

    quiz.scheduled = {
      date,
      time,
      timestamp: istTime.getTime(),
    };

    // 🔁 Re-upload updated quiz
    const buffer = Buffer.from(JSON.stringify(quiz));
    await uploadToCloudinary(buffer, fileName);

    res.json({
      success: true,
      scheduled: quiz.scheduled,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Schedule failed" });
  }
});

export default router;