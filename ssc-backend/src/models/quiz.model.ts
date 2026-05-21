import mongoose, { type Document, type Model } from "mongoose";

export interface IOption {
  text: string;
  image: string;
}

export interface RichBlock {
  type: string;
  text: string;
  level?: number;
}

export interface IQuestion {
  type: string;
  answerType: "single" | "multiple" | "descriptive";
  question: string | RichBlock[];
  questionHi: string | RichBlock[];
  questionImage: string;
  options: IOption[];
  optionsHi: IOption[];
  correctAnswer: string | string[];
  sectionTime: number;
  autoLock: boolean;
}

export interface IQuiz extends Document {
  title: string;
  duration?: number;
  negativeMarking?: boolean;
  negativeValue?: number;
  eachMarks?: number;
  autoLock: boolean;
  questions: IQuestion[];
  scheduledAt?: Date | null;
  endsAt?: Date | null;
  solutionPdfUrl?: string | null;
  solutionAvailableAt?: Date | null;
  feedbackEnabled?: boolean;
  quizType?: string;
  quizCode?: string;
  subject?: string;
  category?: string;
  sections?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new mongoose.Schema<IOption>({
  text: { type: String, default: "" },
  image: { type: String, default: "" },
});

const questionSchema = new mongoose.Schema<IQuestion>({
  type: String,
  answerType: {
    type: String,
    enum: ["single", "multiple", "descriptive"],
    default: "single",
  },
  question: mongoose.Schema.Types.Mixed,
  questionHi: mongoose.Schema.Types.Mixed,
  questionImage: { type: String, default: "" },
  options: [optionSchema],
  optionsHi: [optionSchema],
  correctAnswer: mongoose.Schema.Types.Mixed,
  sectionTime: { type: Number, default: 0 },
  autoLock: { type: Boolean, default: false },
});

const quizSchema = new mongoose.Schema<IQuiz>(
  {
    title: { type: String, required: true },
    duration: Number,
    negativeMarking: Boolean,
    negativeValue: Number,
    eachMarks: Number,
    autoLock: { type: Boolean, default: false },
    questions: [questionSchema],
    scheduledAt: { type: Date, default: null, index: true },
    endsAt: { type: Date, default: null },
    solutionPdfUrl: { type: String, default: null },
    solutionAvailableAt: { type: Date, default: null },
    feedbackEnabled: { type: Boolean, default: true },
    quizType: String,
    quizCode: String,
    subject: { type: String, index: true },
    category: { type: String, index: true },
    sections: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

quizSchema.index({ createdAt: -1 });
quizSchema.index({ subject: 1, category: 1 });

export const Quiz: Model<IQuiz> = mongoose.models.Quiz ?? mongoose.model<IQuiz>("Quiz", quizSchema);
