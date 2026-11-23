import { AppError } from "../../utils/AppError.js";
import { parseSimpleAdminListQuery } from "../../utils/adminListQuery.js";
import type { SocialLinkInput, SocialLinkUpdateInput } from "./social-link.types.js";

// Throws a 400 validation error for a single field.
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

export function validateCreateSocialLink(body: unknown): SocialLinkInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  return {
    link: requiredString(record.link, "link", 255),
    icon: requiredString(record.icon, "icon", 255),
  };
}

// Partial update: only fields present in the body are validated and changed.
export function validateUpdateSocialLink(body: unknown): SocialLinkUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: SocialLinkUpdateInput = {};
  if (record.link !== undefined) update.link = requiredString(record.link, "link", 255);
  if (record.icon !== undefined) update.icon = requiredString(record.icon, "icon", 255);
  return update;
}

// Whitelist of sortable columns for the admin list.
const SOCIAL_LINK_SORT = ["id", "link", "icon"] as const;

export function parseSocialLinkListQuery(query: Record<string, unknown>) {
  return parseSimpleAdminListQuery(query, SOCIAL_LINK_SORT, "id", "asc");
}

export function parseSocialLinkId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    fail("id", "id must be a positive integer");
  }
  return id;
}
