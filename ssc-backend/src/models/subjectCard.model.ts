import mongoose, { type Document, type Model } from "mongoose";

export interface ICardBlock {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  order: number;
}

export interface ISubjectCard extends Document {
  name: string;
  description: string;
  imageUrl: string;
  order: number;
  buttonText: string;
  status: "active" | "coming_soon";
  blocks: mongoose.Types.DocumentArray<ICardBlock>;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new mongoose.Schema<ICardBlock>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const subjectCardSchema = new mongoose.Schema<ISubjectCard>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    buttonText: { type: String, default: "Start" },
    status: { type: String, enum: ["active", "coming_soon"], default: "active" },
    blocks: [blockSchema],
  },
  { timestamps: true }
);

subjectCardSchema.virtual("quizCount", {
  ref: "Quiz",
  localField: "_id",
  foreignField: "subjectCardId",
  count: true,
});

subjectCardSchema.set("toJSON", { virtuals: true });
subjectCardSchema.set("toObject", { virtuals: true });

export const SubjectCard: Model<ISubjectCard> =
  mongoose.models.SubjectCard ?? mongoose.model<ISubjectCard>("SubjectCard", subjectCardSchema);
