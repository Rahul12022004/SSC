import express from "express";
import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";

const router = express.Router();

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
      quizCode, // 🔥 save code
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
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        duration,
        negativeMarking,
        negativeValue,
        eachMarks,
        questions,
      },
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
      questionImage: q.questionImage,
      options: q.options,
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
    const totalMarks = quiz.questions.length * quiz.eachMarks;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let negativeTotal = 0;

    answers.forEach((ans, i) => {
      const question = quiz.questions[i];
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
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
