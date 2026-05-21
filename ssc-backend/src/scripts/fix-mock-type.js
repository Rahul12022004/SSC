/**
 * One-time migration: set mockType = "full" on all quizzes missing it.
 * Run once: node api/scripts/fix-mock-type.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection.db;
const col = db.collection("quizzes");

const r1 = await col.updateMany(
  { mockType: { $exists: false } },
  { $set: { mockType: "full" } }
);
console.log("Fixed missing mockType:", r1.modifiedCount, "docs");

const r2 = await col.updateMany(
  { mockType: null },
  { $set: { mockType: "full" } }
);
console.log("Fixed null mockType:   ", r2.modifiedCount, "docs");

await mongoose.disconnect();
