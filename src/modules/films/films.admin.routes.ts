import { Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import {
  createVideo,
  deleteVideo,
  getVideo,
  listVideos,
  updateVideo,
} from "./films.controller.js";

const router = Router();

// The legacy Laravel admin could only create and delete; edit (category and link) is new.
router.get("/", requireAdminAuth, listVideos);
router.get("/:id", requireAdminAuth, getVideo);
router.post("/", requireAdminAuth, createVideo);
router.patch("/:id", requireAdminAuth, updateVideo);
router.delete("/:id", requireAdminAuth, deleteVideo);

export default router;
