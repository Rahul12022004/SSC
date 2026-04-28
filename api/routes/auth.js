/* global process */
import express from "express";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

const router = express.Router();
const localUsersPath = new URL("../users.json", import.meta.url);

// -----------------------------
// Helpers
// -----------------------------
const getLocalUsers = () => {
  try {
    return JSON.parse(readFileSync(localUsersPath, "utf8"));
  } catch {
    return [];
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpExpiryDate = () => new Date(Date.now() + 10 * 60 * 1000);

const sendLoginResponse = (res, user) => {
  const authUser = {
    email: user.email,
    role: user.role || "user",
    roleLevel: user.roleLevel || 1,
  };

  const token = jwt.sign(authUser, process.env.JWT_SECRET || "secret", {
    expiresIn: "4h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 4 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    ...authUser,
  });
};

// -----------------------------
// POST /api/auth/register
//
// Creates the user with emailVerified=false, generates a 6-digit OTP,
// stores it on the user document with a 10-minute expiry, and dispatches
// the email through Resend.  The frontend should redirect to an
// OTP-entry screen on success.
// -----------------------------
router.post("/register", async (req, res) => {
  const { firstName, middleName, lastName, email, password, confirmPassword } =
    req.body;

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{6,15}$/;

  if (!firstName || !nameRegex.test(firstName))
    return res.json({ success: false, message: "Invalid first name" });

  if (middleName && !nameRegex.test(middleName))
    return res.json({ success: false, message: "Invalid middle name" });

  if (!lastName || !nameRegex.test(lastName))
    return res.json({ success: false, message: "Invalid last name" });

  if (!email || !emailRegex.test(email))
    return res.json({ success: false, message: "Invalid email" });

  if (!passwordRegex.test(password))
    return res.json({ success: false, message: "Weak password" });

  if (password !== confirmPassword)
    return res.json({ success: false, message: "Passwords mismatch" });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = otpExpiryDate();

    const user = await User.create({
      firstName,
      middleName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      roleLevel: 1,
      emailVerified: false,
      otp,
      otpExpiry,
    });

    try {
      await sendOtpEmail({
        to: user.email,
        firstName: user.firstName,
        otp,
        context: "register",
      });
    } catch (mailErr) {
      // The user record is already saved; surface a soft error so the UI
      // can prompt for a resend instead of leaving the user stranded.
      console.error("[auth] Failed to send register OTP:", mailErr.message);
      return res.json({
        success: true,
        emailSent: false,
        message:
          "Account created but verification email failed to send. Please use Resend OTP.",
      });
    }

    return res.json({
      success: true,
      emailSent: true,
      message: "Account created. Please verify the OTP sent to your email.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------
// POST /api/auth/verify-otp
//
// Validates the OTP within its expiry window, flips emailVerified to true,
// and clears the otp / otpExpiry fields so a stale code can never be reused.
// -----------------------------
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.json({ success: true, message: "Email already verified" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.json({
        success: false,
        message: "No OTP issued. Please request a new one.",
      });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------
// POST /api/auth/resend-otp
//
// Generates a fresh OTP (always supersedes the previous one) and emails it.
// Only available for accounts that have not yet been verified.
// -----------------------------
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.json({
        success: false,
        message: "Email already verified. Please log in.",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = otpExpiryDate();
    await user.save();

    await sendOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
      context: "resend",
    });

    return res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (err) {
    console.error("[auth] resend-otp failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------
// POST /api/auth/login
//
// Local users (users.json) keep their bypass for admin/seed access.
// DB users must have emailVerified=true; otherwise a 403 is returned so
// the frontend can surface the OTP-entry screen.
// -----------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const localUser = getLocalUsers().find(
    (u) => u.email?.toLowerCase() === normalizedEmail,
  );

  if (localUser && localUser.password === password) {
    return sendLoginResponse(res, localUser);
  }

  // Wait up to 5s for DB if still connecting
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 5000);
      mongoose.connection.once("connected", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ success: false, message: "Server busy, please try again" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
        message: "Email not verified",
      });
    }

    return sendLoginResponse(res, user);
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Login failed, please try again" });
  }
});

// -----------------------------
// GET /api/auth/validate
// -----------------------------
router.get("/validate", (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    return res.json({
      success: true,
      user: decoded,
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

// -----------------------------
// POST /api/auth/logout
// -----------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ success: true });
});

export default router;
