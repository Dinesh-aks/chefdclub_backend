import { prisma } from "../../config/prisma.js";
import type { BlogCategory as BlogCategoryRow, Prisma } from "../../generated/prisma/index.js";
import type { AdminListQueryBase } from "../../utils/adminListQuery.js";
import type {
  BlogCategoryInput,
  BlogCategoryRecord,
  BlogCategoryUpdateInput,
} from "./journal-category.types.js";

// The DB stores status as 0/1; the API exposes a boolean.
function toRecord(row: BlogCategoryRow): BlogCategoryRecord {
  return {
    id: row.id,
    category: row.category,
    slug: row.slug,
    status: row.status === 1,
    sort: row.sort,
  };
}

// Unpaginated list (e.g. for category dropdowns).
export async function listAll(): Promise<BlogCategoryRecord[]> {
  const rows = await prisma.blogCategory.findMany({ orderBy: { sort: "asc" } });
  return rows.map(toRecord);
}

// Search matches the category name or slug.
function buildListWhere(query: AdminListQueryBase): Prisma.BlogCategoryWhereInput {
  if (!query.search) return {};
  return {
    OR: [{ category: { contains: query.search } }, { slug: { contains: query.search } }],
  };
}

export async function listPage(
  query: AdminListQueryBase,
): Promise<{ items: BlogCategoryRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.BlogCategoryOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.blogCategory.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.blogCategory.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<BlogCategoryRecord | null> {
  const row = await prisma.blogCategory.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: BlogCategoryInput): Promise<BlogCategoryRecord> {
  const row = await prisma.blogCategory.create({
    data: {
      category: input.category,
      slug: input.slug,
      status: input.status ? 1 : 0,
      sort: input.sort,
    },
  });
  return toRecord(row);
}

export async function update(
  id: number,
  input: BlogCategoryUpdateInput
): Promise<BlogCategoryRecord> {
  // Only fields that were sent are updated (partial update).
  const row = await prisma.blogCategory.update({
    where: { id },
    data: {
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.status !== undefined ? { status: input.status ? 1 : 0 } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<void> {
  await prisma.blogCategory.delete({ where: { id } });
}
