import { prisma } from "../../config/prisma.js";
import type { Prisma, Reservation as ReservationRow } from "../../generated/prisma/index.js";
import type { ReservationListQuery } from "./reservation.validator.js";
import type {
  CreateReservationInput,
  ReservationRecord,
  ReservationStatus,
} from "./reservation.types.js";

/** Default dinner time when the new UI does not collect a separate time field (Laravel used Date + Time). */
function defaultReservationTime(): Date {
  return new Date(Date.UTC(1970, 0, 1, 11, 0, 0));
}

// The legacy table has a single free-text `request` column, so the form choices are folded into it.
function buildRequestText(input: CreateReservationInput): string {
  const lines = [
    `Format: ${input.format}`,
    `Menu: ${input.menu}`,
    `Wine pairing: ${input.winePairing}`,
  ];
  if (input.time) {
    lines.push(`Preferred time: ${input.time}`);
  }
  return lines.join("\n");
}

export async function insertReservation(input: CreateReservationInput): Promise<{ id: number }> {
  const row = await prisma.reservation.create({
    data: {
      userId: null,
      name: input.name,
      email: input.email,
      mobile: input.phone,
      guest: input.guestCount,
      date: new Date(input.preferredDate),
      time: input.time ? parseTimeString(input.time) : defaultReservationTime(),
      request: buildRequestText(input),
      restrictions: input.occasion,
      status: "Reviewing",
    },
    select: { id: true },
  });
  return row;
}

// Stores "HH:mm[:ss]" as a UTC time-of-day on 1970-01-01 (the column is a time type); falls back to the default.
function parseTimeString(time: string): Date {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim());
  if (!match) {
    return defaultReservationTime();
  }
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
}

// Maps a DB row to the API shape.
function toRecord(row: ReservationRow): ReservationRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    guest: row.guest,
    request: row.request,
    restrictions: row.restrictions,
    adminComments: row.adminComments,
    date: row.date,
    time: row.time,
    status: row.status,
    addDate: row.addDate,
  };
}

export async function listAll(): Promise<ReservationRecord[]> {
  const rows = await prisma.reservation.findMany({ orderBy: { addDate: "desc" } });
  return rows.map(toRecord);
}

export interface ReservationListPage {
  items: ReservationRecord[];
  total: number;
}

// Combines the optional admin filters (search, status, date range, guests) with AND.
function buildListWhere(query: ReservationListQuery): Prisma.ReservationWhereInput {
  const and: Prisma.ReservationWhereInput[] = [];

  if (query.search) {
    and.push({
      OR: [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { mobile: { contains: query.search } },
      ],
    });
  }
  if (query.status) {
    and.push({ status: query.status });
  }
  if (query.dateFrom) {
    and.push({ date: { gte: new Date(`${query.dateFrom}T00:00:00.000Z`) } });
  }
  if (query.dateTo) {
    and.push({ date: { lte: new Date(`${query.dateTo}T00:00:00.000Z`) } });
  }
  if (query.guest) {
    and.push({ guest: query.guest });
  }

  return and.length ? { AND: and } : {};
}

function buildListOrderBy(
  query: ReservationListQuery,
): Prisma.ReservationOrderByWithRelationInput {
  return { [query.sort]: query.order };
}

export async function listPage(query: ReservationListQuery): Promise<ReservationListPage> {
  const where = buildListWhere(query);
  const orderBy = buildListOrderBy(query);

  // Page rows and the total count share the same filter.
  const [rows, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy,
      skip: query.offset,
      take: query.limit,
    }),
    prisma.reservation.count({ where }),
  ]);

  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<ReservationRecord | null> {
  const row = await prisma.reservation.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function updateStatus(
  id: number,
  status: ReservationStatus
): Promise<ReservationRecord> {
  const row = await prisma.reservation.update({ where: { id }, data: { status } });
  return toRecord(row);
}

export async function updateAdminComments(
  id: number,
  adminComments: string | null,
): Promise<ReservationRecord> {
  const row = await prisma.reservation.update({ where: { id }, data: { adminComments } });
  return toRecord(row);
}

// Used by the dashboard stats.
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function countThisMonth(): Promise<number> {
  return prisma.reservation.count({ where: { addDate: { gte: startOfCurrentMonth() } } });
}

export async function listRecent(limit: number): Promise<ReservationRecord[]> {
  const rows = await prisma.reservation.findMany({
    orderBy: { addDate: "desc" },
    take: limit,
  });
  return rows.map(toRecord);
}
