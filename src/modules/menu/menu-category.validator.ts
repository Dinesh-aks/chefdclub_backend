import { AppError } from "../../utils/AppError.js";
import { parseSimpleAdminListQuery } from "../../utils/adminListQuery.js";
import type { MenuCategoryInput, MenuCategoryUpdateInput } from "./menu-category.types.js";

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim()) {
    fail(field, `${field} is required`);
  }
  const trimmed = (value as string).trim();
  if (trimmed.length > maxLength) {
    fail(field, `${field} must be at most ${maxLength} characters`);
  }
  return trimmed;
}

// "Non-Vegetarian & Co." -> "non-vegetarian-co"; falls back to "category" if nothing usable is left.
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
  return slug || "category";
}

function optionalDescription(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  return requiredString(value, "description", 100000);
}

// Multipart forms send booleans as strings.
function parseStatus(value: unknown): boolean {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  fail("status", "status must be a boolean");
}

function parseSort(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    fail("sort", "sort must be a non-negative integer");
  }
  return num;
}

interface UploadedFiles {
  image?: Express.Multer.File[];
  banner?: Express.Multer.File[];
}

export function validateCreateMenuCategory(
  body: unknown,
  files: UploadedFiles | undefined
): MenuCategoryInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  // Slug, image, banner and description are optional: the admin form only asks for name, order and
  // status. The legacy columns are NOT NULL, so a missing image/description is stored as "" and a
  // missing slug is generated from the name.
  const image = files?.image?.[0];
  const name = requiredString(record.name, "name", 255);
  return {
    name,
    slug: record.slug === undefined || record.slug === "" ? slugify(name) : requiredString(record.slug, "slug", 255),
    description: optionalDescription(record.description),
    status: record.status === undefined ? true : parseStatus(record.status),
    sort: record.sort === undefined ? 0 : parseSort(record.sort),
    imageFilename: image?.filename,
    bannerFilename: files?.banner?.[0]?.filename,
  };
}

export function validateUpdateMenuCategory(
  body: unknown,
  files: UploadedFiles | undefined
): MenuCategoryUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: MenuCategoryUpdateInput = {};
  if (record.name !== undefined) update.name = requiredString(record.name, "name", 255);
  if (record.slug !== undefined) update.slug = requiredString(record.slug, "slug", 255);
  if (record.description !== undefined) {
    update.description = requiredString(record.description, "description", 100000);
  }
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (record.sort !== undefined) update.sort = parseSort(record.sort);
  if (files?.image?.[0]) update.imageFilename = files.image[0].filename;
  if (files?.banner?.[0]) update.bannerFilename = files.banner[0].filename;
  return update;
}

export function parseMenuCategoryId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const MENU_CATEGORY_SORT = ["id", "name", "sort", "createdAt", "updatedAt"] as const;
export type MenuCategorySortField = (typeof MENU_CATEGORY_SORT)[number];

export interface MenuCategoryListQuery {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  sort: MenuCategorySortField;
  order: "asc" | "desc";
  status?: boolean;
}

// List filter: empty or "all" means no filter.
function parseOptionalListStatus(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === "all") return undefined;
  if (value === "true" || value === true || value === "active") return true;
  if (value === "false" || value === false || value === "inactive") return false;
  fail("status", "status must be active, inactive, true, false, or all");
}

export function parseMenuCategoryListQuery(query: Record<string, unknown>): MenuCategoryListQuery {
  const base = parseSimpleAdminListQuery(query, MENU_CATEGORY_SORT, "sort", "asc");
  const status = parseOptionalListStatus(query.status);
  return { ...base, status };
}
