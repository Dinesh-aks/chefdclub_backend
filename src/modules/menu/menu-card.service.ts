import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as menuCardRepository from "./menu-card.repository.js";
import type { MenuCardListQuery } from "./menu-card.validator.js";
import type { MenuCardInput, MenuCardRecord, MenuCardUpdateInput } from "./menu-card.types.js";

export async function listMenuCards(query: MenuCardListQuery) {
  const { items, total } = await menuCardRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getMenuCard(id: number): Promise<MenuCardRecord> {
  const card = await menuCardRepository.findById(id);
  if (!card) {
    throw new AppError("Menu card not found", 404);
  }
  return card;
}

export async function createMenuCard(input: MenuCardInput): Promise<MenuCardRecord> {
  return menuCardRepository.create(input);
}

export async function updateMenuCard(
  id: number,
  input: MenuCardUpdateInput
): Promise<MenuCardRecord> {
  const existing = await getMenuCard(id);
  const updated = await menuCardRepository.update(id, input);

  // Remove the replaced banner from disk once the DB update succeeded.
  if (
    input.bannerFilename !== undefined &&
    existing.banner &&
    input.bannerFilename !== existing.banner
  ) {
    await menuCardRepository.deleteBannerFile(existing.banner);
  }

  return updated;
}

export async function deleteMenuCard(id: number): Promise<void> {
  const existing = await getMenuCard(id);
  await menuCardRepository.remove(id);
  if (existing.banner) {
    await menuCardRepository.deleteBannerFile(existing.banner);
  }
}
