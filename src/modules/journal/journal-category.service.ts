import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse, type AdminListQueryBase } from "../../utils/adminListQuery.js";
import * as journalCategoryRepository from "./journal-category.repository.js";
import type {
  BlogCategoryInput,
  BlogCategoryRecord,
  BlogCategoryUpdateInput,
} from "./journal-category.types.js";

export async function listBlogCategories(query: AdminListQueryBase) {
  const { items, total } = await journalCategoryRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getBlogCategory(id: number): Promise<BlogCategoryRecord> {
  const category = await journalCategoryRepository.findById(id);
  if (!category) {
    throw new AppError("Journal category not found", 404);
  }
  return category;
}

export async function createBlogCategory(input: BlogCategoryInput): Promise<BlogCategoryRecord> {
  return journalCategoryRepository.create(input);
}

export async function updateBlogCategory(
  id: number,
  input: BlogCategoryUpdateInput
): Promise<BlogCategoryRecord> {
  // Throws 404 if the category does not exist.
  await getBlogCategory(id);
  return journalCategoryRepository.update(id, input);
}

export async function deleteBlogCategory(id: number): Promise<void> {
  await getBlogCategory(id);
  await journalCategoryRepository.remove(id);
}
