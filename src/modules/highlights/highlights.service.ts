import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import type { HighlightListQuery } from "./highlights.validator.js";
import * as highlightsRepository from "./highlights.repository.js";
import type { HighlightInput, HighlightRecord, HighlightUpdateInput } from "./highlights.types.js";

export async function listHighlights(query: HighlightListQuery) {
  const { items, total } = await highlightsRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getHighlight(id: number): Promise<HighlightRecord> {
  const highlight = await highlightsRepository.findById(id);
  if (!highlight) {
    throw new AppError("Highlight not found", 404);
  }
  return highlight;
}

export async function createHighlight(input: HighlightInput): Promise<HighlightRecord> {
  return highlightsRepository.create(input);
}

export async function updateHighlight(
  id: number,
  input: HighlightUpdateInput
): Promise<HighlightRecord> {
  const existing = await getHighlight(id);
  const updated = await highlightsRepository.update(id, input);

  // Remove the replaced image from disk once the DB update succeeded.
  if (input.imageFilename !== undefined && existing.image && input.imageFilename !== existing.image) {
    await highlightsRepository.deleteImageFile(existing.image);
  }

  return updated;
}

export async function deleteHighlight(id: number): Promise<void> {
  const existing = await getHighlight(id);
  await highlightsRepository.remove(id);
  if (existing.image) {
    await highlightsRepository.deleteImageFile(existing.image);
  }
}
