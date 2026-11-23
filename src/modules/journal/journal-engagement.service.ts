import { AppError } from "../../utils/AppError.js";
import * as engagementRepository from "./journal-engagement.repository.js";
import type { LikeState } from "./journal-engagement.repository.js";

// Inactive or unknown slugs are the same plain 404 as the post itself.
async function requirePostId(slug: string): Promise<number> {
  const id = slug && slug.length <= 255 ? await engagementRepository.findActivePostId(slug) : null;
  if (id === null) {
    throw new AppError("Post not found", 404);
  }
  return id;
}

export async function recordView(slug: string, ip: string): Promise<void> {
  await engagementRepository.recordView(await requirePostId(slug), ip);
}

export async function getLikeState(slug: string, ip: string): Promise<LikeState> {
  return engagementRepository.getLikeState(await requirePostId(slug), ip);
}

export async function toggleLike(slug: string, ip: string): Promise<LikeState> {
  return engagementRepository.toggleLike(await requirePostId(slug), ip);
}
