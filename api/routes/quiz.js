import express from "express";
import multer from "multer";
import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const generateQuizCode = () => {
  const part = (len) =>
    Math.floor(Math.random() * Math.pow(10, len))
      .toString()
      .padStart(len, "0");

  return `${part(4)}-${part(5)}-${part(4)}`;
};


router.post("/create-quiz", async (req, res) => {
  try {
    const {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      questions,
      subject,
      categoryId,
      mockType,
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    let quizCode;
    let exists = true;

    // 🔥 ensure unique code
    while (exists) {
      quizCode = generateQuizCode();
      const existing = await Quiz.findOne({ quizCode });
      if (!existing) exists = false;
    }

    const newQuiz = new Quiz({
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      questions,
      quizCode,
      subject:    subject    || null,
      categoryId: categoryId || null,
      mockType:   mockType   || "full",
    });

    await newQuiz.save();

    res.json({
      success: true,
      fileName: newQuiz._id,
      quizCode, // 🔥 optional return
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.post("/schedule-quiz", async (req, res) => {
  try {
    const { fileName, scheduledAt } = req.body;

    if (!fileName || !scheduledAt) {
      return res.json({
        success: false,
        message: "Missing data",
      });
    }

    // 🔥 convert to Date object
    const scheduleDate = new Date(scheduledAt);

    // ❗ prevent past scheduling
    if (scheduleDate < new Date()) {
      return res.json({
        success: false,
        message: "Cannot schedule in the past",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      fileName,
      { scheduledAt: scheduleDate },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz scheduled successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.get("/all", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ scheduledAt: 1 });

    // ❌ No quizzes found
    if (!quizzes || quizzes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quiz data found",
        quizzes: [],
      });
    }

    // ✅ Data existsf
    res.json({
      success: true,
      quizzes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id/admin", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      quiz,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      questions,
      subject,
      categoryId,
      mockType,
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    const updateData = {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      questions,
    };
    if (subject    !== undefined) updateData.subject    = subject;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (mockType   !== undefined) updateData.mockType   = mockType;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      fileName: updatedQuiz._id,
      message: "Quiz updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!deletedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await QuizSubmission.deleteMany({ quizId: req.params.id });

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id/submissions", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select(
      "title questions eachMarks",
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const submissions = await QuizSubmission.find({
      quizId: req.params.id,
    }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        totalMarks: (quiz.questions?.length || 0) * (quiz.eachMarks || 1),
      },
      submissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // 🔥 BLOCK BEFORE SCHEDULE TIME
    if (quiz.scheduledAt && new Date() < quiz.scheduledAt) {
      return res.status(403).json({
        success: false,
        message: "Quiz not started yet",
        scheduledAt: quiz.scheduledAt,
      });
    }

    // 🔥 OPTIONAL: REMOVE CORRECT ANSWERS (anti-cheat)
    const safeQuestions = quiz.questions.map((q) => ({
      type: q.type,
      answerType: q.answerType || "single",
      question: q.question,
      questionHi: q.questionHi || "",
      questionImage: q.questionImage,
      options: q.options,
      optionsHi: q.optionsHi || [],
      // ❌ DO NOT SEND correctAnswer
    }));

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        duration: quiz.duration,
        eachMarks: quiz.eachMarks,
        negativeMarking: quiz.negativeMarking,
        negativeValue: quiz.negativeValue,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { quizId, answers, email } = req.body;

    if (!quizId || !answers || !email) {
      return res.json({
        success: false,
        message: "Missing data",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.json({
        success: false,
        message: "Quiz not found",
      });
    }

    // 🔥 CALCULATE SCORE + ANALYTICS
    let score = 0;
    const totalMarks = quiz.questions.filter((q) => q.type !== "section").length * quiz.eachMarks;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let negativeTotal = 0;

    answers.forEach((ans, i) => {
      const question = quiz.questions[i];
      if (question?.type === "section") return;
      const correctAns = question?.correctAnswer;
      const answerType = question?.answerType || "single";

      let hasAnswer =
        ans !== undefined &&
        ans !== null &&
        ans !== "";

      let isCorrect = false;

      // skipped
      if (!hasAnswer) {
        skipped++;
        return;
      }

      // Multiple correct
      if (answerType === "multiple") {
        const selected = Array.isArray(ans)
          ? ans.map(String).sort()
          : [];

        const correctAnswers = Array.isArray(correctAns)
          ? correctAns.map(String).sort()
          : [String(correctAns)];

        isCorrect =
          selected.length === correctAnswers.length &&
          selected.every(
            (value, index) => value === correctAnswers[index]
          );
      }

      // Descriptive
      else if (answerType === "descriptive") {
        isCorrect =
          String(ans).trim().toLowerCase() ===
          String(correctAns || "")
            .trim()
            .toLowerCase();
      }

      // Single correct
      else {
        isCorrect = String(ans) === String(correctAns);
      }

      if (isCorrect) {
        correct++;
        score += quiz.eachMarks;
      } else {
        wrong++;

        if (quiz.negativeMarking) {
          score += quiz.negativeValue; // negative deduction
          negativeTotal += Math.abs(quiz.negativeValue);
        }
      }
    });

    // 🔥 SAVE SUBMISSION
    const submission = new QuizSubmission({
      quizId,
      email,
      answers,
      score,
    });

    await submission.save();

    const breakdown = quiz.questions
      .map((q, origIdx) => ({ q, origIdx }))
      .filter(({ q }) => q.type !== "section")
      .map(({ q, origIdx }) => ({
        question: q.question,
        questionHi: q.questionHi || "",
        questionImage: q.questionImage || null,
        options: q.options,
        optionsHi: q.optionsHi || [],
        correctAnswer: q.correctAnswer,
        userAnswer: answers[origIdx] ?? null,
        answerType: q.answerType || "single",
      }));

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      score: {
        obtained: score,
        total: totalMarks,
        correct,
        wrong,
        skipped,
        negative: negativeTotal,
      },
      breakdown,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

function parsePdfText(rawText) {
  const NOISE = [
    "Join @Qmaths", "www.qmaths.in", "Toppers Choice", "koobkcalB",
    "Roll Number", "Candidate Name", "Venue Name", "Exam Date",
    "Exam Time", "Subject", "Combined Graduate Level Examination",
  ];

  const cleaned = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !NOISE.some((n) => l.includes(n)))
    .join("\n");

  // Find section positions
  const sectionPositions = [];
  const sectionRe = /Section\s*:\s*(.+)/g;
  let sm;
  while ((sm = sectionRe.exec(cleaned)) !== null) {
    sectionPositions.push({ pos: sm.index, name: sm[1].trim() });
  }

  // Split text into question blocks on Q.\d+
  const qRe = /Q\.(\d+)([\s\S]*?)(?=Q\.\d+|$)/g;
  const rawQuestions = [];
  let qm;

  while ((qm = qRe.exec(cleaned)) !== null) {
    const block = qm[2];
    const blockStart = qm.index;

    // Assign to nearest section (handles PDFs where section header appears after questions on page)
    let section = "";
    let bestDist = Infinity;
    for (const s of sectionPositions) {
      const dist = Math.abs(s.pos - blockStart);
      if (dist < bestDist) { bestDist = dist; section = s.name; }
    }

    // Split block: question text vs options area
    let qText = "";
    let optArea = block;

    const ansIdx = block.search(/\bAns\b/i);
    if (ansIdx > -1) {
      qText = block.slice(0, ansIdx).trim();
      // Remove "Ans" + trailing whitespace/tab so option 1 on same line is captured
      optArea = block.slice(ansIdx).replace(/^\s*Ans\s*[\t ]*/i, "");
    } else {
      const firstOptIdx = block.search(/^\s*[1-4]\.\s/m);
      if (firstOptIdx > -1) {
        qText = block.slice(0, firstOptIdx).trim();
        optArea = block.slice(firstOptIdx);
      }
    }

    // Extract options 1-4
    const opts = {};
    const optRe = /^\s*([1-4])\.\s*(.*)$/gm;
    let om;
    while ((om = optRe.exec(optArea)) !== null) {
      const val = om[2].trim();
      if (/Question ID|Status|Chosen/i.test(val)) break;
      if (!opts[om[1]]) opts[om[1]] = val;
    }

    // Extract correct answer (Chosen Option is 1-based → 0-based index)
    const chosenMatch = block.match(/Chosen Option\s*:?\s*(\d+)/i);
    const correctAnswer = chosenMatch ? String(parseInt(chosenMatch[1]) - 1) : "";

    const options = ["1", "2", "3", "4"].map((k) => ({ text: opts[k] || "", image: "" }));
    const hasChosenOption = Boolean(chosenMatch);

    rawQuestions.push({
      section,
      question: qText || (hasChosenOption ? "[IMAGE QUESTION]" : ""),
      options,
      correctAnswer,
    });
  }

  // Build final array with section separators
  const SECTION_DEFAULTS = {
    type: "section",
    questionHi: "",
    questionImage: "",
    options: [{ text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }],
    optionsHi: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctAnswer: "",
    answerType: "single",
  };

  const questions = [];
  let lastSection = "";

  for (const q of rawQuestions) {
    if (q.section && q.section !== lastSection) {
      questions.push({ ...SECTION_DEFAULTS, question: q.section });
      lastSection = q.section;
    }
    if (!q.question) continue;
    questions.push({
      type: "text",
      answerType: "single",
      question: q.question,
      questionHi: "",
      questionImage: "",
      options: q.options,
      optionsHi: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: q.correctAnswer,
    });
  }

  return questions;
}

// Detect file type by magic bytes (not MIME — MIME can lie)
function detectFileType(buffer) {
  // PDF: starts with %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "pdf";
  // DOCX/ZIP: starts with PK (50 4B 03 04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) return "docx";
  return "unknown";
}

// Unified endpoint — accepts both PDF and DOCX, auto-detects
router.post("/pdf-generate", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file || req.files?.file?.[0];
    if (!file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const fileType = detectFileType(file.buffer);
    console.log(`[pdf-generate] detected file type: ${fileType}, size: ${file.buffer.length}`);

    if (fileType === "docx") {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const rawText = result.value || "";
      if (!rawText.trim()) {
        return res.json({ success: false, message: "Could not extract text from DOCX" });
      }
      const questions = parseDocxText(rawText);
      if (questions.length === 0) {
        return res.json({ success: false, message: "No questions found in DOCX. Expected: Q1. [text] (A)...(D) Ans. X" });
      }
      return res.json({ success: true, questions });
    }

    if (fileType === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: file.buffer, verbosity: 0 });
      await parser.load();
      const pdfData = await parser.getText();
      const rawText = (pdfData.pages || []).map((p) => p.text || "").join("\n");

      if (!rawText.trim()) {
        return res.json({ success: false, message: "PDF appears scanned/image-based. No text extracted. Use text-based PDF." });
      }

      const pageCount = pdfData.pages?.length || 1;
      const avgCharsPerPage = rawText.trim().length / pageCount;
      if (avgCharsPerPage < 20) {
        return res.json({ success: false, message: `PDF appears scanned (avg ${Math.round(avgCharsPerPage)} chars/page). Use text-based PDF.` });
      }

      const questions = parsePdfText(rawText);
      if (questions.filter((q) => q.type !== "section").length === 0) {
        return res.json({ success: false, message: "No questions found in PDF. Expected pattern: Q.1 ... Ans 1. ... Chosen Option : 2" });
      }
      return res.json({ success: true, questions });
    }

    res.json({ success: false, message: "Unsupported file type. Upload a PDF or DOCX file." });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to process file: " + err.message });
  }
});

function hasDevanagari(str) {
  return /[ऀ-ॿ]/.test(str);
}

function splitEnHi(text) {
  // Find first Devanagari character position
  const match = text.match(/[ऀ-ॿ]/);
  if (!match) return { en: text.trim(), hi: "" };
  const idx = text.indexOf(match[0]);
  return { en: text.slice(0, idx).trim(), hi: text.slice(idx).trim() };
}

function parseDocxText(rawText) {
  const DEFAULTS = {
    type: "text",
    answerType: "single",
    questionImage: "",
  };

  // Split into question blocks on Q\d+. boundary
  const blocks = rawText.split(/(?=Q\d+\.)/);
  const questions = [];

  for (const block of blocks) {
    const qNumMatch = block.match(/^Q(\d+)\./);
    if (!qNumMatch) continue;

    // Body after "Q1."
    const body = block.replace(/^Q\d+\.\s*/, "");

    // Find where options start — first (A)
    const optStart = body.search(/\(A\)/);
    if (optStart === -1) continue;

    const questionArea = body.slice(0, optStart).trim();
    const optionArea = body.slice(optStart);

    // Split question area into EN and HI paragraphs
    const paragraphs = questionArea.split(/\n{2,}/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
    let qEn = "", qHi = "";
    for (const para of paragraphs) {
      if (hasDevanagari(para)) qHi = (qHi + " " + para).trim();
      else qEn = (qEn + " " + para).trim();
    }
    // If single paragraph with mixed EN+HI
    if (!qHi && hasDevanagari(qEn)) {
      const split = splitEnHi(qEn);
      qEn = split.en;
      qHi = split.hi;
    }

    // Parse (A)...(D) options
    const optRegex = /\(([A-D])\)\s*([\s\S]*?)(?=\([A-D]\)|Ans\.|$)/g;
    const optMap = {};
    let om;
    while ((om = optRegex.exec(optionArea)) !== null) {
      const letter = om[1];
      const content = om[2].replace(/\n/g, " ").trim();
      const split = splitEnHi(content);
      optMap[letter] = { en: split.en || content, hi: split.hi };
    }

    // Correct answer: Ans. A/B/C/D → 0-indexed
    const ansMatch = block.match(/Ans\.\s*([A-D])/i);
    const correctAnswer = ansMatch ? String("ABCD".indexOf(ansMatch[1].toUpperCase())) : "";

    const options = ["A", "B", "C", "D"].map((l) => ({
      text: optMap[l]?.en || "",
      image: "",
    }));
    const optionsHi = ["A", "B", "C", "D"].map((l) => ({
      text: optMap[l]?.hi || "",
    }));

    if (!qEn && !qHi) continue;

    questions.push({
      ...DEFAULTS,
      question: qEn || qHi,
      questionHi: qHi,
      options,
      optionsHi,
      correctAnswer,
    });
  }

  return questions;
}

router.post("/docx-generate", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const rawText = result.value || "";

    if (!rawText.trim()) {
      return res.json({ success: false, message: "Could not extract text from DOCX" });
    }

    const questions = parseDocxText(rawText);

    if (questions.length === 0) {
      return res.json({
        success: false,
        message: "No questions found. Expected format: Q1. [text] (A)...(D) Ans. X",
      });
    }

    res.json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to process DOCX: " + err.message });
  }
});

export default router;
