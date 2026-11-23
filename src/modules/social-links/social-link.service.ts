import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse, type AdminListQueryBase } from "../../utils/adminListQuery.js";
import * as socialLinkRepository from "./social-link.repository.js";
import type { SocialLinkInput, SocialLinkRecord, SocialLinkUpdateInput } from "./social-link.types.js";

export async function listSocialLinks(query: AdminListQueryBase) {
  const { items, total } = await socialLinkRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function listPublicSocialLinks(): Promise<SocialLinkRecord[]> {
  return socialLinkRepository.listAll();
}

export async function getSocialLink(id: number): Promise<SocialLinkRecord> {
  const link = await socialLinkRepository.findById(id);
  if (!link) {
    throw new AppError("Social link not found", 404);
  }
  return link;
}

export async function createSocialLink(input: SocialLinkInput): Promise<SocialLinkRecord> {
  return socialLinkRepository.create(input);
}

export async function updateSocialLink(
  id: number,
  input: SocialLinkUpdateInput
): Promise<SocialLinkRecord> {
  // 404 for unknown ids before touching the row.
  await getSocialLink(id);
  return socialLinkRepository.update(id, input);
}

export async function deleteSocialLink(id: number): Promise<void> {
  await getSocialLink(id);
  await socialLinkRepository.remove(id);
}
