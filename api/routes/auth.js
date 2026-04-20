import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const filePath = path.resolve("users.json");

const router = express.Router();

router.post("/register", (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    confirmPassword,
  } = req.body;

  // 🔥 SAME VALIDATION AS FRONTEND
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

  // 🔥 Read existing users
  let users = [];
  if (fs.existsSync(filePath)) {
    users = JSON.parse(fs.readFileSync(filePath));
  }

  // 🔥 Check duplicate email
  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "Email already exists" });
  }

  // 🔥 New user
  const newUser = {
    firstName,
    middleName,
    lastName,
    email,
    password,
    role: "user",
    roleLevel: 1,
  };

  users.push(newUser);

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  res.json({ success: true });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  let role = null;
  let roleLevel = 0;

  if (email === "admin@company.com" && password === "Admin@123") {
    role = "admin";
    roleLevel = 4;
  } 
  else if (email === "teacher@company.com" && password === "123") {
    role = "teacher";
    roleLevel = 3;
  } 
  else if (email === "student@company.com" && password === "123") {
    role = "student";
    roleLevel = 2;
  } 
  else if (email === "customer@company.com" && password === "123") {
    role = "customer";
    roleLevel = 1;
  } 
  else {
    // 🔥 CHECK JSON USERS
    let users = [];

    if (fs.existsSync(filePath)) {
      users = JSON.parse(fs.readFileSync(filePath));
    }

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      role = foundUser.role || "user";
      roleLevel = foundUser.roleLevel || 1;
    }
  }

   if (!role) {
    return res.json({ success: false });
  }

  const token = jwt.sign(
    { email, role, roleLevel },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  );

  // ✅ send as cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ success: true, role, roleLevel });
});


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


router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ success: true });
});

export default router;