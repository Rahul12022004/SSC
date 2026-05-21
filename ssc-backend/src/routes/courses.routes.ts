import { Router } from "express";
import { z } from "zod";
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  addBlock, updateBlock, deleteBlock,
} from '../controllers/courses.controller';
import { validate } from '../middleware/validate';

const blockSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  order: z.number().optional(),
});

const courseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["coming_soon", "active"]).optional(),
  order: z.number().optional(),
});

const router = Router();

router.get("/", getCourses);
router.post("/", authenticateToken, requireAdmin, validate(courseSchema), createCourse);
router.get("/:id", getCourseById);
router.put("/:id", authenticateToken, requireAdmin, validate(courseSchema), updateCourse);
router.delete("/:id", authenticateToken, requireAdmin, deleteCourse);
router.post("/:id/blocks", authenticateToken, requireAdmin, validate(blockSchema), addBlock);
router.put("/:id/blocks/:blockId", authenticateToken, requireAdmin, validate(blockSchema), updateBlock);
router.delete("/:id/blocks/:blockId", authenticateToken, requireAdmin, deleteBlock);

export default router;
