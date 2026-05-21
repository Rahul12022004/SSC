/**
 * Lists all quizzes grouped by categoryId.
 * Run: node api/scripts/list-quizzes.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

const quizzes = await db.collection("quizzes")
  .find({}, { projection: { title: 1, categoryId: 1, subject: 1, mockType: 1, mockGroupId: 1, subSubjectId: 1 } })
  .toArray();

// group by categoryId
const byCategory = {};
for (const q of quizzes) {
  const key = q.categoryId || "(no category)";
  if (!byCategory[key]) byCategory[key] = [];
  byCategory[key].push(q);
}

for (const [catId, list] of Object.entries(byCategory)) {
  console.log(`\n=== categoryId: ${catId} (${list.length} quizzes) ===`);
  for (const q of list) {
    console.log(`  [${q._id}] "${q.title}"`);
    console.log(`    mockType:    ${q.mockType    || "NULL"}`);
    console.log(`    subject:     ${q.subject     || "NULL"}`);
    console.log(`    mockGroupId: ${q.mockGroupId || "NULL"}`);
    console.log(`    subSubjectId:${q.subSubjectId || "NULL"}`);
  }
}

console.log(`\nTotal: ${quizzes.length} quizzes`);
await mongoose.disconnect();
