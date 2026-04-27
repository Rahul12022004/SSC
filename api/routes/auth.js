/* global process */
import express from "express";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Resend } from "resend";

import User from "../models/User.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const router = express.Router();
const localUsersPath = new URL("../users.json", import.meta.url);

const getLocalUsers = () => {
  try {
    return JSON.parse(readFileSync(localUsersPath, "utf8"));
  } catch {
    return [];
  }
};

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

    // Email verification disabled - auto-verify user
    await User.create({
      firstName,
      middleName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      roleLevel: 1,
      emailVerified: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.json({ success: false, message: "Email and OTP required" });

  try {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      verificationToken: otp.trim(),
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.json({ success: false, message: "Invalid or expired OTP" });

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email required" });

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase(), emailVerified: false });
    if (!user) return res.json({ success: false, message: "No pending verification for this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = otp;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: user.email,
      subject: "Your new SSC Pathnirman OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
          <h2 style="color:#0b2545;margin-bottom:8px">New OTP</h2>
          <p style="color:#475569;margin-bottom:24px">Hi ${user.firstName}, here is your new OTP. Expires in <strong>10 minutes</strong>.</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#f77f00;text-align:center;padding:20px;background:#fff;border-radius:10px;border:2px dashed #f77f00;margin-bottom:20px">
            ${otp}
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
      mongoose.connection.once("connected", () => { clearTimeout(timeout); resolve(); });
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: "Server busy, please try again" });
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

    return sendLoginResponse(res, user);
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed, please try again" });
  }
});

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

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ success: true });
});

export default router;
