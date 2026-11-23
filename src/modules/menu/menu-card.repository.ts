import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { MenuCard as MenuCardRow, Prisma } from "../../generated/prisma/index.js";
import type { MenuCardListQuery } from "./menu-card.validator.js";
import {
  MENU_CARD_TYPE_LABELS,
  type MenuCardInput,
  type MenuCardRecord,
  type MenuCardType,
  type MenuCardUpdateInput,
} from "./menu-card.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/cms/menu-cards");

// Maps a DB row to the API shape (type label, boolean flags, banner URL).
function toRecord(row: MenuCardRow): MenuCardRecord {
  return {
    id: row.id,
    menu: row.menu,
    type: row.type as MenuCardType,
    typeLabel: MENU_CARD_TYPE_LABELS[row.type] ?? "Unknown",
    name: row.name,
    slug: row.slug,
    banner: row.banner,
    bannerUrl: row.banner ? `/uploads/cms/menu-cards/${row.banner}` : null,
    status: row.status === "1",
    sort: row.sort,
    showOnHome: row.showOnHome === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Unpaginated list ordered by sort, optionally limited to one menu.
export async function listAll(menu?: number): Promise<MenuCardRecord[]> {
  const rows = await prisma.menuCard.findMany({
    where: menu !== undefined ? { menu } : undefined,
    orderBy: { sort: "asc" },
  });
  return rows.map(toRecord);
}

// Optional menu filter plus search on name or slug.
function buildListWhere(query: MenuCardListQuery): Prisma.MenuCardWhereInput {
  const and: Prisma.MenuCardWhereInput[] = [];
  if (query.menu !== undefined) {
    and.push({ menu: query.menu });
  }
  if (query.type !== undefined) {
    and.push({ type: query.type });
  }
  if (query.status !== undefined) {
    and.push({ status: query.status ? "1" : "0" });
  }
  if (query.search) {
    and.push({
      OR: [{ name: { contains: query.search } }, { slug: { contains: query.search } }],
    });
  }
  return and.length ? { AND: and } : {};
}

// Paginated + sorted list; rows and total are fetched in parallel.
export async function listPage(
  query: MenuCardListQuery,
): Promise<{ items: MenuCardRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.MenuCardOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.menuCard.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.menuCard.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<MenuCardRecord | null> {
  const row = await prisma.menuCard.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: MenuCardInput): Promise<MenuCardRecord> {
  const now = new Date();
  const row = await prisma.menuCard.create({
    data: {
      menu: input.menu,
      type: input.type,
      name: input.name,
      slug: input.slug,
      banner: input.bannerFilename ?? null,
      status: input.status ? "1" : "0",
      sort: input.sort,
      showOnHome: input.showOnHome ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    },
  });
  return toRecord(row);
}

// Partial update: only fields present in the input are written.
export async function update(id: number, input: MenuCardUpdateInput): Promise<MenuCardRecord> {
  const now = new Date();
  const row = await prisma.menuCard.update({
    where: { id },
    data: {
      ...(input.menu !== undefined ? { menu: input.menu } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.status !== undefined ? { status: input.status ? "1" : "0" } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
      ...(input.showOnHome !== undefined ? { showOnHome: input.showOnHome ? 1 : 0 } : {}),
      ...(input.bannerFilename !== undefined ? { banner: input.bannerFilename } : {}),
      updatedAt: now,
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<MenuCardRecord> {
  const row = await prisma.menuCard.delete({ where: { id } });
  return toRecord(row);
}

export async function deleteBannerFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}
