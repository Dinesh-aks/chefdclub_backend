import { prisma } from "../../config/prisma.js";
import type { Prisma, Faq as FaqRow } from "../../generated/prisma/index.js";
import type { FaqListQuery } from "./faq.validator.js";
import type { FaqCategory, FaqInput, FaqListItem, FaqRecord, FaqUpdateInput } from "./faq.types.js";

// The legacy table stores the category as a numeric "menu" id.
const CATEGORY_TO_MENU: Record<FaqCategory, number> = {
  veg: 1,
  "non-veg": 2,
  "wine-pairing": 3,
};

const MENU_TO_CATEGORY: Record<number, FaqCategory> = {
  1: "veg",
  2: "non-veg",
  3: "wine-pairing",
};

function toRecord(row: FaqRow): FaqRecord {
  return {
    id: row.id,
    question: row.question ?? "",
    answer: row.answer ?? "",
    sort: row.sort,
    status: row.status === 1,
    category: MENU_TO_CATEGORY[row.menu] ?? "veg",
  };
}

/** All FAQs, for the admin list — every category and status. */
export async function listAll(): Promise<FaqRecord[]> {
  const rows = await prisma.faq.findMany({ orderBy: { sort: "asc" } });
  return rows.map(toRecord);
}

// Optional category/status filters plus search on question or answer (answer is not returned in the list).
function buildListWhere(query: FaqListQuery): Prisma.FaqWhereInput {
  const and: Prisma.FaqWhereInput[] = [];
  if (query.category) and.push({ menu: CATEGORY_TO_MENU[query.category] });
  if (query.status !== undefined) and.push({ status: query.status ? 1 : 0 });
  if (query.search) {
    and.push({
      OR: [{ question: { contains: query.search } }, { answer: { contains: query.search } }],
    });
  }
  return and.length ? { AND: and } : {};
}

export async function listPage(query: FaqListQuery): Promise<{ items: FaqListItem[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.FaqOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy,
      skip: query.offset,
      take: query.limit,
      // No answer here: it can be long and is only needed on the by-id endpoint.
      select: { id: true, question: true, sort: true, status: true, menu: true },
    }),
    prisma.faq.count({ where }),
  ]);
  return {
    items: rows.map((row) => ({
      id: row.id,
      question: row.question ?? "",
      sort: row.sort,
      status: row.status === 1,
      category: MENU_TO_CATEGORY[row.menu] ?? "veg",
    })),
    total,
  };
}

export async function countPublished(): Promise<number> {
  return prisma.faq.count({ where: { status: 1 } });
}

/** Published FAQs for a single category, for a menu page. */
export async function listPublishedByCategory(category: FaqCategory): Promise<FaqRecord[]> {
  const rows = await prisma.faq.findMany({
    where: { menu: CATEGORY_TO_MENU[category], status: 1 },
    orderBy: { sort: "asc" },
  });
  return rows.map(toRecord);
}

/**
 * Homepage FAQ set: the first 2 published Non-Veg entries followed by the
 * first 2 published Veg entries, mirroring the legacy Laravel homepage query.
 */
export async function listPublishedHome(): Promise<FaqRecord[]> {
  const [nonVeg, veg] = await Promise.all([
    prisma.faq.findMany({
      where: { menu: CATEGORY_TO_MENU["non-veg"], status: 1 },
      orderBy: { sort: "asc" },
      take: 2,
    }),
    prisma.faq.findMany({
      where: { menu: CATEGORY_TO_MENU["veg"], status: 1 },
      orderBy: { sort: "asc" },
      take: 2,
    }),
  ]);
  return [...nonVeg, ...veg].map(toRecord);
}

export async function findById(id: number): Promise<FaqRecord | null> {
  const row = await prisma.faq.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: FaqInput): Promise<FaqRecord> {
  const row = await prisma.faq.create({
    data: {
      question: input.question,
      answer: input.answer,
      sort: input.sort,
      status: input.status ? 1 : 0,
      menu: CATEGORY_TO_MENU[input.category],
    },
  });
  return toRecord(row);
}

export async function update(id: number, input: FaqUpdateInput): Promise<FaqRecord> {
  const row = await prisma.faq.update({
    where: { id },
    data: {
      ...(input.question !== undefined ? { question: input.question } : {}),
      ...(input.answer !== undefined ? { answer: input.answer } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
      ...(input.status !== undefined ? { status: input.status ? 1 : 0 } : {}),
      ...(input.category !== undefined ? { menu: CATEGORY_TO_MENU[input.category] } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<void> {
  await prisma.faq.delete({ where: { id } });
}
