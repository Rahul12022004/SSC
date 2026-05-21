/**
 * Fixes CALCULATION QUIZ 1 (69f4bb299ceb4c6759395a0f):
 * - Copies subject from "SSC CGL FULL MOCK TIER-1" (the quiz that IS showing)
 * - Sets mockGroupId to "Full Mock-1" group
 * Run: node api/scripts/fix-calculation-quiz.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const QUIZ_TO_FIX = "69f4bb299ceb4c6759395a0f"; // CALCULATION QUIZ 1
const CAT_ID      = "69f4a7d615f13abebde1908f";  // SSC CGL category

// Step 1: Find the quiz that IS showing (SSC CGL FULL MOCK TIER-1)
const anchor = await db.collection("quizzes").findOne({
  title: { $regex: /SSC CGL FULL MOCK TIER/i },
  categoryId: CAT_ID,
});

if (!anchor) {
  console.error("Could not find 'SSC CGL FULL MOCK TIER-1'. Check title.");
  process.exit(1);
}

console.log("Anchor quiz found:");
console.log("  title:       ", anchor.title);
console.log("  subject:     ", anchor.subject);
console.log("  mockGroupId: ", anchor.mockGroupId);

// Step 2: Find category and locate Full Mock-1 group
const cat = await db.collection("categories").findOne({
  _id: new mongoose.Types.ObjectId(CAT_ID),
});
if (!cat) { console.error("Category not found"); process.exit(1); }

let fullMock1Group = null;
for (const subj of (cat.subjects || [])) {
  const grp = subj.mockGroups?.find(g => g.name === "Full Mock-1");
  if (grp && subj._id?.toString() === anchor.subject) {
    fullMock1Group = grp;
    console.log("\nFull Mock-1 group found in subject:", subj.name, "[", subj._id, "]");
    break;
  }
}

if (!fullMock1Group) {
  // Fallback: find Full Mock-1 in any subject of this category
  for (const subj of (cat.subjects || [])) {
    const grp = subj.mockGroups?.find(g => g.name === "Full Mock-1");
    if (grp) {
      fullMock1Group = grp;
      console.log("\nFull Mock-1 found in subject:", subj.name, "[", subj._id, "]");
      break;
    }
  }
}

if (!fullMock1Group) {
  console.error("'Full Mock-1' group not found in category. Groups available:");
  for (const subj of (cat.subjects || [])) {
    subj.mockGroups?.forEach(g => console.log(" -", subj.name, "→", g.name, g._id));
  }
  process.exit(1);
}

// Step 3: Patch CALCULATION QUIZ 1
const result = await db.collection("quizzes").updateOne(
  { _id: new mongoose.Types.ObjectId(QUIZ_TO_FIX) },
  {
    $set: {
      subject:     anchor.subject,
      categoryId:  CAT_ID,
      mockGroupId: fullMock1Group._id.toString(),
      mockType:    "full",
    }
  }
);

console.log("\nPatch result:", result.modifiedCount === 1 ? "✓ SUCCESS" : "✗ NOT MODIFIED");
console.log("  subject →     ", anchor.subject);
console.log("  mockGroupId → ", fullMock1Group._id.toString());
await mongoose.disconnect();
