import type { RequestHandler } from "express";
import { User } from "../models/user.model.js";

export const getAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    res.json({ success: true, users });
  } catch (err) {
    console.error("[Users API] Error:", err);
    next(err);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(String(req.params.id))
      .select("-password -otp -otpExpiry")
      .lean()
      .exec();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole: RequestHandler = async (req, res, next) => {
  try {
    const { role, roleLevel } = req.body;
    const user = await User.findByIdAndUpdate(
      String(req.params.id),
      { role, roleLevel },
      { returnDocument: 'after', runValidators: true }
    ).select("-password -otp -otpExpiry");
    
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(String(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
