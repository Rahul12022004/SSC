import type { RequestHandler } from "express";
import { authService } from "../services/auth.service.js";
import { env } from "../config/env.js";
import type { JwtPayload } from "../middleware/auth.js";

const cookieOpts = (req: Parameters<RequestHandler>[0]) => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { emailSent } = await authService.register(req.body, req.ip ?? "");
    res.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Account created. Please verify the OTP sent to your email."
        : "Account created but verification email failed to send. Please use Resend OTP.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    await authService.verifyOtp(email, otp);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const resendOtp: RequestHandler = async (req, res, next) => {
  try {
    await authService.resendOtp((req.body as { email: string }).email);
    res.json({ success: true, message: "A new OTP has been sent to your email." });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { token, user } = await authService.login(email, password);

    res.cookie("token", token, cookieOpts(req));
    res.json({ success: true, token, ...user });
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode === 403) {
      res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Email not verified",
      });
      return;
    }
    next(err);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    await authService.forgotPassword((req.body as { email: string }).email);
    res.json({ success: true, message: "If that email exists, an OTP has been sent." });
  } catch (err) {
    next(err);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body as { email: string; otp: string; newPassword: string };
    await authService.resetPassword(email, otp, newPassword);
    res.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
};

export const validate: RequestHandler = (req, res) => {
  res.json({ success: true, user: req.user });
};

export const logout: RequestHandler = (req, res) => {
  res.clearCookie("token", cookieOpts(req));
  res.json({ success: true });
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as JwtPayload;
    const updated = await authService.updateProfile(user.email, req.body as Parameters<typeof authService.updateProfile>[1]);
    const token = authService.buildToken(updated);
    res.cookie("token", token, cookieOpts(req));
    res.json({ success: true, token, ...updated });
  } catch (err) {
    next(err);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as JwtPayload;
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    await authService.changePassword(user.email, currentPassword, newPassword);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
