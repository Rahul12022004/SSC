/**
 * Moves quiz 69f03731486a40903432609f into the "English" mock group
 * under subject 69efae79d7763044b35aef41.
 * Run: node api/scripts/move-quiz-to-english.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const QUIZ_ID    = "69f03731486a40903432609f";
const SUBJECT_ID = "69efae79d7763044b35aef41";
const CAT_ID     = "69efae69d7763044b35aef40";

// Find the category and locate the English mock group
const cat = await db.collection("categories").findOne({
  _id: new mongoose.Types.ObjectId(CAT_ID),
});

if (!cat) { console.error("Category not found"); process.exit(1); }

const subject = cat.subjects?.find(s => s._id?.toString() === SUBJECT_ID);
if (!subject) { console.error("Subject not found"); process.exit(1); }

const englishGroup = subject.mockGroups?.find(
  g => g.name?.toLowerCase() === "english"
);
if (!englishGroup) {
  console.error("No 'English' mock group found. Available groups:");
  subject.mockGroups?.forEach(g => console.log(" -", g.name, g._id));
  process.exit(1);
}

console.log("English group found:", englishGroup.name, englishGroup._id.toString());

const result = await db.collection("quizzes").updateOne(
  { _id: new mongoose.Types.ObjectId(QUIZ_ID) },
  { $set: { mockGroupId: englishGroup._id.toString() } }
);

console.log("Quiz updated:", result.modifiedCount === 1 ? "SUCCESS" : "NOT MODIFIED");
await mongoose.disconnect();
