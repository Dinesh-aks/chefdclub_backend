import { AppError } from "../../utils/AppError.js";
import { parseSimpleAdminListQuery, type AdminListQueryBase } from "../../utils/adminListQuery.js";
import type { SpotlightInput, SpotlightPlacement, SpotlightUpdateInput } from "./spotlight.types.js";

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

// The title is optional, but its column is NOT NULL, so "no title" is stored as an empty string.
function optionalTitle(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    fail("title", "title must be a string");
  }
  const trimmed = (value as string).trim();
  if (trimmed.length > 255) {
    fail("title", "title must be at most 255 characters");
  }
  return trimmed;
}

// Missing → undefined (leave unchanged). Empty string → null (clear the field).
function nullableString(value: unknown, field: string, maxLength: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    fail(field, `${field} must be a string`);
  }
  const trimmed = (value as string).trim();
  if (trimmed.length > maxLength) {
    fail(field, `${field} must be at most ${maxLength} characters`);
  }
  return trimmed || null;
}

// Multipart forms send booleans as strings.
function parseStatus(value: unknown): boolean {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  fail("status", "status must be a boolean");
}

const PLACEMENTS: SpotlightPlacement[] = ["hero", "story"];

function parsePlacement(value: unknown): SpotlightPlacement {
  if (typeof value !== "string" || !PLACEMENTS.includes(value as SpotlightPlacement)) {
    fail("placement", `placement must be one of ${PLACEMENTS.join(", ")}`);
  }
  return value as SpotlightPlacement;
}

/** Public list: which homepage spot to load (hero when left out). */
export function parsePublicPlacement(value: unknown): SpotlightPlacement {
  return value === undefined || value === "" ? "hero" : parsePlacement(value);
}

function parseSort(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    fail("sort", "sort must be a non-negative integer");
  }
  return num;
}

function asRecord(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  return body as Record<string, unknown>;
}

export function validateCreateSpotlight(
  body: unknown,
  file: Express.Multer.File | undefined,
): SpotlightInput {
  const record = asRecord(body);
  return {
    title: optionalTitle(record.title),
    tag: nullableString(record.tag, "tag", 255) ?? null,
    badge: nullableString(record.badge, "badge", 50) ?? null,
    placement: record.placement === undefined ? "hero" : parsePlacement(record.placement),
    alt: nullableString(record.alt, "alt", 255) ?? null,
    status: record.status === undefined ? true : parseStatus(record.status),
    sort: record.sort === undefined ? 0 : parseSort(record.sort),
    imageFilename: file?.filename,
  };
}

export function validateUpdateSpotlight(
  body: unknown,
  file: Express.Multer.File | undefined,
): SpotlightUpdateInput {
  const record = asRecord(body);
  const update: SpotlightUpdateInput = {};
  if (record.title !== undefined) update.title = optionalTitle(record.title);
  const tag = nullableString(record.tag, "tag", 255);
  if (tag !== undefined) update.tag = tag;
  const badge = nullableString(record.badge, "badge", 50);
  if (badge !== undefined) update.badge = badge;
  if (record.placement !== undefined) update.placement = parsePlacement(record.placement);
  const alt = nullableString(record.alt, "alt", 255);
  if (alt !== undefined) update.alt = alt;
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (record.sort !== undefined) update.sort = parseSort(record.sort);
  if (file) update.imageFilename = file.filename;
  return update;
}

export function parseSpotlightId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Columns the admin table may sort by.
const SPOTLIGHT_SORT = ["id", "title", "sort"] as const;

export interface SpotlightListQuery extends AdminListQueryBase {
  status?: boolean;
  placement?: SpotlightPlacement;
}

// Optional status filter: "all" or an empty value means no filter.
function parseListStatus(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "" || value === "all") return undefined;
  if (value === "active") return true;
  if (value === "inactive") return false;
  return parseStatus(value);
}

export function parseSpotlightListQuery(query: Record<string, unknown>): SpotlightListQuery {
  const base = parseSimpleAdminListQuery(query, SPOTLIGHT_SORT, "sort", "asc");
  // Optional placement filter: "all" or an empty value means both.
  const placement =
    query.placement === undefined || query.placement === "" || query.placement === "all"
      ? undefined
      : parsePlacement(query.placement);
  return { ...base, status: parseListStatus(query.status), placement };
}
