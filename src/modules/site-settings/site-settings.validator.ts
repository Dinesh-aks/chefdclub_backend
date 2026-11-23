import { AppError } from "../../utils/AppError.js";
import type { SiteSettingsUpdateInput } from "./site-settings.types.js";

function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new AppError("Validation failed", 400, [{ field, message: `${field} must be a string` }]);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AppError("Validation failed", 400, [
      { field, message: `${field} must be at most ${maxLength} characters` },
    ]);
  }
  return trimmed;
}

// Partial update: only fields present in the body are changed; an empty value clears the field (null).
export function validateUpdateSiteSettings(body: unknown): SiteSettingsUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: SiteSettingsUpdateInput = {};
  if (record.email !== undefined) update.email = optionalString(record.email, "email", 255) ?? null;
  if (record.phone !== undefined) update.phone = optionalString(record.phone, "phone", 50) ?? null;
  if (record.address !== undefined) {
    update.address = optionalString(record.address, "address", 500) ?? null;
  }
  return update;
}
