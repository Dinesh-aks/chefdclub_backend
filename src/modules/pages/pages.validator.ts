import { AppError } from "../../utils/AppError.js";
import type { CmsPageUpdateInput, PageSlug } from "./pages.types.js";

const PAGE_SLUGS: PageSlug[] = ["about-us", "privacy-policy", "terms-and-conditions"];

function fail(field: string, message: string): never {
  throw new AppError("Validation failed", 400, [{ field, message }]);
}

// Only strings are accepted; values are trimmed and length-capped.
function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined) {
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

// Only the known CMS page slugs are allowed.
export function parsePageSlug(value: unknown): PageSlug {
  if (typeof value !== "string" || !PAGE_SLUGS.includes(value as PageSlug)) {
    fail("slug", `slug must be one of ${PAGE_SLUGS.join(", ")}`);
  }
  return value as PageSlug;
}

export function validateUpdatePage(
  body: unknown,
  file: Express.Multer.File | undefined
): CmsPageUpdateInput {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const record = body as Record<string, unknown>;
  const update: CmsPageUpdateInput = {};
  if (record.title !== undefined) update.title = optionalString(record.title, "title", 255);
  if (record.short !== undefined) update.short = optionalString(record.short, "short", 5000);
  if (record.description !== undefined) {
    update.description = optionalString(record.description, "description", 100000);
  }
  if (record.seoTitle !== undefined) update.seoTitle = optionalString(record.seoTitle, "seoTitle", 500);
  if (record.seoDescription !== undefined) {
    update.seoDescription = optionalString(record.seoDescription, "seoDescription", 500);
  }
  if (file) update.bannerFilename = file.filename;
  return update;
}
