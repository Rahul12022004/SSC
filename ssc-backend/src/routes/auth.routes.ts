import { Router } from "express";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  validate,
  logout,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", authLimiter, login);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/validate", authenticateToken, validate);
router.post("/logout", logout);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

export default router;
