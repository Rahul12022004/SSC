import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { env } from './env';
import { apiLimiter } from '../middleware/rateLimiter';
import { sanitizeInput } from '../middleware/sanitize';
import { errorHandler } from '../middleware/error';
import { requestLogger, healthCheck } from '../middleware/monitoring';
import { registerRoutes } from '../routes/index';

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sscpathnirman.com",
  "https://www.sscpathnirman.com",
]);

if (env.CLIENT_URL) {
  env.CLIENT_URL.split(",").map((u) => u.trim()).filter(Boolean).forEach((u) => ALLOWED_ORIGINS.add(u));
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman, server-to-server) and allowed origins
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  // CORS first — before all other middleware so preflight and responses get correct headers
  app.use(cors(corsOptions));
  // Explicit preflight catch-all (Express 5 regex syntax)
  app.options(/.*/, cors(corsOptions));

  app.use(requestLogger);
  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
      // Allow cross-origin resource loading (APIs must be reachable cross-origin)
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());
  app.use(sanitizeInput);

  // Skip rate limiter for OPTIONS preflight requests
  app.use("/api/", (req, res, next) => {
    if (req.method === "OPTIONS") return next();
    return apiLimiter(req, res, next);
  });

  app.use(
    session({
      name: "sessionId",
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.get("/health", healthCheck);

  // Serve locally-uploaded files in dev (fallback when BLOB_READ_WRITE_TOKEN absent)
  if (env.NODE_ENV !== "production") {
    app.use(
      "/uploads",
      (_req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Disposition", "inline");
        next();
      },
      express.static(path.resolve(process.cwd(), "uploads"))
    );
  }

  registerRoutes(app);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
}
