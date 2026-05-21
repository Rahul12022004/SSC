/**
 * Assigns quiz 69f4bb299ceb4c6759395a0f (CALCULATION QUIZ 1)
 * to the "Full Mock-1" group in SSC CGL.
 * Run: node api/scripts/assign-to-full-mock1.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const QUIZ_ID  = "69f4bb299ceb4c6759395a0f";
const CAT_ID   = "69f4a7d615f13abebde1908f";
const SUBJ_ID  = "69f4a7e915f13abebde19090";

const cat = await db.collection("categories").findOne({
  _id: new mongoose.Types.ObjectId(CAT_ID),
});
if (!cat) { console.error("Category not found"); process.exit(1); }

const subject = cat.subjects?.find(s => s._id?.toString() === SUBJ_ID);
if (!subject) { console.error("Subject not found"); process.exit(1); }

const group = subject.mockGroups?.find(g => g.name === "Full Mock-1");
if (!group) {
  console.error("'Full Mock-1' group not found. Available groups:");
  subject.mockGroups?.forEach(g => console.log(" -", g.name, g._id));
  process.exit(1);
}

console.log("Found group:", group.name, "→", group._id.toString());

const result = await db.collection("quizzes").updateOne(
  { _id: new mongoose.Types.ObjectId(QUIZ_ID) },
  { $set: { mockGroupId: group._id.toString() } }
);

console.log(result.modifiedCount === 1 ? "✓ Quiz moved to Full Mock-1" : "✗ Not modified");
await mongoose.disconnect();
