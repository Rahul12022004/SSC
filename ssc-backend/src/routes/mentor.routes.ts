import { Router } from "express";
import { mentorController } from "../controllers/mentor.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", mentorController.getAllMentors);
router.get("/:id", mentorController.getMentorById);

// Protected routes (admin only)
router.post("/", authenticateToken, mentorController.createMentor);
router.put("/:id", authenticateToken, mentorController.updateMentor);
router.delete("/:id", authenticateToken, mentorController.deleteMentor);

export default router;
