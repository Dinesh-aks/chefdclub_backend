import { Router } from "express";
import { getPostLike, recordPostView, togglePostLike } from "./journal-engagement.controller.js";
import { getPublicPost, listPublicPosts } from "./journal-public.controller.js";

const router = Router();

// Public, active posts only (powers the website Journal).
router.get("/posts", listPublicPosts);
router.get("/posts/:slug", getPublicPost);

// Reader engagement: views and likes.
router.post("/posts/:slug/view", recordPostView);
router.get("/posts/:slug/like", getPostLike);
router.post("/posts/:slug/like", togglePostLike);

export default router;
