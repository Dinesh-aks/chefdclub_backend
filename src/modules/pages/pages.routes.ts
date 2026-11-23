import { Router } from "express";
import { getPage } from "./pages.controller.js";

const router = Router();

// Public page by slug (about-us, privacy-policy, terms-and-conditions).
router.get("/:slug", getPage);

export default router;
