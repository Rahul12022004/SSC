import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  image: String,
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
  questionImage: String,
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

    // 🔥 ADD THIS
    quizCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Quiz", quizSchema);
