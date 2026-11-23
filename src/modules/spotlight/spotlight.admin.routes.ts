import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadSpotlightImage } from "../../middleware/upload.js";
import {
  createSpotlight,
  deleteSpotlight,
  getSpotlight,
  listSpotlight,
  updateSpotlight,
} from "./spotlight.controller.js";

const router = Router();

router.get("/", requireAdminAuth, listSpotlight);
router.get("/:id", requireAdminAuth, getSpotlight);
router.post("/", requireAdminAuth, uploadSpotlightImage, createSpotlight);
router.patch("/:id", requireAdminAuth, uploadSpotlightImage, updateSpotlight);
router.delete("/:id", requireAdminAuth, deleteSpotlight);

export default router;
