import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { MenuCategory as MenuCategoryRow, Prisma } from "../../generated/prisma/index.js";
import type { MenuCategoryListQuery } from "./menu-category.validator.js";
import type {
  MenuCategoryInput,
  MenuCategoryRecord,
  MenuCategoryUpdateInput,
} from "./menu-category.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/cms/menu-categories");

// Maps a DB row to the API shape (boolean status, image/banner URLs).
function toRecord(row: MenuCategoryRow): MenuCategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    imageUrl: `/uploads/cms/menu-categories/${row.image}`,
    banner: row.banner,
    bannerUrl: row.banner ? `/uploads/cms/menu-categories/${row.banner}` : null,
    status: row.status === "1",
    sort: row.sort,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// Unpaginated list ordered by sort.
export async function listAll(): Promise<MenuCategoryRecord[]> {
  const rows = await prisma.menuCategory.findMany({ orderBy: { sort: "asc" } });
  return rows.map(toRecord);
}

// Optional status filter plus search on name or slug.
function buildListWhere(query: MenuCategoryListQuery): Prisma.MenuCategoryWhereInput {
  const and: Prisma.MenuCategoryWhereInput[] = [];
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
  query: MenuCategoryListQuery,
): Promise<{ items: MenuCategoryRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.MenuCategoryOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.menuCategory.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.menuCategory.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<MenuCategoryRecord | null> {
  const row = await prisma.menuCategory.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: MenuCategoryInput): Promise<MenuCategoryRecord> {
  const now = new Date();
  const row = await prisma.menuCategory.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.imageFilename ?? "",
      banner: input.bannerFilename ?? null,
      status: input.status ? "1" : "0",
      sort: input.sort,
      createdAt: now,
      updatedAt: now,
    },
  });
  return toRecord(row);
}

// Partial update: only fields present in the input are written.
export async function update(
  id: number,
  input: MenuCategoryUpdateInput
): Promise<MenuCategoryRecord> {
  const now = new Date();
  const row = await prisma.menuCategory.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status ? "1" : "0" } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
      ...(input.imageFilename !== undefined ? { image: input.imageFilename } : {}),
      ...(input.bannerFilename !== undefined ? { banner: input.bannerFilename } : {}),
      updatedAt: now,
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<MenuCategoryRecord> {
  const row = await prisma.menuCategory.delete({ where: { id } });
  return toRecord(row);
}

export async function deleteImageFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}
