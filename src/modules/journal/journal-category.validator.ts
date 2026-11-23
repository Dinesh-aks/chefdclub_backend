import { AppError } from "../../utils/AppError.js";
import { parseSimpleAdminListQuery } from "../../utils/adminListQuery.js";
import type { BlogCategoryInput, BlogCategoryUpdateInput } from "./journal-category.types.js";

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

function parseStatus(value: unknown): boolean {
  if (typeof value !== "boolean") {
    fail("status", "status must be a boolean");
  }
  return value as boolean;
}

function parseSort(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    fail("sort", "sort must be a non-negative integer");
  }
  return num;
}

export function validateCreateBlogCategory(body: unknown): BlogCategoryInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    category: requiredString(record.category, "category", 255),
    slug: requiredString(record.slug, "slug", 255),
    status: record.status === undefined ? true : parseStatus(record.status),
    sort: record.sort === undefined ? 1 : parseSort(record.sort),
  };
}

// Update is partial: only the fields present in the body are validated and returned.
export function validateUpdateBlogCategory(body: unknown): BlogCategoryUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: BlogCategoryUpdateInput = {};
  if (record.category !== undefined) update.category = requiredString(record.category, "category", 255);
  if (record.slug !== undefined) update.slug = requiredString(record.slug, "slug", 255);
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (record.sort !== undefined) update.sort = parseSort(record.sort);
  return update;
}

export function parseBlogCategoryId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const BLOG_CATEGORY_SORT = ["id", "category", "sort"] as const;

export function parseBlogCategoryListQuery(query: Record<string, unknown>) {
  return parseSimpleAdminListQuery(query, BLOG_CATEGORY_SORT, "sort", "asc");
}
