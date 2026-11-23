import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse, type AdminListPagination } from "../../utils/adminListQuery.js";
import * as journalPublicRepository from "./journal-public.repository.js";
import type { PublicBlogPost, PublicBlogPostSummaryField } from "./journal-public.types.js";

export async function listPublicPosts(
  pagination: AdminListPagination,
  excludeSlug?: string,
  fields?: readonly PublicBlogPostSummaryField[],
) {
  const { items, total } = await journalPublicRepository.listPublic(pagination, excludeSlug, fields);
  return buildAdminListResponse(items, total, pagination);
}

// Inactive or unknown slugs are the same plain 404.
export async function getPublicPost(slug: string): Promise<PublicBlogPost> {
  const post = slug && slug.length <= 255 ? await journalPublicRepository.findPublicBySlug(slug) : null;
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
}
