import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { Highlight as HighlightRow, Prisma } from "../../generated/prisma/index.js";
import type { HighlightListQuery } from "./highlights.validator.js";
import type { HighlightInput, HighlightRecord, HighlightUpdateInput } from "./highlights.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const HIGHLIGHTS_UPLOAD_DIR = path.join(__dirname, "../../../uploads/cms/highlights");

// Maps a DB row to the API shape (status flag as boolean, image as a public URL).
function toRecord(row: HighlightRow): HighlightRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    imageUrl: row.image ? `/uploads/cms/highlights/${row.image}` : null,
    status: row.status === "1",
    sort: row.sort ?? 0, // DB column is nullable
  };
}

// Unpaginated list ordered by sort.
export async function listAll(): Promise<HighlightRecord[]> {
  const rows = await prisma.highlight.findMany({ orderBy: { sort: "asc" } });
  return rows.map(toRecord);
}

// Optional status filter plus search on name or description.
function buildListWhere(query: HighlightListQuery): Prisma.HighlightWhereInput {
  const and: Prisma.HighlightWhereInput[] = [];
  if (query.status !== undefined) and.push({ status: query.status ? "1" : "0" });
  if (query.search) {
    and.push({
      OR: [{ name: { contains: query.search } }, { description: { contains: query.search } }],
    });
  }
  return and.length ? { AND: and } : {};
}

// Paginated + sorted list; rows and total are fetched in parallel.
export async function listPage(
  query: HighlightListQuery,
): Promise<{ items: HighlightRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.HighlightOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.highlight.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.highlight.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<HighlightRecord | null> {
  const row = await prisma.highlight.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: HighlightInput): Promise<HighlightRecord> {
  const row = await prisma.highlight.create({
    data: {
      name: input.name ?? null,
      description: input.description ?? null,
      image: input.imageFilename ?? null,
      status: input.status ? "1" : "0",
      sort: input.sort,
    },
  });
  return toRecord(row);
}

// Partial update: only fields present in the input are written.
export async function update(id: number, input: HighlightUpdateInput): Promise<HighlightRecord> {
  const row = await prisma.highlight.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status ? "1" : "0" } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
      ...(input.imageFilename !== undefined ? { image: input.imageFilename } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<HighlightRecord> {
  const row = await prisma.highlight.delete({ where: { id } });
  return toRecord(row);
}

export async function deleteImageFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(HIGHLIGHTS_UPLOAD_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}
