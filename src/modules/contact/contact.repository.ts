import { prisma } from "../../config/prisma.js";
import type { ContactUs as ContactUsRow, Prisma } from "../../generated/prisma/index.js";
import type { ContactListQuery } from "./contact.validator.js";
import type {
  ContactMessageListItem,
  ContactMessageRecord,
  CreateContactMessageInput,
} from "./contact.types.js";

export async function insertContactMessage(input: CreateContactMessageInput): Promise<{ id: number }> {
  const row = await prisma.contactUs.create({
    data: {
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      subject: input.subject,
      message: input.message,
    },
    select: { id: true },
  });
  return row;
}

// Full record, used by the by-id endpoint and the recent-messages list.
function toRecord(row: ContactUsRow): ContactMessageRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    subject: row.subject,
    message: row.message,
    addDate: row.addDate,
  };
}

export interface ContactMessagePage {
  items: ContactMessageListItem[];
  total: number;
}

// Search matches name, email, subject or message, even though the list does not return the last two.
function buildListWhere(query: ContactListQuery): Prisma.ContactUsWhereInput | undefined {
  if (!query.search) return undefined;
  return {
    OR: [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { subject: { contains: query.search } },
      { message: { contains: query.search } },
    ],
  };
}

/** The live table has ~3,800 rows — always paginate + filter server-side,
 * never fetch the full list into memory. */
export async function listPage(query: ContactListQuery): Promise<ContactMessagePage> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.ContactUsOrderByWithRelationInput;

  const [rows, total] = await Promise.all([
    prisma.contactUs.findMany({
      where,
      orderBy,
      skip: query.offset,
      take: query.limit,
      select: { id: true, name: true, email: true, mobile: true },
    }),
    prisma.contactUs.count({ where }),
  ]);

  return { items: rows, total };
}

export async function findById(id: number): Promise<ContactMessageRecord | null> {
  const row = await prisma.contactUs.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

// First moment of the current month in UTC, for the dashboard's monthly count.
function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function countThisMonth(): Promise<number> {
  return prisma.contactUs.count({ where: { addDate: { gte: startOfCurrentMonth() } } });
}

export async function listRecent(limit: number): Promise<ContactMessageRecord[]> {
  const rows = await prisma.contactUs.findMany({
    orderBy: { addDate: "desc" },
    take: limit,
  });
  return rows.map(toRecord);
}
