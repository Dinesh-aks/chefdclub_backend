import { AppError } from "../../utils/AppError.js";
import {
  parseAdminListPagination,
  parseSimpleAdminListQuery,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import type {
  FilmCategory,
  FilmInput,
  FilmUpdateInput,
} from "./films.types.js";

const CATEGORIES: FilmCategory[] = ["all", "veg", "non-veg", "private-dining"];

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

function requiredCategory(value: unknown): FilmCategory {
  if (typeof value !== "string" || !CATEGORIES.includes(value as FilmCategory)) {
    fail("category", `category must be one of ${CATEGORIES.join(", ")}`);
  }
  return value as FilmCategory;
}

// The source is a YouTube URL or Facebook iframe embed HTML, hence the generous length limit.
function requiredSource(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    fail("source", "source is required");
  }
  const trimmed = (value as string).trim();
  if (trimmed.length > 5000) {
    fail("source", "source must be at most 5000 characters");
  }
  return trimmed;
}

export function validateCreateVideo(body: unknown): FilmInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    category: requiredCategory(record.category),
    source: requiredSource(record.source),
  };
}

// Partial update: only the fields present in the body are changed.
export function validateUpdateVideo(body: unknown): FilmUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: FilmUpdateInput = {};
  if (record.category !== undefined) update.category = requiredCategory(record.category);
  if (record.source !== undefined) update.source = requiredSource(record.source);
  return update;
}

export function parseCategoryQuery(value: unknown): FilmCategory | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requiredCategory(value);
}

export function parseVideoId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const FILM_SORT = ["id", "addDate"] as const;
export type FilmSortField = (typeof FILM_SORT)[number];

export interface FilmListQuery extends AdminListPagination {
  search?: string;
  sort: FilmSortField;
  order: SortOrder;
  category?: FilmCategory;
}

export function parseFilmListQuery(query: Record<string, unknown>): FilmListQuery {
  const base = parseSimpleAdminListQuery(query, FILM_SORT, "id", "desc");
  const category = parseCategoryQuery(query.category);
  return { ...base, category };
}

export interface PublicFilmQuery extends AdminListPagination {
  category?: FilmCategory;
}

// Public list: optional category ("all" or empty = every category) plus page/limit (limit max 100).
export function parsePublicFilmQuery(query: Record<string, unknown>): PublicFilmQuery {
  const category = parseCategoryQuery(query.category === "" ? undefined : query.category);
  return { ...parseAdminListPagination(query), category: category === "all" ? undefined : category };
}
