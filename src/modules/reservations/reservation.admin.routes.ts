import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import {
  getReservation,
  listReservations,
  updateReservationAdminComments,
  updateReservationStatus,
} from "./reservation.controller.js";

const router = Router();

// Admin reservation list (paginated/filterable), detail, status change and internal notes.
router.get("/", requireAdminAuth, listReservations);
router.get("/:id", requireAdminAuth, getReservation);
router.patch("/:id/status", requireAdminAuth, updateReservationStatus);
router.patch("/:id/comments", requireAdminAuth, updateReservationAdminComments);

export default router;
