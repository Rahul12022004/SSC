import { Router, type Request, type Response } from "express";
import multer from "multer";
import { z } from "zod";
import { Quiz } from '../models/quiz.model';
import { QuizSubmission } from '../models/quizSubmission.model';
import { QuizFeedback } from '../models/quizFeedback.model';
import { User } from '../models/user.model';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { submissionLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const richBlockSchema = z.object({
  type: z.string(),
  text: z.string(),
  level: z.number().optional(),
});

const questionSchema = z.object({
  type: z.string(),
  answerType: z.enum(["single", "multiple", "descriptive"]).default("single"),
  question: z.union([z.string(), z.array(richBlockSchema)]),
  questionHi: z.union([z.string(), z.array(richBlockSchema)]).optional(),
  questionImage: z.string().optional(),
  options: z.array(z.object({ text: z.string(), image: z.string().optional() })),
  optionsHi: z.array(z.object({ text: z.string() })).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  sectionTime: z.number().optional(),
  autoLock: z.boolean().optional(),
});

const createQuizSchema = z.object({
  title: z.string().min(1),
  duration: z.number().optional(),
  negativeMarking: z.boolean().optional(),
  negativeValue: z.number().optional(),
  eachMarks: z.number().optional(),
  autoLock: z.boolean().optional(),
  questions: z.array(questionSchema).min(1),
  subject: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  mockType: z.enum(["full", "sectional", "subject_wise"]).optional(),
  subSubjectId: z.string().optional().nullable(),
  mockGroupId: z.string().optional().nullable(),
  subjectCardId: z.string().optional().nullable(),
});

const updateQuizSchema = createQuizSchema;

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const generateQuizCode = (): string => {
  const part = (len: number): string =>
    Math.floor(Math.random() * Math.pow(10, len))
      .toString()
      .padStart(len, "0");
  return `${part(4)}-${part(5)}-${part(4)}`;
};

interface RichBlock {
  type?: string;
  level?: number;
  text?: string;
}

const sanitizeRichQuestionContent = (value: unknown): any => {
  if (!Array.isArray(value)) {
    return typeof value === "string" ? value : "";
  }

  return (value as RichBlock[])
    .map((block) => {
      if (!block || typeof block !== "object") return null;

      const text = typeof block.text === "string" ? block.text : "";

      if (block.type === "heading") {
        const level = Number(block.level);
        return {
          type: "heading",
          level: [1, 2, 3, 4].includes(level) ? level : 1,
          text,
        };
      }

      if (["paragraph", "bullet", "numbered"].includes(block.type ?? "")) {
        return { type: block.type, text };
      }

      return null;
    })
    .filter((b) => b !== null);
};

const sanitizeQuestions = (questions: any[] = []): any[] =>
  questions.map((q) => {
    const cleaned: any = {
      type: q.type,
      answerType: q.answerType || "single",
      question:
        q.type === "section"
          ? q.question || ""
          : sanitizeRichQuestionContent(q.question),
      questionHi:
        q.type === "section"
          ? q.questionHi || ""
          : sanitizeRichQuestionContent(q.questionHi),
      questionImage: q.questionImage || "",
      options: Array.isArray(q.options)
        ? q.options.map((opt: any) => ({
            text: opt?.text || "",
            image: opt?.image || "",
          }))
        : [],
      correctAnswer: q.correctAnswer ?? "",
    };

    if (q.type === "section") {
      cleaned.sectionTime = Number(q.sectionTime) || 0;
      cleaned.autoLock = Boolean(q.autoLock) || false;
    }

    if (Array.isArray(q.optionsHi) && q.optionsHi.some((o: any) => o?.text)) {
      cleaned.optionsHi = q.optionsHi.map((o: any) => ({ text: o?.text || "" }));
    }

    return cleaned;
  });

router.post("/create-quiz", authenticateToken, requireAdmin, validate(createQuizSchema), async (req: Request, res: Response) => {
  try {
    const {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      autoLock,
      questions,
      subject,
      categoryId,
      mockType,
      subSubjectId,
      mockGroupId,
      subjectCardId,
    } = req.body as Record<string, any>;

    if (!title || !questions || questions.length === 0) {
      res.json({ success: false, message: "Invalid data" });
      return;
    }

    const cleanQuestions = sanitizeQuestions(questions);

    let quizCode: string;
    let exists = true;

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
      autoLock: Boolean(autoLock),
      questions: cleanQuestions,
      quizCode: quizCode!,
      subject:       subject       || null,
      categoryId:    categoryId    || null,
      mockType:      mockType      || "full",
      subSubjectId:  subSubjectId  || null,
      mockGroupId:   mockGroupId   || null,
      subjectCardId: subjectCardId || null,
    });

    await newQuiz.save();

    res.json({ success: true, fileName: newQuiz._id, quizCode: quizCode! });
  } catch (err: any) {
    console.error(err);
    if (err?.type === "entity.too.large" || err?.status === 413) {
      res.status(413).json({
        success: false,
        message:
          "Quiz payload too large. Please upload images via the image uploader (Cloudinary) instead of pasting/embedding them directly.",
      });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/save-solution-pdf", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { quizId, solutionPdfUrl, solutionAvailableAt } = req.body as Record<string, any>;
    if (!quizId || !solutionPdfUrl) {
      res.json({ success: false, message: "Missing quizId or solutionPdfUrl" });
      return;
    }
    const update: Record<string, any> = { solutionPdfUrl };
    if (solutionAvailableAt) {
      update.solutionAvailableAt = new Date(solutionAvailableAt);
    }
    const updated = await Quiz.findByIdAndUpdate(quizId, update, { new: true });
    if (!updated) { res.json({ success: false, message: "Quiz not found" }); return; }
    res.json({ success: true, message: "Solution PDF saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/schedule-quiz", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { fileName, scheduledAt, endsAt, solutionPdfUrl, solutionAvailableAt } = req.body as Record<string, any>;

    if (!fileName || !scheduledAt) {
      res.json({ success: false, message: "Missing data" });
      return;
    }

    const scheduleDate = new Date(scheduledAt);

    if (scheduleDate < new Date()) {
      res.json({ success: false, message: "Cannot schedule in the past" });
      return;
    }

    const update: Record<string, any> = { scheduledAt: scheduleDate };
    if (endsAt) {
      const endDate = new Date(endsAt);
      if (endDate <= scheduleDate) {
        res.json({ success: false, message: "End time must be after start time" });
        return;
      }
      update.endsAt = endDate;
    }

    if (solutionPdfUrl) update.solutionPdfUrl = solutionPdfUrl;
    if (solutionAvailableAt) update.solutionAvailableAt = new Date(solutionAvailableAt);

    const updatedQuiz = await Quiz.findByIdAndUpdate(fileName, update, { new: true });

    if (!updatedQuiz) {
      res.json({ success: false, message: "Quiz not found" });
      return;
    }

    res.json({ success: true, message: "Quiz scheduled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/all", async (_req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find()
      .select("-questions")
      .sort({ scheduledAt: 1 })
      .lean();

    if (!quizzes || quizzes.length === 0) {
      res.status(200).json({ success: true, message: "No quiz data found", quizzes: [] });
      return;
    }

    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/by-subject/:subject", async (req: Request, res: Response) => {
  try {
    const subject = String(req.params.subject);
    const quizzes = await Quiz.find({
      subject: { $regex: new RegExp(`^${escapeRegex(subject)}$`, "i") },
    }).sort({ createdAt: -1 });

    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { categoryId, subjectId, mockType, mockGroupId } = req.query as Record<string, string | undefined>;

    const filter: Record<string, any> = {};
    if (categoryId) filter.categoryId = categoryId;
    if (subjectId)  filter.subject    = subjectId;
    if (mockType)   filter.mockType   = mockType;

    if (mockGroupId) {
      filter.mockGroupId = mockGroupId;
    } else if (mockGroupId === "") {
      filter.$or = [{ mockGroupId: null }, { mockGroupId: { $exists: false } }];
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/admin", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    res.json({ success: true, quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", authenticateToken, requireAdmin, validate(updateQuizSchema), async (req: Request, res: Response) => {
  try {
    const {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      autoLock,
      questions,
      subject,
      categoryId,
      mockType,
      subSubjectId,
      mockGroupId,
      subjectCardId,
    } = req.body as Record<string, any>;

    if (!title || !questions || questions.length === 0) {
      res.json({ success: false, message: "Invalid data" });
      return;
    }

    const updateData: Record<string, any> = {
      title,
      duration,
      negativeMarking,
      negativeValue,
      eachMarks,
      autoLock: Boolean(autoLock),
      questions: sanitizeQuestions(questions),
    };
    if (subject      !== undefined) updateData.subject      = subject;
    if (categoryId   !== undefined) updateData.categoryId   = categoryId;
    if (mockType     !== undefined) updateData.mockType     = mockType;
    if (subSubjectId !== undefined) updateData.subSubjectId = subSubjectId;
    if (mockGroupId  !== undefined) updateData.mockGroupId  = mockGroupId;
    if (subjectCardId !== undefined) updateData.subjectCardId = subjectCardId;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    );

    if (!updatedQuiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    res.json({ success: true, fileName: updatedQuiz._id, message: "Quiz updated successfully" });
  } catch (err: any) {
    console.error(err);
    if (err?.type === "entity.too.large" || err?.status === 413) {
      res.status(413).json({
        success: false,
        message:
          "Quiz payload too large. Please upload images via the image uploader (Cloudinary) instead of pasting/embedding them directly.",
      });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/:id/move", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { subject, categoryId, mockGroupId, subSubjectId, mockType } = req.body as Record<string, any>;

    const updateData: Record<string, any> = {};
    if (subject      !== undefined) updateData.subject      = subject      || null;
    if (categoryId   !== undefined) updateData.categoryId   = categoryId   || null;
    if (mockGroupId  !== undefined) updateData.mockGroupId  = mockGroupId  || null;
    if (subSubjectId !== undefined) updateData.subSubjectId = subSubjectId || null;
    if (mockType     !== undefined) updateData.mockType     = mockType;

    const updated = await Quiz.findByIdAndUpdate(req.params.id, updateData, { returnDocument: "after" });

    if (!updated) { res.status(404).json({ success: false, message: "Quiz not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!deletedQuiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    await QuizSubmission.deleteMany({ quizId: req.params.id });

    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/admin/results-overview", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [quizzes, counts] = await Promise.all([
      Quiz.aggregate([
        {
          $project: {
            title: 1,
            subject: 1,
            mockType: { $ifNull: ["$mockType", "full"] },
            scheduledAt: 1,
            endsAt: 1,
            eachMarks: 1,
            createdAt: 1,
            nonSectionCount: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$questions", []] },
                  as: "q",
                  cond: { $ne: ["$$q.type", "section"] },
                },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
      QuizSubmission.aggregate([
        { $group: { _id: "$quizId", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
      ]),
    ]);

    const countMap: Record<string, { count: number; avgScore: number }> = {};
    counts.forEach((c: any) => { countMap[String(c._id)] = { count: c.count, avgScore: c.avgScore }; });

    const result = quizzes.map((q: any) => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      mockType: q.mockType,
      totalMarks: q.nonSectionCount * (q.eachMarks || 1),
      createdAt: q.createdAt,
      submissions: countMap[String(q._id)]?.count || 0,
      avgScore: countMap[String(q._id)]?.avgScore || 0,
    }));

    res.json({ success: true, quizzes: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/submissions", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("title questions eachMarks");
    if (!quiz) { res.status(404).json({ success: false, message: "Quiz not found" }); return; }
    const submissions = await QuizSubmission.find({ quizId: req.params.id }).sort({ submittedAt: -1 }).lean();

    const emails = [...new Set((submissions as any[]).map((s) => s.email))];
    const users = await User.find({ email: { $in: emails } }).select("email firstName lastName").lean();
    const userMap: Record<string, string> = {};
    (users as any[]).forEach((u) => { userMap[u.email] = `${u.firstName || ""} ${u.lastName || ""}`.trim(); });

    const enriched = (submissions as any[]).map((s) => ({
      ...s,
      studentName: userMap[s.email] || "",
    }));

    res.json({
      success: true,
      quiz: {
        _id: (quiz as any)._id,
        title: (quiz as any).title,
        totalMarks: ((quiz as any).questions?.filter((q: any) => q.type !== "section").length || 0) * ((quiz as any).eachMarks || 1),
      },
      submissions: enriched,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/my-rank", authenticateToken, async (req: Request, res: Response) => {
  try {
    const quizId = req.params.id;
    if (!String(quizId).match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: "Invalid quiz ID" });
      return;
    }
    const email = req.user!.email;
    const submission = await QuizSubmission.findOne({ quizId, email })
      .select("score timeTaken rank percentile")
      .lean();
    if (!submission) {
      res.json({ success: false, message: "No submission found" });
      return;
    }

    if ((submission as any).rank != null && (submission as any).percentile != null) {
      const totalUsers = await QuizSubmission.countDocuments({ quizId });
      res.json({ success: true, rank: (submission as any).rank, totalUsers, percentile: (submission as any).percentile });
      return;
    }

    const [totalUsers, lowerCount, betterCount] = await Promise.all([
      QuizSubmission.countDocuments({ quizId }),
      QuizSubmission.countDocuments({ quizId, score: { $lt: (submission as any).score } }),
      QuizSubmission.countDocuments({
        quizId,
        $or: [
          { score: { $gt: (submission as any).score } },
          { score: (submission as any).score, timeTaken: { $lt: (submission as any).timeTaken || 0 } },
        ],
      }),
    ]);
    const rank = betterCount + 1;
    const percentile = totalUsers <= 1
      ? 100.0
      : Math.round((lowerCount / totalUsers) * 10000) / 100;

    res.json({ success: true, rank, totalUsers, percentile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/solution-pdf", async (req: Request, res: Response) => {
  try {
    if (!String(req.params.id).match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: "Invalid quiz ID" });
      return;
    }
    const quiz = await Quiz.findById(req.params.id).select("solutionPdfUrl solutionAvailableAt endsAt").lean();
    if (!quiz) { res.status(404).json({ success: false, message: "Quiz not found" }); return; }

    const now = new Date();
    const solutionBlocked = (quiz as any).solutionAvailableAt && now < new Date((quiz as any).solutionAvailableAt);

    res.json({ success: true, solutionPdfUrl: solutionBlocked ? null : ((quiz as any).solutionPdfUrl || null) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (!String(req.params.id).match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: "Invalid quiz ID format" });
      return;
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    if ((quiz as any).scheduledAt && new Date() < (quiz as any).scheduledAt) {
      res.status(403).json({
        success: false,
        message: "Quiz not started yet",
        scheduledAt: (quiz as any).scheduledAt,
      });
      return;
    }

    if ((quiz as any).endsAt && new Date() > (quiz as any).endsAt) {
      res.status(403).json({
        success: false,
        message: "Quiz has ended",
        endsAt: (quiz as any).endsAt,
      });
      return;
    }

    const safeQuestions = (quiz as any).questions.map((q: any) => ({
      type: q.type,
      answerType: q.answerType || "single",
      question: q.question,
      questionHi: q.questionHi || "",
      questionImage: q.questionImage,
      options: q.options,
      optionsHi: q.optionsHi || [],
      sectionTime: q.sectionTime || 0,
      autoLock: q.autoLock || false,
    }));

    let solutionAvailable = false;
    if ((quiz as any).solutionPdfUrl && (quiz as any).solutionAvailableAt) {
      solutionAvailable = new Date() >= (quiz as any).solutionAvailableAt;
    }

    res.json({
      success: true,
      quiz: {
        _id: (quiz as any)._id,
        title: (quiz as any).title,
        duration: (quiz as any).duration,
        eachMarks: (quiz as any).eachMarks,
        negativeMarking: (quiz as any).negativeMarking,
        negativeValue: (quiz as any).negativeValue,
        autoLock: (quiz as any).autoLock,
        feedbackEnabled: (quiz as any).feedbackEnabled !== false,
        questions: safeQuestions,
        solutionAvailable,
        solutionPdfUrl: solutionAvailable ? (quiz as any).solutionPdfUrl : null,
        endsAt: (quiz as any).endsAt || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/submit", authenticateToken, submissionLimiter, async (req: Request, res: Response) => {
  try {
    const { quizId, answers, timeTaken } = req.body as Record<string, any>;
    const email = req.user!.email;

    if (!quizId || !answers) {
      res.status(400).json({ success: false, message: "Missing data" });
      return;
    }

    if (!String(quizId).match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: "Invalid quiz ID" });
      return;
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    if ((quiz as any).endsAt && new Date() > (quiz as any).endsAt) {
      res.status(403).json({ success: false, message: "Quiz has ended" });
      return;
    }

    const isAdmin = req.user!.role === "admin" || req.user!.roleLevel >= 10;

    if (!isAdmin) {
      const existingSubmission = await QuizSubmission.findOne({ quizId, email });
      if (existingSubmission) {
        res.status(409).json({ success: false, message: "You have already submitted this quiz" });
        return;
      }
    }

    if (!Array.isArray(answers)) {
      res.status(400).json({ success: false, message: "Invalid answers format" });
      return;
    }

    let score = 0;
    const totalMarks = (quiz as any).questions.filter((q: any) => q.type !== "section").length * (quiz as any).eachMarks;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let negativeTotal = 0;

    answers.forEach((ans: any, i: number) => {
      const question = (quiz as any).questions[i];
      if (question?.type === "section") return;
      const correctAns = question?.correctAnswer;
      const answerType = question?.answerType || "single";

      const hasAnswer = ans !== undefined && ans !== null && ans !== "";

      if (!hasAnswer) {
        skipped++;
        return;
      }

      let isCorrect = false;

      if (answerType === "multiple") {
        const selected = Array.isArray(ans) ? ans.map(String).sort() : [];
        const correctAnswers = Array.isArray(correctAns) ? correctAns.map(String).sort() : [String(correctAns)];
        isCorrect = selected.length === correctAnswers.length && selected.every((v, idx) => v === correctAnswers[idx]);
      } else if (answerType === "descriptive") {
        isCorrect = String(ans).trim().toLowerCase() === String(correctAns || "").trim().toLowerCase();
      } else {
        isCorrect = String(ans) === String(correctAns);
      }

      if (isCorrect) {
        correct++;
        score += (quiz as any).eachMarks;
      } else {
        wrong++;
        if ((quiz as any).negativeMarking) {
          score += (quiz as any).negativeValue;
          negativeTotal += Math.abs((quiz as any).negativeValue);
        }
      }
    });

    let submissionId: any = null;
    if (!isAdmin) {
      try {
        const submission = new QuizSubmission({
          quizId,
          email,
          answers,
          score,
          timeTaken: typeof timeTaken === "number" && timeTaken > 0 ? Math.round(timeTaken) : 0,
        });
        await submission.save();
        submissionId = submission._id;
      } catch (saveErr) {
        console.error("Error saving submission:", saveErr);
        throw saveErr;
      }
    }

    let rank = 1;
    let totalUsers = 1;
    let percentile = 100;
    let rankInsight: string | null = null;

    if (!isAdmin) {
      try {
        const [total, lowerCount, betterCount] = await Promise.all([
          QuizSubmission.countDocuments({ quizId }),
          QuizSubmission.countDocuments({ quizId, score: { $lt: score } }),
          QuizSubmission.countDocuments({
            quizId,
            $or: [
              { score: { $gt: score } },
              { score: score, timeTaken: { $lt: timeTaken || 0 } },
            ],
          }),
        ]);

        totalUsers = total;
        rank = betterCount + 1;
        percentile = totalUsers <= 1
          ? 100.0
          : Math.round((lowerCount / totalUsers) * 10000) / 100;

        if (submissionId) {
          QuizSubmission.findByIdAndUpdate(submissionId, { rank, percentile }).catch(() => {});
        }

        if (rank === 1) {
          rankInsight = "You're Rank #1! Top of the leaderboard! 🏆";
        } else {
          const personAbove = await QuizSubmission.findOne({
            quizId,
            $or: [
              { score: { $gt: score } },
              { score: score, timeTaken: { $lt: timeTaken || 0 } },
            ],
          }).sort({ score: -1, timeTaken: 1 }).limit(1).select("score").lean();

          if (personAbove) {
            const marksNeeded = Number(((personAbove as any).score - score).toFixed(2));
            rankInsight = marksNeeded > 0
              ? `You were just ${marksNeeded} mark${marksNeeded !== 1 ? "s" : ""} away from Rank #${rank - 1} 🚀`
              : "You could improve your rank by finishing faster next time ⚡";
          }
        }
      } catch (rankErr: any) {
        console.error("[rank] calculation failed:", rankErr.message);
      }
    } else {
      rankInsight = "Admin Test Mode - Results not saved";
    }

    const breakdown = (quiz as any).questions
      .map((q: any, origIdx: number) => ({ q, origIdx }))
      .filter(({ q }: { q: any }) => q.type !== "section")
      .map(({ q, origIdx }: { q: any; origIdx: number }) => ({
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
      message: isAdmin ? "Quiz submitted (Admin Test Mode - Not Saved)" : "Quiz submitted successfully",
      score: { obtained: score, total: totalMarks, correct, wrong, skipped, negative: negativeTotal },
      rank,
      totalUsers,
      percentile,
      rankInsight,
      breakdown,
      isAdminTest: isAdmin,
      solutionPdfUrl: (quiz as any).solutionPdfUrl || null,
    });
  } catch (err) {
    console.error("[QUIZ SUBMIT ERROR]:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const { quizId, email, userName, quizTitle, rating, feedback } = req.body as Record<string, any>;

    if (!quizId || !email || !userName || !quizTitle || !rating || !feedback) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      return;
    }

    const existing = await QuizFeedback.findOne({ quizId, email });
    if (existing) {
      res.status(409).json({ success: false, message: "You have already submitted feedback for this quiz" });
      return;
    }

    const newFeedback = new QuizFeedback({
      quizId,
      email,
      userName,
      quizTitle,
      rating,
      feedback: feedback.trim(),
    });

    await newFeedback.save();

    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/feedback/all", authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const feedbacks = await QuizFeedback.find().sort({ submittedAt: -1 }).lean();
    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/feedback/check/:quizId/:email", async (req: Request, res: Response) => {
  try {
    const { quizId, email } = req.params;
    const feedback = await QuizFeedback.findOne({ quizId, email });
    res.json({ success: true, hasFeedback: !!feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/:id/toggle-feedback", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { feedbackEnabled } = req.body as { feedbackEnabled: boolean };

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { feedbackEnabled: Boolean(feedbackEnabled) },
      { returnDocument: "after" }
    );

    if (!quiz) {
      res.status(404).json({ success: false, message: "Quiz not found" });
      return;
    }

    res.json({ success: true, feedbackEnabled: (quiz as any).feedbackEnabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

interface SectionPosition {
  pos: number;
  name: string;
}

interface ParsedQuestion {
  section: string;
  question: string;
  questionHi: string;
  options: { text: string; image: string }[];
  optionsHi: { text: string }[];
  correctAnswer: string;
}

function parsePdfText(rawText: string): any[] {
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

  const sectionPositions: SectionPosition[] = [];
  const sectionRe = /Section\s*:\s*(.+)/g;
  let sm: RegExpExecArray | null;
  while ((sm = sectionRe.exec(cleaned)) !== null) {
    sectionPositions.push({ pos: sm.index, name: sm[1].trim() });
  }

  const qRe = /Q\.?\s*(\d+)[\.\)\-:]?\s*([\s\S]*?)(?=Q\.?\s*\d+[\.\)\-:]?|$)/g;
  const rawQuestions: ParsedQuestion[] = [];
  let qm: RegExpExecArray | null;

  while ((qm = qRe.exec(cleaned)) !== null) {
    const block = qm[2];
    const blockStart = qm.index;

    let section = "";
    let bestDist = Infinity;
    for (const s of sectionPositions) {
      const dist = Math.abs(s.pos - blockStart);
      if (dist < bestDist) { bestDist = dist; section = s.name; }
    }

    const hasParenOpts  = /\(A\)/i.test(block);
    const hasLetterDots = /^A\.\s/m.test(block);
    const hasNumberOpts = /^\s*[1-4]\.\s/m.test(block);

    let qText = "";
    let optArea = block;
    const opts: Record<string, string> = {};
    let correctAnswer = "";

    const optsHi: Record<string, string> = {};
    let qHi = "";

    if (hasParenOpts) {
      const optStart = block.search(/\(A\)/i);
      const rawQ = block.slice(0, optStart).trim();
      const qSplit = splitEnHi(rawQ);
      qText = qSplit.en || rawQ;
      qHi = qSplit.hi;

      optArea = block.slice(optStart);
      const optRe = /\(([A-D])\)\s*([\s\S]*?)(?=\([A-D]\)|Ans\b|Answer\b|$)/gi;
      let om: RegExpExecArray | null;
      while ((om = optRe.exec(optArea)) !== null) {
        const key = om[1].toUpperCase();
        const content = om[2].replace(/\n/g, " ").trim();
        const oSplit = splitEnHi(content);
        opts[key] = oSplit.en || content;
        optsHi[key] = oSplit.hi;
      }
      const ansMatch = block.match(/(?:Ans|Answer)\s*[.:]?\s*\(?([A-D])\)?/i)
        || block.match(/Chosen Option\s*:?\s*(\d+)/i);
      if (ansMatch) {
        const v = ansMatch[1];
        correctAnswer = /[A-D]/i.test(v)
          ? String("ABCD".indexOf(v.toUpperCase()))
          : String(parseInt(v, 10) - 1);
      }
    } else if (hasLetterDots) {
      const optStart = block.search(/^A\.\s/m);
      const rawQ = block.slice(0, optStart).trim();
      const qSplit = splitEnHi(rawQ);
      qText = qSplit.en || rawQ;
      qHi = qSplit.hi;

      optArea = block.slice(optStart);
      const optRe = /^([A-D])\.\s*(.*)$/gm;
      let om: RegExpExecArray | null;
      while ((om = optRe.exec(optArea)) !== null) {
        const key = om[1].toUpperCase();
        const content = om[2].trim();
        const oSplit = splitEnHi(content);
        opts[key] = oSplit.en || content;
        optsHi[key] = oSplit.hi;
      }
      const ansMatch = block.match(/(?:Ans|Answer)\s*[.:]?\s*\(?([A-D])\)?/i);
      if (ansMatch) correctAnswer = String("ABCD".indexOf(ansMatch[1].toUpperCase()));
    } else {
      const ansIdx = block.search(/\bAns\b/i);
      if (ansIdx > -1) {
        qText = block.slice(0, ansIdx).trim();
        optArea = block.slice(ansIdx).replace(/^\s*Ans\s*[\t ]*/i, "");
      } else if (hasNumberOpts) {
        const firstOptIdx = block.search(/^\s*[1-4]\.\s/m);
        qText = block.slice(0, firstOptIdx).trim();
        optArea = block.slice(firstOptIdx);
      }
      const optRe = /^\s*([1-4])\.\s*(.*)$/gm;
      let om: RegExpExecArray | null;
      while ((om = optRe.exec(optArea)) !== null) {
        const val = om[2].trim();
        if (/Question ID|Status|Chosen/i.test(val)) break;
        if (!opts[om[1]]) opts[om[1]] = val;
      }
      const chosenMatch = block.match(/Chosen Option\s*:?\s*(\d+)/i);
      if (chosenMatch) {
        correctAnswer = String(parseInt(chosenMatch[1], 10) - 1);
      } else {
        const ansMatch = block.match(/(?:Ans|Answer)\s*[.:]?\s*\(?([A-D])\)?/i);
        if (ansMatch) correctAnswer = String("ABCD".indexOf(ansMatch[1].toUpperCase()));
      }
    }

    const keys = (hasParenOpts || hasLetterDots) ? ["A", "B", "C", "D"] : ["1", "2", "3", "4"];
    const options = keys.map((k) => ({ text: opts[k] || "", image: "" }));
    const optionsHiArr = keys.map((k) => ({ text: optsHi[k] || "" }));
    const hasAnswer = correctAnswer !== "";

    rawQuestions.push({
      section,
      question: qText || (hasAnswer ? "[IMAGE QUESTION]" : ""),
      questionHi: qHi,
      options,
      optionsHi: optionsHiArr,
      correctAnswer,
    });
  }

  const SECTION_DEFAULTS = {
    type: "section",
    questionHi: "",
    questionImage: "",
    options: [{ text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }, { text: "", image: "" }],
    optionsHi: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctAnswer: "",
    answerType: "single",
  };

  const questions: any[] = [];
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
      questionHi: q.questionHi || "",
      questionImage: "",
      options: q.options,
      optionsHi: q.optionsHi || [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: q.correctAnswer,
    });
  }

  return questions;
}

function detectFileType(buffer: Buffer): "pdf" | "docx" | "unknown" {
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "pdf";
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) return "docx";
  return "unknown";
}

router.post("/pdf-generate", authenticateToken, requireAdmin, upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    const filesDict = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const file = req.file ?? filesDict?.file?.[0];
    if (!file) {
      res.json({ success: false, message: "No file uploaded" });
      return;
    }

    const fileType = detectFileType(file.buffer);

    if (fileType === "docx") {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const rawText = result.value || "";
      if (!rawText.trim()) {
        res.json({ success: false, message: "Could not extract text from DOCX" });
        return;
      }
      const questions = parseDocxText(rawText);
      if (questions.length === 0) {
        res.json({ success: false, message: "No questions found in DOCX. Expected: Q1. [text] (A)...(D) Ans. X" });
        return;
      }
      res.json({ success: true, questions });
      return;
    }

    if (fileType === "pdf") {
      const { PDFParse } = await import("pdf-parse") as any;
      const parser = new PDFParse({ data: file.buffer, verbosity: 0 });
      await parser.load();
      const pdfData = await parser.getText();
      const rawText = (pdfData.pages || []).map((p: any) => p.text || "").join("\n");

      if (!rawText.trim()) {
        res.json({ success: false, message: "PDF appears scanned/image-based. No text extracted. Use text-based PDF." });
        return;
      }

      const pageCount = pdfData.pages?.length || 1;
      const avgCharsPerPage = rawText.trim().length / pageCount;
      if (avgCharsPerPage < 20) {
        res.json({ success: false, message: `PDF appears scanned (avg ${Math.round(avgCharsPerPage)} chars/page). Use text-based PDF.` });
        return;
      }

      const questions = parsePdfText(rawText);
      if (questions.filter((q: any) => q.type !== "section").length === 0) {
        res.json({ success: false, message: "No questions found in PDF. Supported formats: Q.1/Q1./Q1) with options (A)(B)(C)(D) or A./B. or 1./2. and answer Ans. B or Chosen Option : 2" });
        return;
      }
      res.json({ success: true, questions });
      return;
    }

    res.json({ success: false, message: "Unsupported file type. Upload a PDF or DOCX file." });
  } catch (err: any) {
    console.error(err);
    res.json({ success: false, message: "Failed to process file: " + err.message });
  }
});

function hasDevanagari(str: string): boolean {
  return /[ऀ-ॿ]/.test(str);
}

function splitEnHi(text: string): { en: string; hi: string } {
  const match = text.match(/[ऀ-ॿ]/);
  if (!match) return { en: text.trim(), hi: "" };
  const idx = text.indexOf(match[0]);
  return { en: text.slice(0, idx).trim(), hi: text.slice(idx).trim() };
}

function parseDocxText(rawText: string): any[] {
  const DEFAULTS = {
    type: "text",
    answerType: "single",
    questionImage: "",
  };

  const blocks = rawText.split(/(?=Q\d+\.)/);
  const questions: any[] = [];

  for (const block of blocks) {
    const qNumMatch = block.match(/^Q(\d+)\./);
    if (!qNumMatch) continue;

    const body = block.replace(/^Q\d+\.\s*/, "");

    const optStart = body.search(/\(A\)/);
    if (optStart === -1) continue;

    const questionArea = body.slice(0, optStart).trim();
    const optionArea = body.slice(optStart);

    const paragraphs = questionArea.split(/\n{2,}/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
    let qEn = "", qHi = "";
    for (const para of paragraphs) {
      if (hasDevanagari(para)) qHi = (qHi + " " + para).trim();
      else qEn = (qEn + " " + para).trim();
    }
    if (!qHi && hasDevanagari(qEn)) {
      const split = splitEnHi(qEn);
      qEn = split.en;
      qHi = split.hi;
    }

    const optRegex = /\(([A-D])\)\s*([\s\S]*?)(?=\([A-D]\)|Ans\.|$)/g;
    const optMap: Record<string, { en: string; hi: string }> = {};
    let om: RegExpExecArray | null;
    while ((om = optRegex.exec(optionArea)) !== null) {
      const letter = om[1];
      const content = om[2].replace(/\n/g, " ").trim();
      const split = splitEnHi(content);
      optMap[letter] = { en: split.en || content, hi: split.hi };
    }

    const ansMatch = block.match(/Ans\.\s*([A-D])/i);
    const correctAnswer = ansMatch ? String("ABCD".indexOf(ansMatch[1].toUpperCase())) : "";

    const options = ["A", "B", "C", "D"].map((l) => ({ text: optMap[l]?.en || "", image: "" }));
    const optionsHi = ["A", "B", "C", "D"].map((l) => ({ text: optMap[l]?.hi || "" }));

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

router.post("/docx-generate", authenticateToken, requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.json({ success: false, message: "No file uploaded" });
      return;
    }

    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const rawText = result.value || "";

    if (!rawText.trim()) {
      res.json({ success: false, message: "Could not extract text from DOCX" });
      return;
    }

    const questions = parseDocxText(rawText);

    if (questions.length === 0) {
      res.json({ success: false, message: "No questions found. Expected format: Q1. [text] (A)...(D) Ans. X" });
      return;
    }

    res.json({ success: true, questions });
  } catch (err: any) {
    console.error(err);
    res.json({ success: false, message: "Failed to process DOCX: " + err.message });
  }
});

export default router;
