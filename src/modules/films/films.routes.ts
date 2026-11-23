import { Router } from "express";
import { listPublicVideos } from "./films.controller.js";

const router = Router();

// Public films, with an optional ?category= filter.
router.get("/", listPublicVideos);

export default router;
