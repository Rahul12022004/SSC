/* global process */
import express from "express";
import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";

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
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      middleName,
      lastName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "user",
      roleLevel: 1,
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

  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ success: false, message: "Invalid credentials" });
      }

      return sendLoginResponse(res, user);
    }
    return res.json({ success: false, message: "Invalid credentials" });
  } catch {
    res.status(500).json({ success: false });
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
