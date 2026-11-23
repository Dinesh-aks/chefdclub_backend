import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { getSiteSettings, updateSiteSettings } from "./site-settings.controller.js";

const router = Router();

// Single-record settings: no id in the URL, read and partial update only.
router.get("/", requireAdminAuth, getSiteSettings);
router.patch("/", requireAdminAuth, updateSiteSettings);

export default router;
