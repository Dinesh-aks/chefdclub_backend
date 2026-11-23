import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadHighlightImage } from "../../middleware/upload.js";
import {
  createHighlight,
  deleteHighlight,
  getHighlight,
  listHighlights,
  updateHighlight,
} from "./highlights.controller.js";

const router = Router();

// Admin CRUD; image uploads go through multer on create/update.
router.get("/", requireAdminAuth, listHighlights);
router.get("/:id", requireAdminAuth, getHighlight);
router.post("/", requireAdminAuth, uploadHighlightImage, createHighlight);
router.patch("/:id", requireAdminAuth, uploadHighlightImage, updateHighlight);
router.delete("/:id", requireAdminAuth, deleteHighlight);

export default router;
