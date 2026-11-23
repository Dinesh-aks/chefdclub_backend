import { AppError } from "../../utils/AppError.js";
import type { CreateReservationInput, ReservationStatus } from "./reservation.types.js";

const RESERVATION_STATUSES: ReservationStatus[] = [
  "Reviewing",
  "Accept",
  "Declined",
  "Rejection",
  "Completed",
];

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

// Accepts any parseable date that is today or later (time of day is ignored here).
function parsePreferredDate(value: unknown): Date {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("Validation failed", 400, [
      { field: "preferredDate", message: "preferredDate is required" },
    ]);
  }
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Validation failed", 400, [
      { field: "preferredDate", message: "Invalid date" },
    ]);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(parsed);
  day.setHours(0, 0, 0, 0);
  if (day < today) {
    throw new AppError("Validation failed", 400, [
      { field: "preferredDate", message: "Date must be today or in the future" },
    ]);
  }
  return day;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function parsePreferredTime(value: unknown): string {
  const time = requiredString(value, "time", 5);
  if (!TIME_PATTERN.test(time)) {
    throw new AppError("Validation failed", 400, [
      { field: "time", message: "time must be in HH:mm format" },
    ]);
  }
  return time;
}

// Same-day bookings must also have a time later than now.
function assertPreferredDateTimeNotInPast(preferredDate: Date, time: string): void {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  const when = new Date(preferredDate);
  when.setHours(hours, minutes, 0, 0);
  if (when.getTime() < Date.now()) {
    throw new AppError("Validation failed", 400, [
      { field: "time", message: "Preferred date and time must be in the future" },
    ]);
  }
}

function parseGuestCount(value: unknown): number {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isInteger(num) || num < 1 || num > 100) {
    throw new AppError("Validation failed", 400, [
      { field: "guestCount", message: "guestCount must be between 1 and 100" },
    ]);
  }
  return num;
}

// Token is optional here; assertReservationTurnstile enforces it when a secret key is configured.
function parseTurnstileToken(record: Record<string, unknown>): string | undefined {
  const value = record.turnstileToken;
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return requiredString(value, "turnstileToken", 2048);
}

export interface ValidatedCreateReservation {
  input: CreateReservationInput;
  turnstileToken?: string;
}

export function validateCreateReservation(body: unknown): ValidatedCreateReservation {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }

  const record = body as Record<string, unknown>;
  const name = requiredString(record.name, "name", 255);
  const email = requiredString(record.email, "email", 255);
  const phone = requiredString(record.phone, "phone", 50);
  const format = requiredString(record.format, "format", 100);
  const menu = requiredString(record.menu, "menu", 100);
  const winePairing = requiredString(record.winePairing, "winePairing", 100);
  const occasion = optionalString(record.occasion, "occasion", 10000);
  const preferredDate = parsePreferredDate(record.preferredDate);
  const time = parsePreferredTime(record.time);
  assertPreferredDateTimeNotInPast(preferredDate, time);
  const guestCount = parseGuestCount(record.guestCount);

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("Validation failed", 400, [{ field: "email", message: "Invalid email address" }]);
  }

  const turnstileToken = parseTurnstileToken(record);

  return {
    input: {
      name,
      email,
      phone,
      preferredDate: preferredDate.toISOString().slice(0, 10),
      time,
      format,
      guestCount,
      menu,
      winePairing,
      occasion,
    },
    turnstileToken,
  };
}

export function parseReservationId(value: unknown): number {
  const id = Number.parseInt(String(value), 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Validation failed", 400, [{ field: "id", message: "id must be a positive integer" }]);
  }
  return id;
}

// Empty or missing comments clear the note (stored as null).
export function validateAdminComments(body: unknown): string | null {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const value = (body as Record<string, unknown>).adminComments;
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return requiredString(value, "adminComments", 10000);
}

// Whitelist of sortable columns so the `sort` query param cannot target arbitrary fields.
const RESERVATION_SORT_FIELDS = [
  "name",
  "email",
  "mobile",
  "guest",
  "date",
  "status",
  "addDate",
] as const;

export type ReservationSortField = (typeof RESERVATION_SORT_FIELDS)[number];

export interface ReservationListQuery {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  status?: ReservationStatus;
  dateFrom?: string;
  dateTo?: string;
  guest?: number;
  sort: ReservationSortField;
  order: "asc" | "desc";
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseListLimit(value: unknown): number {
  const limit = Number.parseInt(String(value ?? "10"), 10);
  if (!Number.isInteger(limit) || limit <= 0) return 10;
  return Math.min(limit, 100);
}

function parseListPage(value: unknown): number {
  const page = Number.parseInt(String(value ?? "1"), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseListOffset(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const offset = Number.parseInt(String(value), 10);
  return Number.isInteger(offset) && offset >= 0 ? offset : undefined;
}

function parseOptionalIsoDate(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) {
    throw new AppError("Validation failed", 400, [{ field, message: `${field} must be YYYY-MM-DD` }]);
  }
  return value.trim();
}

function parseOptionalGuestCount(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 1) {
    throw new AppError("Validation failed", 400, [
      { field: "guest", message: "guest must be a positive integer" },
    ]);
  }
  return num;
}

// Normalises admin list params; an explicit offset wins over page, and status "all" means no filter.
export function parseReservationListQuery(query: Record<string, unknown>): ReservationListQuery {
  const limit = parseListLimit(query.limit);
  let page = parseListPage(query.page);
  const explicitOffset = parseListOffset(query.offset);
  if (explicitOffset !== undefined) {
    page = Math.floor(explicitOffset / limit) + 1;
  }
  const offset = (page - 1) * limit;

  const search =
    typeof query.search === "string" && query.search.trim() ? query.search.trim() : undefined;

  let status: ReservationStatus | undefined;
  if (typeof query.status === "string" && query.status.trim() && query.status !== "all") {
    if (!RESERVATION_STATUSES.includes(query.status as ReservationStatus)) {
      throw new AppError("Validation failed", 400, [{ field: "status", message: "Invalid status" }]);
    }
    status = query.status as ReservationStatus;
  }

  const sortRaw = typeof query.sort === "string" ? query.sort : "addDate";
  const sort = RESERVATION_SORT_FIELDS.includes(sortRaw as ReservationSortField)
    ? (sortRaw as ReservationSortField)
    : "addDate";

  const orderRaw = typeof query.order === "string" ? query.order.toLowerCase() : "desc";
  const order = orderRaw === "asc" ? "asc" : "desc";

  return {
    page,
    limit,
    offset,
    search,
    status,
    dateFrom: parseOptionalIsoDate(query.dateFrom, "dateFrom"),
    dateTo: parseOptionalIsoDate(query.dateTo, "dateTo"),
    guest: parseOptionalGuestCount(query.guest),
    sort,
    order,
  };
}

export function validateReservationStatus(body: unknown): ReservationStatus {
  if (body === null || typeof body !== "object") {
    throw new AppError("Validation failed", 400, [{ message: "Request body must be a JSON object" }]);
  }
  const status = (body as Record<string, unknown>).status;
  if (typeof status !== "string" || !RESERVATION_STATUSES.includes(status as ReservationStatus)) {
    throw new AppError("Validation failed", 400, [
      { field: "status", message: `status must be one of ${RESERVATION_STATUSES.join(", ")}` },
    ]);
  }
  return status as ReservationStatus;
}
