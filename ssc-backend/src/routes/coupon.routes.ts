import { Router } from "express";
import type { RequestHandler } from "express";

const COUPONS: Record<string, number> = {
  AB12CD: 5, XY34ZT: 5, MN56OP: 5, QR78UV: 5, GH90JK: 5,
};

const applyCoupon: RequestHandler = (req, res) => {
  const { code } = req.body as { code: string };
  if (code && COUPONS[code]) {
    res.json({ success: true, discount: -5 });
    return;
  }
  res.json({ success: false });
};

const router = Router();
router.post("/apply", applyCoupon);

export default router;
