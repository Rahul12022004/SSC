/**
 * Diagnoses why quizzes aren't showing in SSC CGL.
 * Run: node api/scripts/diagnose-ssc-cgl.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

// ── 1. Print all categories + subjects + mockGroups ─────────────
console.log("\n=== CATEGORIES ===");
const cats = await db.collection("categories").find({}).toArray();
for (const cat of cats) {
  console.log(`\nCategory: "${cat.name}" [${cat._id}]`);
  for (const subj of (cat.subjects || [])) {
    console.log(`  Subject: "${subj.name}" [${subj._id}]`);
    for (const mg of (subj.mockGroups || [])) {
      console.log(`    MockGroup: "${mg.name}" [${mg._id}] mockType=${mg.mockType}`);
    }
  }
}

// ── 2. Print all quizzes with their assignments ──────────────────
console.log("\n\n=== QUIZZES ===");
const quizzes = await db.collection("quizzes")
  .find({}, { projection: { title: 1, categoryId: 1, subject: 1, mockType: 1, mockGroupId: 1 } })
  .toArray();

for (const q of quizzes) {
  console.log(`\n[${q._id}] "${q.title}"`);
  console.log(`  categoryId:  ${q.categoryId  || "NULL"}`);
  console.log(`  subject:     ${q.subject     || "NULL"}`);
  console.log(`  mockType:    ${q.mockType    || "NULL"}`);
  console.log(`  mockGroupId: ${q.mockGroupId || "NULL"}`);
}

await mongoose.disconnect();
