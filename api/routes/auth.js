import express from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    confirmPassword,
  } = req.body;

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
    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
      roleLevel: 1,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        roleLevel: user.roleLevel,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ fix
      sameSite: "none",
    });

    res.json({
      success: true,
      role: user.role,
      roleLevel: user.roleLevel,
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= VALIDATE =================
router.get("/validate", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ success: false });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    return res.json({
      success: true,
      user: decoded,
    });
  } catch {
    return res.json({ success: false });
  }
});


// ================= LOGOUT =================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.json({ success: true });
});


export default router;