import mongoose from "mongoose";

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#06b6d4","#10b981","#f97316","#3b82f6","#e11d48"];

const subjectSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  icon:  { type: String, default: "📚" },
  color: { type: String, default: "#6366f1" },
});

const categorySchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  icon:     { type: String, default: "📝" },
  color:    { type: String, default: "#6366f1" },
  subjects: [subjectSchema],
}, { timestamps: true });

export { COLORS };
export default mongoose.model("Category", categorySchema);
