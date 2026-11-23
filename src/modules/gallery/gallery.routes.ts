import { Router } from "express";
import { listPublicPhotos } from "./gallery-photo.controller.js";

const router = Router();

// Public gallery photos; accepts an optional ?category= filter.
router.get("/photos", listPublicPhotos);

export default router;
