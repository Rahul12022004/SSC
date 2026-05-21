import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from '../config/env';

export interface JwtPayload {
  email: string;
  role: string;
  roleLevel: number;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const extractToken = (req: Parameters<RequestHandler>[0]): string | null => {
  const cookieToken = req.cookies?.token as string | undefined;
  const authHeader = req.headers?.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return cookieToken ?? headerToken ?? null;
};

export const authenticateToken: RequestHandler = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  const { role, roleLevel } = req.user;
  if (role === "admin" || roleLevel >= 10) {
    next();
    return;
  }
  res.status(403).json({ success: false, message: "Admin access required" });
};
