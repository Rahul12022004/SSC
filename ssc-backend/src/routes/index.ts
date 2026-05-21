import type { Express } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import quizRouter from "./quiz.routes.js";
import coursesRouter from "./courses.routes.js";
import categoryRouter from "./category.routes.js";
import subjectCardsRouter from "./subjectCards.routes.js";
import couponRouter from "./coupon.routes.js";
import userRouter from "./user.routes.js";
import mentorRouter from "./mentor.routes.js";
import { imageRouter, fileRouter } from "./upload.routes.js";
import visitorRouter from "./visitor.routes.js";
import statsRouter from "./stats.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/quiz", quizRouter);
  app.use("/api/courses", coursesRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/subject-cards", subjectCardsRouter);
  app.use("/api/coupon", couponRouter);
  app.use("/api/users", userRouter);
  app.use("/api/mentors", mentorRouter);
  app.use("/api/upload-image", imageRouter);
  app.use("/api/upload-file", fileRouter);
  app.use("/api/visitors", visitorRouter);
  app.use("/api/stats", statsRouter);
}
