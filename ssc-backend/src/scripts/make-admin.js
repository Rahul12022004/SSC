/**
 * Promote a user to admin.
 * Run from the monorepo root:
 *   node --experimental-vm-modules apps/backend/src/scripts/make-admin.js <email>
 * Or from apps/backend/:
 *   node --input-type=module src/scripts/make-admin.js <email>
 *
 * Uses tsx if available:
 *   cd apps/backend && npx tsx src/scripts/make-admin.js <email>
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../../../.env", import.meta.url).pathname });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node make-admin.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI, { dbName: "SSC" });

const result = await mongoose.connection.db.collection("users").findOneAndUpdate(
  { email: email.toLowerCase().trim() },
  { $set: { role: "admin", roleLevel: 10 } },
  { returnDocument: "after" }
);

if (!result) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.log(`✓ Promoted to admin:`);
console.log(`  email:     ${result.email}`);
console.log(`  role:      ${result.role}`);
console.log(`  roleLevel: ${result.roleLevel}`);

await mongoose.disconnect();
