import mongoose from "mongoose";

// -----------------------------------------------------------------------------
// NOTE: `image` and `questionImage` store ONLY public URLs (e.g. Vercel Blob
// URLs returned from /api/upload-image). They MUST NOT contain base64 data
// URIs — the legacy base64-embedded flow was removed because it routinely
// breached Vercel's 4.5 MB serverless body limit.
// -----------------------------------------------------------------------------

const optionSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  image: { type: String, default: "" }, // public URL only — no base64
});

const questionSchema = new mongoose.Schema({
  type: String,
  answerType: {
    type: String,
    enum: ["single", "multiple", "descriptive"],
    default: "single",
  },
  question: String,
  questionHi: String,
  questionImage: { type: String, default: "" }, // public URL only — no base64
  options: [optionSchema],
  optionsHi: [optionSchema],
  correctAnswer: mongoose.Schema.Types.Mixed,
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: Number,
    negativeMarking: Boolean,
    negativeValue: Number,
    eachMarks: Number,
    questions: [questionSchema],

    scheduledAt: {
      type: Date,
      default: null,
    },

    quizCode: {
      type: String,
      unique: true,
    },
    subject:  { type: String, default: null },
    categoryId: { type: String, default: null },
    mockType: {
      type: String,
      enum: ["full", "sectional", "subject_wise"],
      default: "full",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Quiz", quizSchema);
