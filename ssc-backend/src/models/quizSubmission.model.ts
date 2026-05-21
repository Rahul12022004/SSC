import mongoose, { type Document, type Model } from "mongoose";

export interface IQuizSubmission extends Document {
  quizId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  email: string;
  answers: unknown[];
  score: number;
  timeTaken: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new mongoose.Schema<IQuizSubmission>(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    email: { type: String, required: true, index: true },
    answers: { type: [mongoose.Schema.Types.Mixed], required: true },
    score: { type: Number, default: 0, index: true },
    timeTaken: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ quizId: 1, score: -1, timeTaken: 1 });

export const QuizSubmission: Model<IQuizSubmission> =
  mongoose.models.QuizSubmission ??
  mongoose.model<IQuizSubmission>("QuizSubmission", submissionSchema);
