import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadJournalHeroImage } from "../../middleware/journal-upload.js";
import {
  createBlogCategory,
  deleteBlogCategory,
  listBlogCategories,
  updateBlogCategory,
} from "./journal-category.controller.js";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPost,
  listBlogPosts,
  updateBlogPost,
} from "./journal-post.controller.js";

const router = Router();

// Categories
router.get("/categories", requireAdminAuth, listBlogCategories);
router.post("/categories", requireAdminAuth, createBlogCategory);
router.patch("/categories/:id", requireAdminAuth, updateBlogCategory);
router.delete("/categories/:id", requireAdminAuth, deleteBlogCategory);

// Posts (create/update accept an optional image upload)
router.get("/posts", requireAdminAuth, listBlogPosts);
router.get("/posts/:id", requireAdminAuth, getBlogPost);
router.post("/posts", requireAdminAuth, uploadJournalHeroImage, createBlogPost);
router.patch("/posts/:id", requireAdminAuth, uploadJournalHeroImage, updateBlogPost);
router.delete("/posts/:id", requireAdminAuth, deleteBlogPost);

export default router;
