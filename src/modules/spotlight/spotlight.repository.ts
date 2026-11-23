import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { HomeSpotlight as SpotlightRow, Prisma } from "../../generated/prisma/index.js";
import type { SpotlightListQuery } from "./spotlight.validator.js";
import type {
  PublicSpotlight,
  SpotlightInput,
  SpotlightPlacement,
  SpotlightRecord,
  SpotlightUpdateInput,
} from "./spotlight.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const SPOTLIGHT_UPLOAD_DIR = path.join(__dirname, "../../../uploads/cms/spotlight");

function imageUrlOf(image: string | null): string | null {
  return image ? `/uploads/cms/spotlight/${image}` : null;
}

function toRecord(row: SpotlightRow): SpotlightRecord {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag,
    badge: row.badge,
    placement: row.placement as SpotlightPlacement,
    image: row.image,
    imageUrl: imageUrlOf(row.image),
    alt: row.alt,
    status: row.status,
    sort: row.sort,
  };
}

// Active cards for one homepage placement in display order, with only the fields the homepage needs.
export async function listActive(placement: SpotlightPlacement): Promise<PublicSpotlight[]> {
  const rows = await prisma.homeSpotlight.findMany({
    where: { status: true, placement },
    orderBy: [{ sort: "asc" }, { id: "asc" }],
    select: { id: true, title: true, tag: true, badge: true, image: true, alt: true },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    tag: row.tag,
    badge: row.badge,
    imageUrl: imageUrlOf(row.image),
    alt: row.alt,
  }));
}

function buildListWhere(query: SpotlightListQuery): Prisma.HomeSpotlightWhereInput {
  const and: Prisma.HomeSpotlightWhereInput[] = [];
  if (query.status !== undefined) and.push({ status: query.status });
  if (query.placement !== undefined) and.push({ placement: query.placement });
  if (query.search) {
    and.push({ OR: [{ title: { contains: query.search } }, { tag: { contains: query.search } }] });
  }
  return and.length ? { AND: and } : {};
}

export async function listPage(
  query: SpotlightListQuery,
): Promise<{ items: SpotlightRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.HomeSpotlightOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.homeSpotlight.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.homeSpotlight.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<SpotlightRecord | null> {
  const row = await prisma.homeSpotlight.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: SpotlightInput): Promise<SpotlightRecord> {
  const row = await prisma.homeSpotlight.create({
    data: {
      title: input.title,
      tag: input.tag,
      badge: input.badge,
      placement: input.placement,
      alt: input.alt,
      image: input.imageFilename ?? null,
      status: input.status,
      sort: input.sort,
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<void> {
  await prisma.homeSpotlight.delete({ where: { id } });
}

export async function deleteImageFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(SPOTLIGHT_UPLOAD_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}

// Partial update: only fields present in the input are written.
export async function update(id: number, input: SpotlightUpdateInput): Promise<SpotlightRecord> {
  const row = await prisma.homeSpotlight.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
      ...(input.badge !== undefined ? { badge: input.badge } : {}),
      ...(input.placement !== undefined ? { placement: input.placement } : {}),
      ...(input.alt !== undefined ? { alt: input.alt } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.sort !== undefined ? { sort: input.sort } : {}),
      ...(input.imageFilename !== undefined ? { image: input.imageFilename } : {}),
    },
  });
  return toRecord(row);
}
