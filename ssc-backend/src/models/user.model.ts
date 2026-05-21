import mongoose, { type Document, type Model } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
  role: string;
  roleLevel: number;
  emailVerified: boolean;
  verifiedAt?: Date;
  otp?: string;
  otpExpiry?: Date;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    roleLevel: { type: Number, default: 1 },
    emailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: undefined },
    otp: { type: String, default: undefined },
    otpExpiry: { type: Date, default: undefined },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
