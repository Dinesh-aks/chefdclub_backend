import { Router } from "express";
import { getPublicCategory, listPublicTabs } from "./menu-public.controller.js";

const router = Router();

// Public, active menu categories only (powers the website Menus page).
router.get("/categories", listPublicTabs);
router.get("/categories/:slug", getPublicCategory);

export default router;
