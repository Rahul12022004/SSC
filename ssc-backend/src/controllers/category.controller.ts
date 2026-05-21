import type { RequestHandler } from "express";
import { categoryService } from '../services/category.service';

export const getCategories: RequestHandler = async (_req, res, next) => {
  try { res.json({ success: true, categories: await categoryService.findAll() }); }
  catch (err) { next(err); }
};

export const createCategory: RequestHandler = async (req, res, next) => {
  try {
    const { name, icon } = req.body as { name: string; icon?: string };
    res.json({ success: true, category: await categoryService.create(name, icon) });
  } catch (err) { next(err); }
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
  try { await categoryService.delete(String(req.params.id)); res.json({ success: true }); }
  catch (err) { next(err); }
};

export const addSubject: RequestHandler = async (req, res, next) => {
  try {
    const { name, icon } = req.body as { name: string; icon?: string };
    res.json({ success: true, category: await categoryService.addSubject(String(req.params.id), name, icon) });
  } catch (err) { next(err); }
};

export const deleteSubject: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, category: await categoryService.deleteSubject(String(req.params.id), String(req.params.subId)) }); }
  catch (err) { next(err); }
};

export const addSubSubject: RequestHandler = async (req, res, next) => {
  try {
    const { name, icon } = req.body as { name: string; icon?: string };
    res.json({ success: true, category: await categoryService.addSubSubject(String(req.params.id), String(req.params.subId), name, icon) });
  } catch (err) { next(err); }
};

export const deleteSubSubject: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, category: await categoryService.deleteSubSubject(String(req.params.id), String(req.params.subId), String(req.params.subSubId)) }); }
  catch (err) { next(err); }
};

export const addMockGroup: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, category: await categoryService.addMockGroup(String(req.params.id), String(req.params.subId), req.body) }); }
  catch (err) { next(err); }
};

export const deleteMockGroup: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, category: await categoryService.deleteMockGroup(String(req.params.id), String(req.params.subId), String(req.params.groupId)) }); }
  catch (err) { next(err); }
};
