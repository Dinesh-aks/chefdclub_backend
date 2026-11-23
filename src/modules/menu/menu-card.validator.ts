import { AppError } from "../../utils/AppError.js";
import {
  parseSimpleAdminListQuery,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import { MENU_CARD_TYPE_LABELS, type MenuCardInput, type MenuCardType, type MenuCardUpdateInput } from "./menu-card.types.js";

const VALID_TYPES = Object.keys(MENU_CARD_TYPE_LABELS).map(Number);
// Menu ids used by the site (1-3).
const VALID_MENUS = [1, 2, 3];

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

// Multipart forms send booleans as strings.
function parseStatus(value: unknown): boolean {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  fail("status", "status must be a boolean");
}

function parseBool(value: unknown, field: string): boolean {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  fail(field, `${field} must be a boolean`);
}

function parseSort(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 0) {
    fail("sort", "sort must be a non-negative integer");
  }
  return num;
}

function parseMenu(value: unknown): number {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!VALID_MENUS.includes(num)) {
    fail("menu", `menu must be one of ${VALID_MENUS.join(", ")}`);
  }
  return num;
}

function parseType(value: unknown): MenuCardType {
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!VALID_TYPES.includes(num)) {
    fail("type", `type must be one of ${VALID_TYPES.join(", ")}`);
  }
  return num as MenuCardType;
}

export function validateCreateMenuCard(
  body: unknown,
  file: Express.Multer.File | undefined
): MenuCardInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    menu: parseMenu(record.menu),
    type: parseType(record.type),
    name: requiredString(record.name, "name", 255),
    slug: requiredString(record.slug, "slug", 255),
    status: record.status === undefined ? true : parseStatus(record.status),
    sort: record.sort === undefined ? 0 : parseSort(record.sort),
    showOnHome: record.showOnHome === undefined ? false : parseBool(record.showOnHome, "showOnHome"),
    bannerFilename: file?.filename,
  };
}

export function validateUpdateMenuCard(
  body: unknown,
  file: Express.Multer.File | undefined
): MenuCardUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: MenuCardUpdateInput = {};
  if (record.menu !== undefined) update.menu = parseMenu(record.menu);
  if (record.type !== undefined) update.type = parseType(record.type);
  if (record.name !== undefined) update.name = requiredString(record.name, "name", 255);
  if (record.slug !== undefined) update.slug = requiredString(record.slug, "slug", 255);
  if (record.status !== undefined) update.status = parseStatus(record.status);
  if (record.sort !== undefined) update.sort = parseSort(record.sort);
  if (record.showOnHome !== undefined) update.showOnHome = parseBool(record.showOnHome, "showOnHome");
  if (file) update.bannerFilename = file.filename;
  return update;
}

export function parseMenuCardId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}

// Optional ?menu= list filter.
export function parseMenuQuery(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return parseMenu(value);
}

// Columns the admin table may sort by.
const MENU_CARD_SORT = ["id", "name", "sort", "menu", "type", "createdAt"] as const;
export type MenuCardSortField = (typeof MENU_CARD_SORT)[number];

export interface MenuCardListQuery extends AdminListPagination {
  search?: string;
  sort: MenuCardSortField;
  order: SortOrder;
  menu?: number;
  type?: MenuCardType;
  status?: boolean;
}

// List filters: "all" or an empty value means no filter.
function isEmptyFilter(value: unknown): boolean {
  return value === undefined || value === null || value === "" || value === "all";
}

function parseListType(value: unknown): MenuCardType | undefined {
  return isEmptyFilter(value) ? undefined : parseType(value);
}

function parseListStatus(value: unknown): boolean | undefined {
  if (isEmptyFilter(value)) return undefined;
  if (value === "active") return true;
  if (value === "inactive") return false;
  return parseStatus(value);
}

export function parseMenuCardListQuery(query: Record<string, unknown>): MenuCardListQuery {
  const base = parseSimpleAdminListQuery(query, MENU_CARD_SORT, "sort", "asc");
  const menu = isEmptyFilter(query.menu) ? undefined : parseMenuQuery(query.menu);
  const type = parseListType(query.type);
  const status = parseListStatus(query.status);
  return { ...base, menu, type, status };
}
