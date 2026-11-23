import { Router } from "express";
import healthRoutes from "./health/health.routes.js";
import contactRoutes from "./contact/contact.routes.js";
import reservationRoutes from "./reservations/reservation.routes.js";
import faqRoutes from "./faq/faq.routes.js";
import galleryRoutes from "./gallery/gallery.routes.js";
import filmsRoutes from "./films/films.routes.js";
import pagesRoutes from "./pages/pages.routes.js";
import socialLinkRoutes from "./social-links/social-link.routes.js";
import journalRoutes from "./journal/journal.routes.js";
import menuRoutes from "./menu/menu.routes.js";
import spotlightRoutes from "./spotlight/spotlight.routes.js";
import adminRoutes from "./admin/admin.routes.js";

const router = Router();

// Public routes.
router.use("/health", healthRoutes);
router.use("/contact", contactRoutes);
router.use("/reservations", reservationRoutes);
router.use("/faq", faqRoutes);
router.use("/gallery", galleryRoutes);
router.use("/films", filmsRoutes);
router.use("/pages", pagesRoutes);
router.use("/social-links", socialLinkRoutes);
router.use("/journal", journalRoutes);
router.use("/menu", menuRoutes);
router.use("/spotlight", spotlightRoutes);
// Admin routes
router.use("/admin", adminRoutes);

export default router;
