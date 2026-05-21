import mongoose, { type Document, type Model } from "mongoose";

export interface IQuizFeedback extends Document {
  quizId: mongoose.Types.ObjectId;
  email: string;
  userName: string;
  quizTitle: string;
  rating: number;
  feedback: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new mongoose.Schema<IQuizFeedback>(
  {
    quizId:    { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    email:     { type: String, required: true, index: true },
    userName:  { type: String, required: true },
    quizTitle: { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    feedback:  { type: String, required: true, maxlength: 1000 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

feedbackSchema.index({ quizId: 1, email: 1 }, { unique: true });

export const QuizFeedback: Model<IQuizFeedback> =
  mongoose.models.QuizFeedback ??
  mongoose.model<IQuizFeedback>("QuizFeedback", feedbackSchema);
