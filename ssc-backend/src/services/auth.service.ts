import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { AppError } from "../middleware/error.js";
import { env } from "../config/env.js";
import type { JwtPayload } from "../middleware/auth.js";

const localUsersPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../users.json"
);

const getLocalUsers = (): Array<Record<string, unknown>> => {
  try {
    return JSON.parse(readFileSync(localUsersPath, "utf8")) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpExpiryDate = () => new Date(Date.now() + 10 * 60 * 1000);

const NAME_REGEX = /^[A-Za-z ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{6,15}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export const authService = {
  async verifyRecaptcha(token: string | undefined, remoteIp: string): Promise<void> {
    const localhostIps = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
    if (localhostIps.includes(remoteIp)) return;

    if (!env.RECAPTCHA_SECRET_KEY) throw new AppError(500, "reCAPTCHA not configured");
    if (!token) throw new AppError(400, "Missing reCAPTCHA token");

    const payload = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
    if (remoteIp) payload.set("remoteip", remoteIp);

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });

    if (!res.ok) throw new AppError(400, "reCAPTCHA verification failed");
    const result = (await res.json()) as { success: boolean };
    if (!result.success) throw new AppError(400, "Please complete the reCAPTCHA again");
  },

  buildToken(user: { email: string; role: string; roleLevel: number; firstName: string; lastName: string }): string {
    const payload: JwtPayload = {
      email: user.email,
      role: user.role ?? "user",
      roleLevel: user.roleLevel ?? 1,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
  },

  async register(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    recaptchaToken?: string;
    captchaTrap?: string;
    formStartedAt?: number;
  }, remoteIp: string): Promise<{ emailSent: boolean }> {
    const { firstName, middleName, lastName, email, phone, password, confirmPassword, recaptchaToken, captchaTrap, formStartedAt } = data;

    if (!firstName || !NAME_REGEX.test(firstName)) throw new AppError(400, "Invalid first name");
    if (middleName && !NAME_REGEX.test(middleName)) throw new AppError(400, "Invalid middle name");
    if (!lastName || !NAME_REGEX.test(lastName)) throw new AppError(400, "Invalid last name");
    if (!email || !EMAIL_REGEX.test(email)) throw new AppError(400, "Invalid email");
    if (!phone || !PHONE_REGEX.test(phone)) throw new AppError(400, "Invalid phone number");
    if (!PASSWORD_REGEX.test(password)) throw new AppError(400, "Weak password");
    if (password !== confirmPassword) throw new AppError(400, "Passwords mismatch");
    if (captchaTrap) throw new AppError(400, "Robot check failed");

    const startedAt = Number(formStartedAt);
    if (!Number.isFinite(startedAt) || startedAt > Date.now() || Date.now() - startedAt < 2500) {
      throw new AppError(400, "Human verification failed. Please try again.");
    }

    await authService.verifyRecaptcha(recaptchaToken, remoteIp);

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new AppError(409, "Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const user = await User.create({
      firstName, middleName, lastName, phone,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user", roleLevel: 1,
      emailVerified: false,
      otp: hashedOtp, otpExpiry: otpExpiryDate(),
    });

    let emailSent = true;
    try {
      await sendOtpEmail({ to: user.email, firstName: user.firstName, otp, context: "register" });
    } catch (err) {
      console.error("[auth] register OTP send failed:", (err as Error).message);
      emailSent = false;
    }
    return { emailSent };
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    if (!/^\d{6}$/.test(otp)) throw new AppError(400, "Invalid OTP format");
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) throw new AppError(404, "User not found");
    if (user.emailVerified) return;
    if (!user.otp || !user.otpExpiry) throw new AppError(400, "No OTP issued. Request a new one.");
    if (user.otpExpiry.getTime() < Date.now()) throw new AppError(400, "OTP expired. Request a new one.");
    const otpMatch = await bcrypt.compare(otp.toString().trim(), user.otp);
    if (!otpMatch) {
      await new Promise((r) => setTimeout(r, 100));
      throw new AppError(400, "Invalid OTP");
    }
    user.emailVerified = true;
    user.verifiedAt = new Date();
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
  },

  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) throw new AppError(404, "User not found");
    if (user.emailVerified) throw new AppError(400, "Email already verified. Please log in.");
    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiryDate();
    await user.save();
    await sendOtpEmail({ to: user.email, firstName: user.firstName, otp, context: "resend" });
  },

  async login(email: string, password: string): Promise<{ token: string; user: JwtPayload }> {
    const normalizedEmail = email?.trim().toLowerCase();

    if (env.NODE_ENV !== "production") {
      const localUser = getLocalUsers().find(
        (u) => (u.email as string)?.toLowerCase() === normalizedEmail
      );
      if (localUser && typeof localUser.password === "string") {
        const match = await bcrypt.compare(password, localUser.password).catch(() => false);
        if (match) {
          const token = authService.buildToken(localUser as Parameters<typeof authService.buildToken>[0]);
          return { token, user: localUser as unknown as JwtPayload };
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 5000);
        mongoose.connection.once("connected", () => { clearTimeout(timeout); resolve(); });
      });
    }
    if (mongoose.connection.readyState !== 1) throw new AppError(503, "Server busy, please try again");

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) throw new AppError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await new Promise((r) => setTimeout(r, 100));
      throw new AppError(401, "Invalid credentials");
    }
    // strict false-check: undefined (legacy users) must NOT be blocked
    if (user.emailVerified === false) throw new AppError(403, "EMAIL_NOT_VERIFIED");

    const payload: JwtPayload = {
      email: user.email,
      role: user.role,
      roleLevel: user.roleLevel,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = authService.buildToken(payload);
    return { token, user: payload };
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.emailVerified === false) return; // silent — don't leak existence; legacy users (undefined) allowed
    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiryDate();
    await user.save();
    await sendOtpEmail({ to: user.email, firstName: user.firstName, otp, context: "reset" });
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    if (!PASSWORD_REGEX.test(newPassword)) throw new AppError(400, "Weak password: 6-15 chars, 1 capital, 1 number, 1 special");
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) throw new AppError(404, "User not found");
    if (!user.otp || !user.otpExpiry) throw new AppError(400, "No OTP issued. Request a new one.");
    if (user.otpExpiry.getTime() < Date.now()) throw new AppError(400, "OTP expired. Request a new one.");
    const otpMatch = await bcrypt.compare(otp.toString().trim(), user.otp);
    if (!otpMatch) throw new AppError(400, "Invalid OTP");
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
  },

  async updateProfile(
    email: string,
    data: { firstName: string; lastName: string; phone?: string; profileImage?: string }
  ): Promise<JwtPayload & { profileImage?: string; phone?: string }> {
    if (!data.firstName || !NAME_REGEX.test(data.firstName.trim())) throw new AppError(400, "Invalid first name");
    if (!data.lastName || !NAME_REGEX.test(data.lastName.trim())) throw new AppError(400, "Invalid last name");
    if (data.phone && !PHONE_REGEX.test(data.phone)) throw new AppError(400, "Invalid phone number");

    const user = await User.findOne({ email });
    if (!user) throw new AppError(404, "User not found");

    user.firstName = data.firstName.trim();
    user.lastName = data.lastName.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.profileImage !== undefined) user.profileImage = data.profileImage;
    await user.save();

    return {
      email: user.email,
      role: user.role,
      roleLevel: user.roleLevel,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage ?? "",
      phone: user.phone ?? "",
    };
  },

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!PASSWORD_REGEX.test(newPassword))
      throw new AppError(400, "Weak password: 6-15 chars, 1 capital, 1 number, 1 special (@#$%&*!)");

    const user = await User.findOne({ email });
    if (!user) throw new AppError(404, "User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await new Promise((r) => setTimeout(r, 100));
      throw new AppError(400, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  },
};
