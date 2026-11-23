import { AppError } from "../../utils/AppError.js";
import {
  parseAdminListPagination,
  parseSimpleAdminListQuery,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import type { GalleryPhotoCategory, GalleryPhotoUpdateInput } from "./gallery-photo.types.js";

const CATEGORIES: GalleryPhotoCategory[] = ["all", "veg", "non-veg"];

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    fail(field, `${field} must be a string`);
  }
  const trimmed = (value as string).trim();
  if (trimmed.length > maxLength) {
    fail(field, `${field} must be at most ${maxLength} characters`);
  }
  return trimmed;
}

function requiredCategory(value: unknown): GalleryPhotoCategory {
  if (typeof value !== "string" || !CATEGORIES.includes(value as GalleryPhotoCategory)) {
    fail("category", `category must be one of ${CATEGORIES.join(", ")}`);
  }
  return value as GalleryPhotoCategory;
}

export function validateCreatePhoto(
  body: unknown,
  file: Express.Multer.File | undefined
): { name?: string; category: GalleryPhotoCategory; imageFilename: string } {
  if (!file) {
    fail("image", "image is required");
  }
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    name: optionalString(record.name, "name", 255),
    category: requiredCategory(record.category),
    imageFilename: (file as Express.Multer.File).filename,
  };
}

// Update is partial: only fields present in the body are validated; an uploaded file replaces the image.
export function validateUpdatePhoto(
  body: unknown,
  file: Express.Multer.File | undefined
): GalleryPhotoUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: GalleryPhotoUpdateInput = {};
  if (record.name !== undefined) update.name = optionalString(record.name, "name", 255);
  if (record.category !== undefined) update.category = requiredCategory(record.category);
  if (file) update.imageFilename = file.filename;
  return update;
}

export function parseCategoryQuery(value: unknown): GalleryPhotoCategory | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requiredCategory(value);
}

export function parsePhotoId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const GALLERY_PHOTO_SORT = ["id", "name"] as const;
export type GalleryPhotoSortField = (typeof GALLERY_PHOTO_SORT)[number];

export interface GalleryPhotoListQuery extends AdminListPagination {
  search?: string;
  sort: GalleryPhotoSortField;
  order: SortOrder;
  category?: GalleryPhotoCategory;
}

export function parseGalleryPhotoListQuery(query: Record<string, unknown>): GalleryPhotoListQuery {
  const base = parseSimpleAdminListQuery(query, GALLERY_PHOTO_SORT, "id", "desc");
  const category = parseCategoryQuery(query.category);
  return { ...base, category };
}

export interface PublicGalleryPhotoQuery extends AdminListPagination {
  category?: GalleryPhotoCategory;
}

// Public list: optional category ("all" or empty = every category) plus page/limit (limit max 100).
export function parsePublicGalleryPhotoQuery(query: Record<string, unknown>): PublicGalleryPhotoQuery {
  const category = parseCategoryQuery(query.category === "" ? undefined : query.category);
  return { ...parseAdminListPagination(query), category: category === "all" ? undefined : category };
}
