import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { getAllUsers, getUserById, updateUserRole, deleteUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/", authenticateToken, requireAdmin, getAllUsers);
router.get("/:id", authenticateToken, requireAdmin, getUserById);
router.patch("/:id/role", authenticateToken, requireAdmin, updateUserRole);
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

export default router;
