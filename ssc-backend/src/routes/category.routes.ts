import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  getCategories, createCategory, deleteCategory,
  addSubject, deleteSubject,
  addSubSubject, deleteSubSubject,
  addMockGroup, deleteMockGroup,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.post("/", authenticateToken, requireAdmin, createCategory);
router.delete("/:id", authenticateToken, requireAdmin, deleteCategory);
router.post("/:id/subjects", authenticateToken, requireAdmin, addSubject);
router.delete("/:id/subjects/:subId", authenticateToken, requireAdmin, deleteSubject);
router.post("/:id/subjects/:subId/subsubjects", authenticateToken, requireAdmin, addSubSubject);
router.delete("/:id/subjects/:subId/subsubjects/:subSubId", authenticateToken, requireAdmin, deleteSubSubject);
router.post("/:id/subjects/:subId/mockgroups", authenticateToken, requireAdmin, addMockGroup);
router.delete("/:id/subjects/:subId/mockgroups/:groupId", authenticateToken, requireAdmin, deleteMockGroup);

export default router;
