import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as journalPostRepository from "./journal-post.repository.js";
import type { BlogPostListQuery } from "./journal-post.validator.js";
import type { BlogPostInput, BlogPostRecord, BlogPostUpdateInput } from "./journal-post.types.js";

export async function listBlogPosts(query: BlogPostListQuery) {
  const { items, total } = await journalPostRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getBlogPost(id: number): Promise<BlogPostRecord> {
  const post = await journalPostRepository.findById(id);
  if (!post) {
    throw new AppError("Journal post not found", 404);
  }
  return post;
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPostRecord> {
  const created = await journalPostRepository.create(input);
  if (input.imageFilename) {
    await journalPostRepository.finalizeHeroUpload(created.id, input.imageFilename);
    const refreshed = await journalPostRepository.findById(created.id);
    if (refreshed) return refreshed;
  }
  return created;
}

export async function updateBlogPost(
  id: number,
  input: BlogPostUpdateInput
): Promise<BlogPostRecord> {
  const existing = await getBlogPost(id);
  const updated = await journalPostRepository.update(id, input);

  // A new image replaced the old one, so remove the old file from disk.
  if (input.imageFilename !== undefined && existing.image && input.imageFilename !== existing.image) {
    await journalPostRepository.deleteImageFile(id, existing.image);
  }

  return updated;
}

export async function deleteBlogPost(id: number): Promise<void> {
  const existing = await getBlogPost(id);
  await journalPostRepository.remove(id);
  if (existing.image) {
    await journalPostRepository.deleteImageFile(id, existing.image);
  }
}
