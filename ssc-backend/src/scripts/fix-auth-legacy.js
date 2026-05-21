/**
 * One-time auth migration script. Run ONCE in production, then remove or archive.
 *
 * What it does:
 *   1. Mark legacy users (emailVerified missing) as verified — they predate the field.
 *   2. Unblock stuck users (emailVerified:false + expired OTP) so they can resend OTP.
 *   3. Hash the known plaintext password for astiksaxena@duck.com.
 *   4. Report any other users whose password does not start with a bcrypt prefix.
 *
 * Usage (from monorepo root):
 *   cd apps/backend && npx tsx src/scripts/fix-auth-legacy.js
 * Or:
 *   node --experimental-vm-modules apps/backend/src/scripts/fix-auth-legacy.js
 */

import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// try backend-local .env first, then monorepo root
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "SSC";

if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment.");
  process.exit(1);
}

await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
const users = mongoose.connection.db.collection("users");

// ── 1. Legacy users: emailVerified field missing → set true ──────────────────
const legacyResult = await users.updateMany(
  { emailVerified: { $exists: false } },
  { $set: { emailVerified: true } }
);
console.log(`[1] Legacy users fixed (emailVerified missing → true): ${legacyResult.modifiedCount}`);

// ── 2. Stuck users: emailVerified:false + OTP already expired → clear OTP ───
const stuckResult = await users.updateMany(
  { emailVerified: false, otpExpiry: { $lt: new Date() } },
  { $set: { otp: null, otpExpiry: null } }
);
console.log(`[2] Stuck users unblocked (expired OTP cleared): ${stuckResult.modifiedCount}`);

// ── 3. Hash known plaintext password for astiksaxena@duck.com ────────────────
const TARGET_EMAIL = "astiksaxena@duck.com";
const KNOWN_PLAINTEXT = "User@123";

const targetUser = await users.findOne({ email: TARGET_EMAIL });
if (!targetUser) {
  console.log(`[3] ${TARGET_EMAIL}: user not found — skipping.`);
} else {
  // Only act if password is NOT already a bcrypt hash
  const alreadyHashed = /^\$2[aby]\$/.test(targetUser.password ?? "");
  if (alreadyHashed) {
    console.log(`[3] ${TARGET_EMAIL}: password already bcrypt-hashed — skipping.`);
  } else {
    const hashed = await bcrypt.hash(KNOWN_PLAINTEXT, 10);
    await users.updateOne({ email: TARGET_EMAIL }, { $set: { password: hashed } });
    console.log(`[3] ${TARGET_EMAIL}: plaintext password replaced with bcrypt hash.`);
  }
}

// ── 4. Detect remaining users with potentially plaintext passwords ────────────
//    Passwords that do NOT start with $2a$, $2b$, or $2y$ are suspect.
const suspect = await users
  .find({ password: { $not: /^\$2[aby]\$/ } }, { projection: { email: 1, password: 1 } })
  .toArray();

if (suspect.length === 0) {
  console.log("[4] No suspect (non-bcrypt) passwords found. All good.");
} else {
  console.warn(`[4] WARNING: ${suspect.length} user(s) with non-bcrypt passwords:`);
  for (const u of suspect) {
    // Print only first 6 chars of password to avoid logging plaintext in full
    const preview = String(u.password ?? "").slice(0, 6) + "…";
    console.warn(`    ${u.email}  password starts with: ${preview}`);
  }
  console.warn("    Manually investigate and hash these passwords before next deploy.");
}

await mongoose.disconnect();
console.log("\nMigration complete.");
