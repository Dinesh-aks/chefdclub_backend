import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import type { SpotlightListQuery } from "./spotlight.validator.js";
import * as spotlightRepository from "./spotlight.repository.js";
import type {
  PublicSpotlight,
  SpotlightInput,
  SpotlightPlacement,
  SpotlightRecord,
  SpotlightUpdateInput,
} from "./spotlight.types.js";

export async function listPublicSpotlight(placement: SpotlightPlacement): Promise<PublicSpotlight[]> {
  return spotlightRepository.listActive(placement);
}

export async function listSpotlight(query: SpotlightListQuery) {
  const { items, total } = await spotlightRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getSpotlight(id: number): Promise<SpotlightRecord> {
  const spotlight = await spotlightRepository.findById(id);
  if (!spotlight) {
    throw new AppError("Spotlight card not found", 404);
  }
  return spotlight;
}

export async function createSpotlight(input: SpotlightInput): Promise<SpotlightRecord> {
  return spotlightRepository.create(input);
}

export async function deleteSpotlight(id: number): Promise<void> {
  const existing = await getSpotlight(id);
  await spotlightRepository.remove(id);
  if (existing.image) {
    await spotlightRepository.deleteImageFile(existing.image);
  }
}

export async function updateSpotlight(
  id: number,
  input: SpotlightUpdateInput,
): Promise<SpotlightRecord> {
  await getSpotlight(id);
  return spotlightRepository.update(id, input);
}
