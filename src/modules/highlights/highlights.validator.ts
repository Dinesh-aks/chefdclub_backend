import { AppError } from "../../utils/AppError.js";
import { parseSimpleAdminListQuery, type AdminListQueryBase } from "../../utils/adminListQuery.js";
import type { HighlightInput, HighlightUpdateInput } from "./highlights.types.js";

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

// Empty values are treated as "not provided".
function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
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

export function validateCreateHighlight(
  body: unknown,
  file: Express.Multer.File | undefined
): HighlightInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    name: optionalString(record.name, "name", 255),
    description: optionalString(record.description, "description", 5000),
    status: record.status === undefined ? true : parseStatus(record.status),
    sort: record.sort === undefined ? 0 : parseSort(record.sort),
    imageFilename: file?.filename,
  };
}

export function validateUpdateHighlight(
  body: unknown,
  file: Express.Multer.File | undefined
): HighlightUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: HighlightUpdateInput = {};
  if (record.name !== undefined) update.name = optionalString(record.name, "name", 255);
  if (record.description !== undefined) {
    update.description = optionalString(record.description, "description", 5000);
  }
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (record.sort !== undefined) update.sort = parseSort(record.sort);
  if (file) update.imageFilename = file.filename;
  return update;
}

export function parseHighlightId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const HIGHLIGHT_SORT = ["id", "name", "sort"] as const;

export interface HighlightListQuery extends AdminListQueryBase {
  status?: boolean;
}

// Optional status filter: "all" or an empty value means no filter.
function parseListStatus(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "" || value === "all") return undefined;
  if (value === "active") return true;
  if (value === "inactive") return false;
  return parseStatus(value);
}

export function parseHighlightListQuery(query: Record<string, unknown>): HighlightListQuery {
  const base = parseSimpleAdminListQuery(query, HIGHLIGHT_SORT, "sort", "asc");
  return { ...base, status: parseListStatus(query.status) };
}
