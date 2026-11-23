import { AppError } from "../../utils/AppError.js";
import { MENU_TYPE_SLUG_TO_ID, type MenuTypeSlug } from "./menu-public.types.js";

const TYPE_SLUGS = Object.keys(MENU_TYPE_SLUG_TO_ID) as MenuTypeSlug[];
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 100;

export interface PublicMenuCategoryQuery {
  /** Cards per meal type page. */
  limit: number;
  /** Meal type to show; every type when left out. */
  type?: MenuTypeSlug;
  /** The requested page for each meal type, e.g. { dinner: 2 }; missing means page 1. */
  pages: Partial<Record<MenuTypeSlug, number>>;
}

function positiveInt(value: unknown): number | undefined {
  const num = Number.parseInt(String(value), 10);
  return Number.isInteger(num) && num > 0 ? num : undefined;
}

/**
 * Public category query: optional `type` ("all" or empty = every type), `limit` (max 100), and a
 * page per meal type given as `?breakfast=2&dinner=3`. Invalid page values fall back to page 1.
 */
export function parsePublicMenuCategoryQuery(query: Record<string, unknown>): PublicMenuCategoryQuery {
  const raw = query.type;
  let type: MenuTypeSlug | undefined;
  if (raw !== undefined && raw !== "" && raw !== "all") {
    if (typeof raw !== "string" || !TYPE_SLUGS.includes(raw as MenuTypeSlug)) {
      throw new AppError("Validation failed", 400, [
        { field: "type", message: `type must be one of ${TYPE_SLUGS.join(", ")}` },
      ]);
    }
    type = raw as MenuTypeSlug;
  }

  const limit = Math.min(positiveInt(query.limit) ?? DEFAULT_LIMIT, MAX_LIMIT);
  const pages: PublicMenuCategoryQuery["pages"] = {};
  for (const slug of TYPE_SLUGS) {
    const page = positiveInt(query[slug]);
    if (page) pages[slug] = page;
  }
  return { limit, type, pages };
}
