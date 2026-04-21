import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  image: String,
});

const questionSchema = new mongoose.Schema({
  type: String,
  question: String,
  questionImage: String,
  options: [optionSchema],
  correctAnswer: String,
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