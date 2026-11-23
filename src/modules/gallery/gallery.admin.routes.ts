import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import { uploadGalleryPhoto } from "../../middleware/upload.js";
import {
  createPhoto,
  deletePhoto,
  getPhoto,
  listPhotos,
  updatePhoto,
} from "./gallery-photo.controller.js";

const router = Router();

// Photos (create/update accept an image upload)
router.get("/photos", requireAdminAuth, listPhotos);
router.get("/photos/:id", requireAdminAuth, getPhoto);
router.post("/photos", requireAdminAuth, uploadGalleryPhoto, createPhoto);
router.patch("/photos/:id", requireAdminAuth, uploadGalleryPhoto, updatePhoto);
router.delete("/photos/:id", requireAdminAuth, deletePhoto);

export default router;
