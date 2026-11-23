import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadAdminProfileImage } from "../../middleware/upload.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", requireAdminAuth, authController.me);
router.get("/profile", requireAdminAuth, authController.getProfile);
router.patch("/profile", requireAdminAuth, uploadAdminProfileImage, authController.updateProfile);
router.post("/change-password", requireAdminAuth, authController.changePassword);
// No auth: an expired session must still be able to clear its cookie.
router.post("/logout", authController.logout);

export default router;
