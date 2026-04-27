import mongoose from "mongoose";

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
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);