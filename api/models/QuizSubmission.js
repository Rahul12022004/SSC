import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    answers: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuizSubmission", submissionSchema);
