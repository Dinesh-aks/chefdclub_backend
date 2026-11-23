import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadMenuCardBanner, uploadMenuCategoryImages } from "../../middleware/upload.js";
import {
  createMenuCard,
  deleteMenuCard,
  getMenuCard,
  listMenuCards,
  updateMenuCard,
} from "./menu-card.controller.js";
import {
  createMenuCategory,
  deleteMenuCategory,
  getMenuCategory,
  listMenuCategories,
  updateMenuCategory,
} from "./menu-category.controller.js";

const router = Router();

// Categories (create/update accept image and banner uploads)
router.get("/categories", requireAdminAuth, listMenuCategories);
router.get("/categories/:id", requireAdminAuth, getMenuCategory);
router.post("/categories", requireAdminAuth, uploadMenuCategoryImages, createMenuCategory);
router.patch("/categories/:id", requireAdminAuth, uploadMenuCategoryImages, updateMenuCategory);
router.delete("/categories/:id", requireAdminAuth, deleteMenuCategory);

// Cards (create/update accept a banner upload)
router.get("/cards", requireAdminAuth, listMenuCards);
router.get("/cards/:id", requireAdminAuth, getMenuCard);
router.post("/cards", requireAdminAuth, uploadMenuCardBanner, createMenuCard);
router.patch("/cards/:id", requireAdminAuth, uploadMenuCardBanner, updateMenuCard);
router.delete("/cards/:id", requireAdminAuth, deleteMenuCard);

export default router;
