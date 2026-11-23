import { Router } from "express";
import { createContactMessage } from "./contact.controller.js";

const router = Router();

// Public contact form submission.
router.post("/", createContactMessage);

export default router;
