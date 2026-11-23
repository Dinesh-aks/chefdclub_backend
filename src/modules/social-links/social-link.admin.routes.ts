import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import {
  createSocialLink,
  deleteSocialLink,
  listSocialLinks,
  updateSocialLink,
} from "./social-link.controller.js";

const router = Router();

// Admin CRUD for social links.
router.get("/", requireAdminAuth, listSocialLinks);
router.post("/", requireAdminAuth, createSocialLink);
router.patch("/:id", requireAdminAuth, updateSocialLink);
router.delete("/:id", requireAdminAuth, deleteSocialLink);

export default router;
