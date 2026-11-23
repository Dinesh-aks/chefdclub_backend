import { Router } from "express";
import { getPublicSpotlight } from "./spotlight.controller.js";

const router = Router();

// Public: the active homepage hero cards.
router.get("/", getPublicSpotlight);

export default router;
