import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import authRoutes from "../auth/auth.routes.js";
import faqAdminRoutes from "../faq/faq.admin.routes.js";
import galleryAdminRoutes from "../gallery/gallery.admin.routes.js";
import filmsAdminRoutes from "../films/films.admin.routes.js";
import reservationAdminRoutes from "../reservations/reservation.admin.routes.js";
import contactAdminRoutes from "../contact/contact.admin.routes.js";
import pagesAdminRoutes from "../pages/pages.admin.routes.js";
import highlightsAdminRoutes from "../highlights/highlights.admin.routes.js";
import menuAdminRoutes from "../menu/menu.admin.routes.js";
import journalAdminRoutes from "../journal/journal.admin.routes.js";
import socialLinkAdminRoutes from "../social-links/social-link.admin.routes.js";
import siteSettingsAdminRoutes from "../site-settings/site-settings.admin.routes.js";
import uploadsAdminRoutes from "../uploads/uploads.admin.routes.js";
import spotlightAdminRoutes from "../spotlight/spotlight.admin.routes.js";
import * as adminController from "./admin.controller.js";

const router = Router();

// Auth is mounted first; login, refresh and logout are public.
router.use("/auth", authRoutes);
router.get("/dashboard", requireAdminAuth, adminController.getDashboard);
// Feature routers below protect themselves with requireAdminAuth.
router.use("/faq", faqAdminRoutes);
router.use("/gallery", galleryAdminRoutes);
// Kept at the same address so the admin screens keep working.
router.use("/gallery/videos", filmsAdminRoutes);
router.use("/reservations", reservationAdminRoutes);
router.use("/contact", contactAdminRoutes);
router.use("/pages", pagesAdminRoutes);
router.use("/highlights", highlightsAdminRoutes);
router.use("/menu", menuAdminRoutes);
router.use("/journal", journalAdminRoutes);
router.use("/social-links", socialLinkAdminRoutes);
router.use("/site-settings", siteSettingsAdminRoutes);
router.use("/uploads", uploadsAdminRoutes);
router.use("/spotlight", spotlightAdminRoutes);

export default router;
