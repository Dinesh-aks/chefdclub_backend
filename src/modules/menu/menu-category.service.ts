import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import type { MenuCategoryListQuery } from "./menu-category.validator.js";
import * as menuCategoryRepository from "./menu-category.repository.js";
import type {
  MenuCategoryInput,
  MenuCategoryRecord,
  MenuCategoryUpdateInput,
} from "./menu-category.types.js";

export async function listMenuCategories(query: MenuCategoryListQuery) {
  const { items, total } = await menuCategoryRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getMenuCategory(id: number): Promise<MenuCategoryRecord> {
  const category = await menuCategoryRepository.findById(id);
  if (!category) {
    throw new AppError("Menu category not found", 404);
  }
  return category;
}

export async function createMenuCategory(input: MenuCategoryInput): Promise<MenuCategoryRecord> {
  return menuCategoryRepository.create(input);
}

export async function updateMenuCategory(
  id: number,
  input: MenuCategoryUpdateInput
): Promise<MenuCategoryRecord> {
  const existing = await getMenuCategory(id);
  const updated = await menuCategoryRepository.update(id, input);

  // Remove replaced image/banner files from disk once the DB update succeeded.
  if (input.imageFilename !== undefined && input.imageFilename !== existing.image) {
    await menuCategoryRepository.deleteImageFile(existing.image);
  }
  if (
    input.bannerFilename !== undefined &&
    existing.banner &&
    input.bannerFilename !== existing.banner
  ) {
    await menuCategoryRepository.deleteImageFile(existing.banner);
  }

  return updated;
}

export async function deleteMenuCategory(id: number): Promise<void> {
  const existing = await getMenuCategory(id);
  await menuCategoryRepository.remove(id);
  await menuCategoryRepository.deleteImageFile(existing.image);
  if (existing.banner) {
    await menuCategoryRepository.deleteImageFile(existing.banner);
  }
}
