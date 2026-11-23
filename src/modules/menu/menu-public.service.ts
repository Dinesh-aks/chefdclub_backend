import { AppError } from "../../utils/AppError.js";
import * as menuPublicRepository from "./menu-public.repository.js";
import type { PublicMenuCategoryQuery } from "./menu-public.validator.js";
import type { PublicMenuCategory, PublicMenuTab } from "./menu-public.types.js";

export function listTabs(): Promise<PublicMenuTab[]> {
  return menuPublicRepository.listTabs();
}

// Inactive or unknown slugs are the same plain 404.
export async function getCategory(
  slug: string,
  query: PublicMenuCategoryQuery,
): Promise<PublicMenuCategory> {
  const category =
    slug && slug.length <= 255 ? await menuPublicRepository.findBySlug(slug, query) : null;
  if (!category) {
    throw new AppError("Menu not found", 404);
  }
  return category;
}
