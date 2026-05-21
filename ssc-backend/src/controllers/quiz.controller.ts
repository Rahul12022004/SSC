import type { RequestHandler } from "express";
import { quizService } from "../services/quiz.service.js";

export const getQuizzes: RequestHandler = async (_req, res, next) => {
  try {
    const quizzes = await quizService.findAll();
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
};

export const getQuizById: RequestHandler = async (req, res, next) => {
  try {
    const quiz = await quizService.findById(String(req.params.id));
    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const createQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quiz = await quizService.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const updateQuiz: RequestHandler = async (req, res, next) => {
  try {
    const quiz = await quizService.update(String(req.params.id), req.body);
    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const deleteQuiz: RequestHandler = async (req, res, next) => {
  try {
    await quizService.delete(String(req.params.id));
    res.json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    next(err);
  }
};
