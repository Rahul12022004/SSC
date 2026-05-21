import type { RequestHandler } from "express";
import { coursesService } from "../services/courses.service.js";

export const getCourses: RequestHandler = async (_req, res, next) => {
  try { res.json({ success: true, courses: await coursesService.findAll() }); }
  catch (err) { next(err); }
};

export const getCourseById: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, course: await coursesService.findById(String(req.params.id)) }); }
  catch (err) { next(err); }
};

export const createCourse: RequestHandler = async (req, res, next) => {
  try { res.status(201).json({ success: true, course: await coursesService.create(req.body) }); }
  catch (err) { next(err); }
};

export const updateCourse: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, course: await coursesService.update(String(req.params.id), req.body) }); }
  catch (err) { next(err); }
};

export const deleteCourse: RequestHandler = async (req, res, next) => {
  try { await coursesService.delete(String(req.params.id)); res.json({ success: true, message: "Course deleted" }); }
  catch (err) { next(err); }
};

export const addBlock: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, block: await coursesService.addBlock(String(req.params.id), req.body) }); }
  catch (err) { next(err); }
};

export const updateBlock: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, block: await coursesService.updateBlock(String(req.params.id), String(req.params.blockId), req.body) }); }
  catch (err) { next(err); }
};

export const deleteBlock: RequestHandler = async (req, res, next) => {
  try { await coursesService.deleteBlock(String(req.params.id), String(req.params.blockId)); res.json({ success: true }); }
  catch (err) { next(err); }
};
