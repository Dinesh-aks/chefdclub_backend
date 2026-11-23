import { AppError } from "../../utils/AppError.js";
import type {
  AdminChangePasswordInput,
  AdminLoginInput,
  AdminProfileUpdateInput,
} from "./auth.types.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trims and requires a non-empty string within maxLength.
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

// Emails are lower-cased so login is case-insensitive.
export function validateAdminLogin(body: unknown): AdminLoginInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }

  const record = body as Record<string, unknown>;
  const email = requiredString(record.email, "email", 255).toLowerCase();
  const password = requiredString(record.password, "password", 255);

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("Validation failed", 400, [{ field: "email", message: "Invalid email address" }]);
  }

  return { email, password };
}

function optionalString(value: unknown, field: string, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
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
  return trimmed || null;
}

// Partial update from multipart form data; an empty optional value clears the field.
export function validateAdminProfileUpdate(
  body: unknown,
  file: Express.Multer.File | undefined
): AdminProfileUpdateInput {
  const record = (body ?? {}) as Record<string, unknown>;
  const update: AdminProfileUpdateInput = {};

  if (record.firstName !== undefined) update.firstName = requiredString(record.firstName, "firstName", 50);
  if (record.lastName !== undefined) update.lastName = optionalString(record.lastName, "lastName", 50);
  if (record.email !== undefined) {
    const email = requiredString(record.email, "email", 255).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError("Validation failed", 400, [{ field: "email", message: "Invalid email address" }]);
    }
    update.email = email;
  }
  if (record.mobile !== undefined) update.mobile = optionalString(record.mobile, "mobile", 25);
  if (record.address !== undefined) update.address = optionalString(record.address, "address", 150);
  if (file) update.imageFilename = file.filename;
  return update;
}

export function validateAdminChangePassword(body: unknown): AdminChangePasswordInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const currentPassword = requiredString(record.currentPassword, "currentPassword", 255);
  const newPassword = requiredString(record.newPassword, "newPassword", 255);
  if (newPassword.length < 6) {
    throw new AppError("Validation failed", 400, [
      { field: "newPassword", message: "newPassword must be at least 6 characters" },
    ]);
  }
  return { currentPassword, newPassword };
}
