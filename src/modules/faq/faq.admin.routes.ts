import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { createFaq, deleteFaq, getFaq, listFaqs, updateFaq } from "./faq.controller.js";

const router = Router();

// Admin CRUD for FAQs.
router.get("/", requireAdminAuth, listFaqs);
router.post("/", requireAdminAuth, createFaq);
router.get("/:id", requireAdminAuth, getFaq);
router.patch("/:id", requireAdminAuth, updateFaq);
router.delete("/:id", requireAdminAuth, deleteFaq);

export default router;
