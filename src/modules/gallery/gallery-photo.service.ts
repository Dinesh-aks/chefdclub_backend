import { AppError } from "../../utils/AppError.js";
import { buildAdminListResponse } from "../../utils/adminListQuery.js";
import * as galleryPhotoRepository from "./gallery-photo.repository.js";
import type { GalleryPhotoListQuery, PublicGalleryPhotoQuery } from "./gallery-photo.validator.js";
import type {
  GalleryPhotoInput,
  GalleryPhotoRecord,
  GalleryPhotoUpdateInput,
} from "./gallery-photo.types.js";

export async function listPublicPhotos(query: PublicGalleryPhotoQuery) {
  const { items, total } = await galleryPhotoRepository.listPublicPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function listPhotos(query: GalleryPhotoListQuery) {
  const { items, total } = await galleryPhotoRepository.listPage(query);
  return buildAdminListResponse(items, total, query);
}

export async function getPhoto(id: number): Promise<GalleryPhotoRecord> {
  const photo = await galleryPhotoRepository.findById(id);
  if (!photo) {
    throw new AppError("Gallery photo not found", 404);
  }
  return photo;
}

export async function createPhoto(input: GalleryPhotoInput): Promise<GalleryPhotoRecord> {
  return galleryPhotoRepository.create(input);
}

export async function updatePhoto(
  id: number,
  input: GalleryPhotoUpdateInput
): Promise<GalleryPhotoRecord> {
  const existing = await getPhoto(id);
  const updated = await galleryPhotoRepository.update(id, input);

  // A new image replaced the old one, so remove the old file from disk.
  if (input.imageFilename !== undefined && input.imageFilename !== existing.image) {
    await galleryPhotoRepository.deleteImageFile(existing.image);
  }

  return updated;
}

export async function deletePhoto(id: number): Promise<void> {
  const existing = await getPhoto(id);
  await galleryPhotoRepository.remove(id);
  await galleryPhotoRepository.deleteImageFile(existing.image);
}
