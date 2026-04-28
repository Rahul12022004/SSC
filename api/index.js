import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import couponRoutes from "./routes/coupon.js";
import quizRoutes from "./routes/quiz.js";
import categoryRoutes from "./routes/category.js";
import uploadRoutes from "./routes/upload.js";

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend (Vite default)
    "http://localhost:3000",
    "https://sscpathnirman.com",
    "https://ssc-59f96g8me-nexavise-consultings-projects.vercel.app",
  ],
  credentials: true
}));

// -----------------------------
// MIDDLEWARE
// -----------------------------
// Body-parser limits stay generous for non-image JSON, but images are no longer
// embedded as base64 — they are uploaded separately to Vercel Blob via
// /api/upload-image and only their URLs are stored on the quiz document. This
// keeps quiz JSON well under Vercel's hard ~4.5 MB serverless body cap.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());


// -----------------------------
// SESSION
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

await connectDB();

// -----------------------------
// ROUTES
//
// Order matters: the upload route is mounted BEFORE the health-check and
// before any future catch-all/404 handlers, so multipart POSTs to
// /api/upload-image are never swallowed by a downstream wildcard.
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/upload-image", uploadRoutes);

console.log(
  "[api] route registered: POST /api/upload-image (multipart 'file', 10MB max, Vercel Blob)"
);

// -----------------------------
// HEALTH CHECK
// -----------------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// -----------------------------
// 404 FALLBACK (must be LAST)
//
// Express 5 no longer accepts the "*" path string, so we use a name-less
// middleware to catch unmatched requests and respond with structured JSON
// instead of HTML — easier for the frontend to surface a clean message.
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// -----------------------------
// LOCAL SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// -----------------------------
// EXPORT FOR VERCEL
// -----------------------------
export default app;
