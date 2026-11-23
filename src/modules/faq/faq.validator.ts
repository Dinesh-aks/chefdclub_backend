import { AppError } from "../../utils/AppError.js";
import {
  parseAdminListPagination,
  parseAdminListSearch,
  parseAdminListSort,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import type { FaqCategory, FaqInput, FaqUpdateInput } from "./faq.types.js";

// Allowed FAQ categories (stored as a numeric "menu" column in the DB).
const CATEGORIES: FaqCategory[] = ["veg", "non-veg", "wine-pairing"];

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

function requiredCategory(value: unknown): FaqCategory {
  if (typeof value !== "string" || !CATEGORIES.includes(value as FaqCategory)) {
    fail("category", `category must be one of ${CATEGORIES.join(", ")}`);
  }
  return value as FaqCategory;
}

function requiredSort(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    fail("sort", "sort must be a non-negative integer");
  }
  return num;
}

function requiredStatus(value: unknown): boolean {
  if (typeof value !== "boolean") {
    fail("status", "status must be a boolean");
  }
  return value as boolean;
}

export function validateCreateFaq(body: unknown): FaqInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    question: requiredString(record.question, "question", 500),
    answer: requiredString(record.answer, "answer", 10000),
    category: requiredCategory(record.category),
    sort: record.sort === undefined ? 1 : requiredSort(record.sort),
    status: record.status === undefined ? true : requiredStatus(record.status),
  };
}

// Update is partial: only the fields present in the body are validated and returned.
export function validateUpdateFaq(body: unknown): FaqUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: FaqUpdateInput = {};
  if (record.question !== undefined) update.question = requiredString(record.question, "question", 500);
  if (record.answer !== undefined) update.answer = requiredString(record.answer, "answer", 10000);
  if (record.category !== undefined) update.category = requiredCategory(record.category);
  if (record.sort !== undefined) update.sort = requiredSort(record.sort);
  if (record.status !== undefined) update.status = requiredStatus(record.status);
  return update;
}

export function parseFaqId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

export function parseCategoryParam(value: unknown): FaqCategory {
  return requiredCategory(value);
}

// Columns the admin table may sort by.
const FAQ_SORT_FIELDS = ["id", "question", "sort", "status", "menu"] as const;
export type FaqSortField = (typeof FAQ_SORT_FIELDS)[number];

export interface FaqListQuery extends AdminListPagination {
  search?: string;
  category?: FaqCategory;
  status?: boolean;
  sort: FaqSortField;
  order: SortOrder;
}

// List filters: "all" or an empty value means no filter.
function parseOptionalListCategory(value: unknown): FaqCategory | undefined {
  if (value === undefined || value === null || value === "" || value === "all") return undefined;
  return requiredCategory(value);
}

function parseOptionalListStatus(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "" || value === "all") return undefined;
  if (value === "true" || value === true || value === "active") return true;
  if (value === "false" || value === false || value === "inactive") return false;
  fail("status", "status must be active, inactive, true, false, or all");
}

export function parseFaqListQuery(query: Record<string, unknown>): FaqListQuery {
  const pagination = parseAdminListPagination(query);
  const search = parseAdminListSearch(query);
  const { sort, order } = parseAdminListSort(query, FAQ_SORT_FIELDS, "sort", "asc");
  const category = parseOptionalListCategory(query.category);
  const status = parseOptionalListStatus(query.status);
  return { ...pagination, search, category, status, sort, order };
}
