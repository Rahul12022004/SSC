import type { RequestHandler } from "express";
import { subjectCardsService } from "../services/subjectCards.service.js";

export const getCards: RequestHandler = async (_req, res, next) => {
  try { res.json({ success: true, cards: await subjectCardsService.findAll() }); }
  catch (err) { next(err); }
};

export const getCardById: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, card: await subjectCardsService.findById(String(req.params.id)) }); }
  catch (err) { next(err); }
};

export const createCard: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, card: await subjectCardsService.create(req.body) }); }
  catch (err) { next(err); }
};

export const updateCard: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, card: await subjectCardsService.update(String(req.params.id), req.body) }); }
  catch (err) { next(err); }
};

export const deleteCard: RequestHandler = async (req, res, next) => {
  try { await subjectCardsService.delete(String(req.params.id)); res.json({ success: true }); }
  catch (err) { next(err); }
};

export const addBlock: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, block: await subjectCardsService.addBlock(String(req.params.id), req.body) }); }
  catch (err) { next(err); }
};

export const updateBlock: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, block: await subjectCardsService.updateBlock(String(req.params.id), String(req.params.blockId), req.body) }); }
  catch (err) { next(err); }
};

export const deleteBlock: RequestHandler = async (req, res, next) => {
  try { await subjectCardsService.deleteBlock(String(req.params.id), String(req.params.blockId)); res.json({ success: true }); }
  catch (err) { next(err); }
};
