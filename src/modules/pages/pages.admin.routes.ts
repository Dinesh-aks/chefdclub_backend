import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadCmsPageBanner } from "../../middleware/upload.js";
import { getAdminPage, updatePage } from "./pages.controller.js";

const router = Router();

// Admin editor: read (supports ?fields=) and update a page with an optional banner upload.
router.get("/:slug", requireAdminAuth, getAdminPage);
router.patch("/:slug", requireAdminAuth, uploadCmsPageBanner, updatePage);

export default router;
