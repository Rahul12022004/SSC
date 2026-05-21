import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { getCards, getCardById, createCard, updateCard, deleteCard, addBlock, updateBlock, deleteBlock } from "../controllers/subjectCards.controller.js";

const router = Router();

router.get("/", getCards);
router.post("/", authenticateToken, requireAdmin, createCard);
router.get("/:id", getCardById);
router.put("/:id", authenticateToken, requireAdmin, updateCard);
router.delete("/:id", authenticateToken, requireAdmin, deleteCard);
router.post("/:id/blocks", authenticateToken, requireAdmin, addBlock);
router.put("/:id/blocks/:blockId", authenticateToken, requireAdmin, updateBlock);
router.delete("/:id/blocks/:blockId", authenticateToken, requireAdmin, deleteBlock);

export default router;
