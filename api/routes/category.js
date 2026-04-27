import express from "express";
import jwt from "jsonwebtoken";
import Category, { COLORS } from "../models/Category.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (decoded.roleLevel < 10) return res.status(403).json({ success: false, message: "Forbidden" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create category (admin)
router.post("/", requireAdmin, async (req, res) => {
  const { name, icon } = req.body;
  if (!name?.trim()) return res.json({ success: false, message: "Name required" });

  try {
    const count = await Category.countDocuments();
    const color = COLORS[count % COLORS.length];
    const category = await Category.create({ name: name.trim(), icon: icon?.trim() || "📝", color });
    res.json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: false, message: "Category already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE category (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add subject to category (admin)
router.post("/:id/subjects", requireAdmin, async (req, res) => {
  const { name, icon } = req.body;
  if (!name?.trim()) return res.json({ success: false, message: "Name required" });

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });

    const count = category.subjects.length;
    const color = COLORS[count % COLORS.length];
    category.subjects.push({ name: name.trim(), icon: icon?.trim() || "📚", color });
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE subject from category (admin)
router.delete("/:id/subjects/:subId", requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });
    category.subjects = category.subjects.filter(s => s._id.toString() !== req.params.subId);
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
