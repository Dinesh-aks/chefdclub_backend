import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { getContactMessage, listContactMessages } from "./contact.controller.js";

const router = Router();

// Admin inbox: list rows are slim, the full message loads by id.
router.get("/", requireAdminAuth, listContactMessages);
router.get("/:id", requireAdminAuth, getContactMessage);

export default router;
