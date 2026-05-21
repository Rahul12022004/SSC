import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Skip logging for OPTIONS requests and auth validation (too noisy)
    if (req.method === "OPTIONS" || req.originalUrl === "/api/auth/validate") {
      return;
    }
    
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    
    // Only log errors and slow requests
    if (res.statusCode >= 400) {
      console.error("[ERROR]", JSON.stringify(log));
    } else if (duration > 1000) {
      console.warn("[SLOW]", JSON.stringify(log));
    }
    // Removed the else block that logs all INFO requests
  });
  
  next();
};

export const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
};
