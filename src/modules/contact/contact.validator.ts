import { AppError } from "../../utils/AppError.js";
import {
  parseAdminListPagination,
  parseAdminListSearch,
  parseAdminListSort,
  type AdminListPagination,
  type SortOrder,
} from "../../utils/adminListQuery.js";
import type { CreateContactMessageInput } from "./contact.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new AppError("Validation failed", 400, [{ field, message: `${field} is required` }]);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError("Validation failed", 400, [{ field, message: `${field} is required` }]);
  }
  if (trimmed.length > maxLength) {
    throw new AppError("Validation failed", 400, [
      { field, message: `${field} must be at most ${maxLength} characters` },
    ]);
  }
  return trimmed;
}

function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredString(value, field, maxLength);
}

// The Cloudflare Turnstile token is optional here; the controller decides whether it is enforced.
function parseTurnstileToken(record: Record<string, unknown>): string | undefined {
  const value = record.turnstileToken;
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredString(value, "turnstileToken", 2048);
}

export interface ValidatedCreateContactMessage {
  input: CreateContactMessageInput;
  turnstileToken?: string;
}

export function validateCreateContactMessage(body: unknown): ValidatedCreateContactMessage {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }

  const record = body as Record<string, unknown>;
  const name = requiredString(record.name, "name", 255);
  const email = requiredString(record.email, "email", 255);
  const mobile = requiredString(record.mobile, "mobile", 255);
  const subject = optionalString(record.subject, "subject", 255);
  const message = requiredString(record.message, "message", 10000);
  const turnstileToken = parseTurnstileToken(record);

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("Validation failed", 400, [{ field: "email", message: "Invalid email address" }]);
  }

  return {
    input: { name, email, mobile, subject, message },
    turnstileToken,
  };
}

export function parseContactMessageId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Validation failed", 400, [{ field: "id", message: "id must be a positive integer" }]);
  }
  return id;
}

// Columns the admin inbox may sort by.
const CONTACT_SORT_FIELDS = ["id", "name", "email", "addDate"] as const;
export type ContactSortField = (typeof CONTACT_SORT_FIELDS)[number];

export interface ContactListQuery extends AdminListPagination {
  search?: string;
  sort: ContactSortField;
  order: SortOrder;
}

export function parseContactListQuery(query: Record<string, unknown>): ContactListQuery {
  const pagination = parseAdminListPagination(query);
  const search = parseAdminListSearch(query);
  const { sort, order } = parseAdminListSort(query, CONTACT_SORT_FIELDS, "addDate", "desc");
  return { ...pagination, search, sort, order };
}
