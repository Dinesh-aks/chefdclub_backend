import { Router } from "express";
import { createReservation } from "./reservation.controller.js";

const router = Router();

// Public: website reservation request form (protected by Turnstile in the controller).
router.post("/", createReservation);

export default router;
