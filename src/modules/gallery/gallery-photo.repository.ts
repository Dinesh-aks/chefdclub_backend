import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { GalleryPhoto as GalleryPhotoRow, Prisma } from "../../generated/prisma/index.js";
import type { GalleryPhotoListQuery, PublicGalleryPhotoQuery } from "./gallery-photo.validator.js";
import type {
  GalleryPhotoCategory,
  GalleryPhotoInput,
  GalleryPhotoRecord,
  GalleryPhotoUpdateInput,
  PublicGalleryPhoto,
} from "./gallery-photo.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const GALLERY_PHOTOS_DIR = path.join(__dirname, "../../../uploads/gallery/photos");

/** A handful of legacy `clients` rows point at `.mov` files, not images (an admin
 * upload mistake) — exclude them from public listings, but leave them visible in the
 * admin list so they can be cleaned up. */
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// The legacy table stores the category as a numeric "type" id.
const CATEGORY_TO_TYPE: Record<GalleryPhotoCategory, number> = {
  all: 0,
  veg: 1,
  "non-veg": 2,
};

const TYPE_TO_CATEGORY: Record<number, GalleryPhotoCategory> = {
  0: "all",
  1: "veg",
  2: "non-veg",
};

function toRecord(row: GalleryPhotoRow): GalleryPhotoRecord {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    imageUrl: `/uploads/gallery/photos/${row.image}`,
    category: TYPE_TO_CATEGORY[row.type] ?? "all",
  };
}

// Optional category filter plus search on the photo name.
function buildListWhere(query: GalleryPhotoListQuery): Prisma.GalleryPhotoWhereInput {
  const and: Prisma.GalleryPhotoWhereInput[] = [];
  if (query.category) {
    and.push({ type: CATEGORY_TO_TYPE[query.category] });
  }
  if (query.search) {
    and.push({ name: { contains: query.search } });
  }
  return and.length ? { AND: and } : {};
}

export async function listPage(
  query: GalleryPhotoListQuery,
): Promise<{ items: GalleryPhotoRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.GalleryPhotoOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.galleryPhoto.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.galleryPhoto.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

// Public list: one page, filtered in the database. Non-image rows are dropped (see IMAGE_EXTENSIONS).
export async function listPublicPage(
  query: PublicGalleryPhotoQuery,
): Promise<{ items: PublicGalleryPhoto[]; total: number }> {
  const where: Prisma.GalleryPhotoWhereInput = {
    OR: IMAGE_EXTENSIONS.map((extension) => ({ image: { endsWith: extension } })),
    ...(query.category ? { type: CATEGORY_TO_TYPE[query.category] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.galleryPhoto.findMany({
      where,
      orderBy: { id: "desc" },
      skip: query.offset,
      take: query.limit,
      select: { id: true, name: true, image: true },
    }),
    prisma.galleryPhoto.count({ where }),
  ]);
  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    imageUrl: `/uploads/gallery/photos/${row.image}`,
  }));
  return { items, total };
}

export async function findById(id: number): Promise<GalleryPhotoRecord | null> {
  const row = await prisma.galleryPhoto.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: GalleryPhotoInput): Promise<GalleryPhotoRecord> {
  const row = await prisma.galleryPhoto.create({
    data: {
      name: input.name ?? null,
      image: input.imageFilename,
      type: CATEGORY_TO_TYPE[input.category],
    },
  });
  return toRecord(row);
}

export async function update(id: number, input: GalleryPhotoUpdateInput): Promise<GalleryPhotoRecord> {
  const row = await prisma.galleryPhoto.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { type: CATEGORY_TO_TYPE[input.category] } : {}),
      ...(input.imageFilename !== undefined ? { image: input.imageFilename } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<GalleryPhotoRecord> {
  const row = await prisma.galleryPhoto.delete({ where: { id } });
  return toRecord(row);
}

export async function deleteImageFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(GALLERY_PHOTOS_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}
