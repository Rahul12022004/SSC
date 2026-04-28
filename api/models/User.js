import mongoose from "mongoose";

/**
 * User schema
 *
 * Email-verification flow:
 *   - `emailVerified` defaults to false on register.
 *   - `otp` holds the 6-digit numeric code as a string (preserves leading zeros).
 *   - `otpExpiry` is a Date set to (now + 10 minutes) at issue time.
 *   - On successful /verify-otp, `otp` and `otpExpiry` are unset and
 *     `emailVerified` flips to true.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    roleLevel: {
      type: Number,
      default: 1,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: undefined,
    },
    otpExpiry: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
