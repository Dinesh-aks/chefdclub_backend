import { AppError } from "../../utils/AppError.js";
import {
  parseAdminListPagination,
  parseAdminListSearch,
  parseAdminListSort,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import type { BlogPostInput, BlogPostUpdateInput } from "./journal-post.types.js";

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

// Empty/missing values become undefined; non-empty values follow the required-string rules.
function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredString(value, field, maxLength);
}

// Multipart form fields arrive as strings, so accept "true"/"false" as well as booleans.
function parseStatus(value: unknown): boolean {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  fail("status", "status must be a boolean");
}

function parseCatId(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num <= 0) {
    fail("catId", "catId must be a positive integer");
  }
  return num;
}

export function validateCreateBlogPost(
  body: unknown,
  file: Express.Multer.File | undefined
): BlogPostInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    catId: parseCatId(record.catId),
    author: requiredString(record.author, "author", 255),
    title: requiredString(record.title, "title", 255),
    slug: requiredString(record.slug, "slug", 255),
    description: requiredString(record.description, "description", 100000),
    video: optionalString(record.video, "video", 500),
    publishDate: requiredString(record.publishDate, "publishDate", 255),
    seoTitle: optionalString(record.seoTitle, "seoTitle", 250),
    seoDescription: optionalString(record.seoDescription, "seoDescription", 250),
    status: record.status === undefined ? true : parseStatus(record.status),
    imageFilename: file?.filename,
  };
}

// Update is partial: only fields present in the body are validated; an uploaded file replaces the image.
export function validateUpdateBlogPost(
  body: unknown,
  file: Express.Multer.File | undefined
): BlogPostUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: BlogPostUpdateInput = {};
  if (record.catId !== undefined) update.catId = parseCatId(record.catId);
  if (record.author !== undefined) update.author = requiredString(record.author, "author", 255);
  if (record.title !== undefined) update.title = requiredString(record.title, "title", 255);
  if (record.slug !== undefined) update.slug = requiredString(record.slug, "slug", 255);
  if (record.description !== undefined) {
    update.description = requiredString(record.description, "description", 100000);
  }
  if (record.video !== undefined) update.video = optionalString(record.video, "video", 500);
  if (record.publishDate !== undefined) {
    update.publishDate = requiredString(record.publishDate, "publishDate", 255);
  }
  if (record.seoTitle !== undefined) update.seoTitle = optionalString(record.seoTitle, "seoTitle", 250);
  if (record.seoDescription !== undefined) {
    update.seoDescription = optionalString(record.seoDescription, "seoDescription", 250);
  }
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (file) update.imageFilename = file.filename;
  return update;
}

export function parseBlogPostId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const BLOG_POST_SORT = ["id", "title", "updatedAt", "publishDate"] as const;
export type BlogPostSortField = (typeof BLOG_POST_SORT)[number];

export interface BlogPostListQuery extends AdminListPagination {
  search?: string;
  catId?: number;
  status?: boolean;
  sort: BlogPostSortField;
  order: SortOrder;
}

// List filters: "all" or an empty value means no filter.
function isEmptyFilter(value: unknown): boolean {
  return value === undefined || value === null || value === "" || value === "all";
}

function parseOptionalListCatId(value: unknown): number | undefined {
  if (isEmptyFilter(value)) return undefined;
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("catId", "catId must be a positive integer or all");
  }
  return id;
}

function parseOptionalListStatus(value: unknown): boolean | undefined {
  if (isEmptyFilter(value)) return undefined;
  if (value === "true" || value === true || value === "active") return true;
  if (value === "false" || value === false || value === "inactive") return false;
  fail("status", "status must be active, inactive, true, false, or all");
}

export function parseBlogPostListQuery(query: Record<string, unknown>): BlogPostListQuery {
  const pagination = parseAdminListPagination(query);
  const search = parseAdminListSearch(query);
  const { sort, order } = parseAdminListSort(query, BLOG_POST_SORT, "updatedAt", "desc");
  const catId = parseOptionalListCatId(query.catId);
  const status = parseOptionalListStatus(query.status);
  return { ...pagination, search, catId, status, sort, order };
}
