import { Router } from "express";
import { getFaqsByCategory, getHomeFaqs } from "./faq.controller.js";

const router = Router();

// Public, published FAQs only.
router.get("/home", getHomeFaqs);
router.get("/category/:category", getFaqsByCategory);

export default router;
