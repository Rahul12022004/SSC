import express from "express";
const router = express.Router();

const coupons = {
  AB12CD: 5,
  XY34ZT: 5,
  MN56OP: 5,
  QR78UV: 5,
  GH90JK: 5,
};

router.post("/apply", (req, res) => {
  const { code } = req.body;

  if (coupons[code]) {
    return res.json({ success: true, discount: -5 });
  }

  res.json({ success: false });
});

export default router;