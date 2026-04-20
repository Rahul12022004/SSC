import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

// ✅ Load dotenv ONLY locally
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
  console.log("✅ dotenv loaded (local)");
}

import authRoutes from "./routes/auth.js";
import couponRoutes from "./routes/coupon.js";
import cameraRoutes from "./routes/camera.js";
import quizRoutes from "./routes/quiz.js";

const app = express();

// -----------------------------
// ✅ CORS (FIXED PROPERLY)
// -----------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// -----------------------------
// ✅ MIDDLEWARE
// -----------------------------
app.use(express.json());
app.use(cookieParser());

// -----------------------------
// 🔐 SESSION (IMPROVED)
// -----------------------------
app.use(session({
  name: "sessionId",
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// -----------------------------
// ✅ ROUTES
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/quiz", quizRoutes);

// -----------------------------
// ✅ HEALTH CHECK
// -----------------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// -----------------------------
// ✅ LOCAL SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// -----------------------------
// 🚀 EXPORT FOR VERCEL
// -----------------------------
export default app;