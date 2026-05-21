/**
 * Auto-fixes broken quizzes in SSC CGL category:
 *  1. Corrects wrong subject IDs (copies from anchor quiz)
 *  2. Assigns mockGroupId for "full" type quizzes → Full Mock-1
 *  3. Leaves sectional/subject_wise ungrouped (shown via ungrouped section in UI)
 *
 * Run: node api/scripts/auto-fix-quizzes.js
 * Add --dry-run flag to preview without writing: node api/scripts/auto-fix-quizzes.js --dry-run
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) console.log("=== DRY RUN — no changes will be written ===\n");

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

// ── Step 1: Find anchor quiz (the one that IS showing) ───────────
const anchor = await db.collection("quizzes").findOne({
  title: { $regex: /SSC CGL FULL MOCK TIER/i },
});

if (!anchor) {
  console.error("Anchor quiz 'SSC CGL FULL MOCK TIER-1' not found. Aborting.");
  process.exit(1);
}

const CORRECT_SUBJECT    = anchor.subject;
const CORRECT_CATEGORY   = anchor.categoryId;
const CORRECT_GROUP_FULL = anchor.mockGroupId; // Full Mock-1 group id

console.log("Anchor quiz:", anchor.title);
console.log("  subject:     ", CORRECT_SUBJECT);
console.log("  categoryId:  ", CORRECT_CATEGORY);
console.log("  mockGroupId: ", CORRECT_GROUP_FULL, "(Full Mock-1)");

if (!CORRECT_SUBJECT || !CORRECT_CATEGORY || !CORRECT_GROUP_FULL) {
  console.error("\nAnchor quiz is missing subject/categoryId/mockGroupId. Cannot proceed.");
  process.exit(1);
}

// ── Step 2: Find all quizzes in this category ────────────────────
const allInCat = await db.collection("quizzes")
  .find({ categoryId: CORRECT_CATEGORY })
  .toArray();

console.log(`\nTotal quizzes in category: ${allInCat.length}`);

// ── Step 3: Identify broken ones ─────────────────────────────────
const wrongSubject  = allInCat.filter(q => q.subject !== CORRECT_SUBJECT && q._id.toString() !== anchor._id.toString());
const nullGroupFull = allInCat.filter(q => !q.mockGroupId && (q.mockType || "full") === "full" && q._id.toString() !== anchor._id.toString());
const nullGroupOther= allInCat.filter(q => !q.mockGroupId && (q.mockType || "full") !== "full");

console.log(`\nWrong subject:            ${wrongSubject.length}`);
console.log(`Null mockGroupId (full):  ${nullGroupFull.length}  → will assign to Full Mock-1`);
console.log(`Null mockGroupId (other): ${nullGroupOther.length} → left ungrouped (manual move needed)`);

// ── Step 4: Fix wrong subject ─────────────────────────────────────
if (wrongSubject.length > 0) {
  console.log("\n--- Fixing wrong subject ---");
  for (const q of wrongSubject) {
    console.log(`  "${q.title}" [${q._id}]  subject: ${q.subject || "NULL"} → ${CORRECT_SUBJECT}`);
    if (!DRY_RUN) {
      await db.collection("quizzes").updateOne(
        { _id: q._id },
        { $set: { subject: CORRECT_SUBJECT } }
      );
    }
  }
}

// ── Step 5: Assign Full Mock-1 to full-type ungrouped quizzes ────
if (nullGroupFull.length > 0) {
  console.log("\n--- Assigning Full Mock-1 to full-type ungrouped quizzes ---");
  for (const q of nullGroupFull) {
    console.log(`  "${q.title}" [${q._id}]  mockGroupId: NULL → ${CORRECT_GROUP_FULL}`);
    if (!DRY_RUN) {
      await db.collection("quizzes").updateOne(
        { _id: q._id },
        { $set: { mockGroupId: CORRECT_GROUP_FULL, subject: CORRECT_SUBJECT } }
      );
    }
  }
}

// ── Step 6: Report ungrouped non-full quizzes (need manual move) ─
if (nullGroupOther.length > 0) {
  console.log("\n--- Ungrouped sectional/subject_wise (use Move button in UI) ---");
  for (const q of nullGroupOther) {
    console.log(`  "${q.title}" [${q._id}]  mockType: ${q.mockType}`);
  }
}

console.log(DRY_RUN
  ? "\n=== DRY RUN complete — run without --dry-run to apply ==="
  : "\n=== Done. Refresh frontend to see changes. ==="
);

await mongoose.disconnect();
