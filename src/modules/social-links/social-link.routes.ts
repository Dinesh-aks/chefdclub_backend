import { Router } from "express";
import { getPublicSocialLinks } from "./social-link.controller.js";

const router = Router();

// Public: full list for the website header/footer icons.
router.get("/", getPublicSocialLinks);

export default router;
