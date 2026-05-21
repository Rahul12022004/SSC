import { Router, type RequestHandler } from "express";
import { Visitor } from '../models/visitor.model';

const router = Router();

// GET /api/visitors — return current count
const getCount: RequestHandler = async (_req, res, next) => {
  try {
    let doc = await Visitor.findOne();
    if (!doc) doc = await Visitor.create({ count: 0 });
    res.json({ success: true, count: doc.count });
  } catch (err) {
    next(err);
  }
};

// POST /api/visitors/track — increment count, returns new count
const trackVisit: RequestHandler = async (_req, res, next) => {
  try {
    const doc = await Visitor.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ success: true, count: doc!.count });
  } catch (err) {
    next(err);
  }
};

router.get("/", getCount);
router.post("/track", trackVisit);

export default router;
