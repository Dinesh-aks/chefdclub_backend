import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as engagementService from "./journal-engagement.service.js";

// The visitor's IP is what ties a view or a like to one reader (as in the legacy site).
function visitorIp(req: Request): string {
  return req.ip ?? "";
}

function slugOf(req: Request): string {
  return typeof req.params.slug === "string" ? req.params.slug.trim() : "";
}

// Counts one read of the post. Called from the reader's browser, not from the Next.js server.
export const recordPostView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await engagementService.recordView(slugOf(req), visitorIp(req));
    sendSuccess(res, { ok: true }, "View recorded.");
  } catch (error) {
    next(error);
  }
};

// Like count plus whether this visitor has liked the post.
export const getPostLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await engagementService.getLikeState(slugOf(req), visitorIp(req)), "Likes fetched.");
  } catch (error) {
    next(error);
  }
};

// Like or unlike, returning the new state.
export const togglePostLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await engagementService.toggleLike(slugOf(req), visitorIp(req)), "Like updated.");
  } catch (error) {
    next(error);
  }
};
