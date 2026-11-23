export type SortOrder = "asc" | "desc";

export interface AdminListPagination {
  page: number;
  limit: number;
  offset: number;
}

// Shared query parsing for admin list endpoints; the page size is capped at 100.
export const DEFAULT_ADMIN_LIST_LIMIT = 10;
export const MAX_ADMIN_LIST_LIMIT = 100;

// Accepts page or offset (offset wins); invalid values fall back to defaults.
export function parseAdminListPagination(query: Record<string, unknown>): AdminListPagination {
  const limitRaw = Number.parseInt(String(query.limit ?? DEFAULT_ADMIN_LIST_LIMIT), 10);
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, MAX_ADMIN_LIST_LIMIT)
      : DEFAULT_ADMIN_LIST_LIMIT;

  let page = Number.parseInt(String(query.page ?? "1"), 10);
  if (!Number.isInteger(page) || page <= 0) {
    page = 1;
  }

  const offsetRaw = query.offset;
  if (offsetRaw !== undefined && offsetRaw !== null && offsetRaw !== "") {
    const offset = Number.parseInt(String(offsetRaw), 10);
    if (Number.isInteger(offset) && offset >= 0) {
      page = Math.floor(offset / limit) + 1;
    }
  }

  return { page, limit, offset: (page - 1) * limit };
}

export function parseAdminListSearch(query: Record<string, unknown>): string | undefined {
  return typeof query.search === "string" && query.search.trim() ? query.search.trim() : undefined;
}

// Only whitelisted sort fields reach the database.
export function parseAdminListSort<T extends string>(
  query: Record<string, unknown>,
  allowed: readonly T[],
  defaultSort: T,
  defaultOrder: SortOrder = "asc",
): { sort: T; order: SortOrder } {
  const sortRaw = typeof query.sort === "string" ? query.sort : defaultSort;
  const sort = allowed.includes(sortRaw as T) ? (sortRaw as T) : defaultSort;
  const orderRaw = typeof query.order === "string" ? query.order.toLowerCase() : defaultOrder;
  const order: SortOrder = orderRaw === "asc" ? "asc" : "desc";
  return { sort, order };
}

export interface AdminListQueryBase extends AdminListPagination {
  search?: string;
  sort: string;
  order: SortOrder;
}

export function parseSimpleAdminListQuery<T extends string>(
  query: Record<string, unknown>,
  sortFields: readonly T[],
  defaultSort: T,
  defaultOrder: SortOrder = "asc",
): AdminListQueryBase & { sort: T } {
  const pagination = parseAdminListPagination(query);
  const search = parseAdminListSearch(query);
  const { sort, order } = parseAdminListSort(query, sortFields, defaultSort, defaultOrder);
  return { ...pagination, search, sort, order };
}

// Standard paginated list envelope.
export function buildAdminListResponse<T>(items: T[], total: number, pagination: AdminListPagination) {
  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    offset: pagination.offset,
    total,
    totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
  };
}
