import mongoose, { type Document, type Model } from "mongoose";

export const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b",
  "#06b6d4", "#10b981", "#f97316", "#3b82f6", "#e11d48",
];

export interface ISubSubject {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
}

export interface IMockGroup {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  mockType: "full" | "sectional";
}

export interface ISubject {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  subSubjects: mongoose.Types.DocumentArray<ISubSubject>;
  mockGroups: mongoose.Types.DocumentArray<IMockGroup>;
}

export interface ICategory extends Document {
  name: string;
  icon: string;
  color: string;
  subjects: mongoose.Types.DocumentArray<ISubject>;
  createdAt: Date;
  updatedAt: Date;
}

const subSubjectSchema = new mongoose.Schema<ISubSubject>({
  name: { type: String, required: true },
  icon: { type: String, default: "📖" },
  color: { type: String, default: "#6366f1" },
});

const mockGroupSchema = new mongoose.Schema<IMockGroup>({
  name: { type: String, required: true },
  icon: { type: String, default: "📋" },
  color: { type: String, default: "#6366f1" },
  mockType: { type: String, enum: ["full", "sectional"], required: true },
});

const subjectSchema = new mongoose.Schema<ISubject>({
  name: { type: String, required: true },
  icon: { type: String, default: "📚" },
  color: { type: String, default: "#6366f1" },
  subSubjects: [subSubjectSchema],
  mockGroups: [mockGroupSchema],
});

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: "📝" },
    color: { type: String, default: "#6366f1" },
    subjects: [subjectSchema],
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", categorySchema);
