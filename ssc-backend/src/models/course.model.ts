import mongoose, { type Document, type Model } from "mongoose";

export interface IBlock {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  order: number;
}

export interface ICourse extends Document {
  name: string;
  description: string;
  imageUrl: string;
  status: "coming_soon" | "active";
  order: number;
  blocks: mongoose.Types.DocumentArray<IBlock>;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new mongoose.Schema<IBlock>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["coming_soon", "active"], default: "coming_soon" },
    order: { type: Number, default: 0, index: true },
    blocks: [blockSchema],
  },
  { timestamps: true }
);

export const Course: Model<ICourse> =
  mongoose.models.Course ?? mongoose.model<ICourse>("Course", courseSchema);
