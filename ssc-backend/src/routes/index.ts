import type { Express } from "express";
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import quizRouter from './quiz.routes';
import coursesRouter from './courses.routes';
import categoryRouter from './category.routes';
import subjectCardsRouter from './subjectCards.routes';
import couponRouter from './coupon.routes';
import userRouter from './user.routes';
import mentorRouter from './mentor.routes';
import { imageRouter, fileRouter } from './upload.routes';
import visitorRouter from './visitor.routes';
import statsRouter from './stats.routes';

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
