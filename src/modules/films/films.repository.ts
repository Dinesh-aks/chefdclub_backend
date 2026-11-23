import { prisma } from "../../config/prisma.js";
import type { GalleryVideo as FilmRow, Prisma } from "../../generated/prisma/index.js";
import type { FilmListQuery, PublicFilmQuery } from "./films.validator.js";
import type {
  FilmCategory,
  FilmDetail,
  FilmInput,
  FilmPlatform,
  FilmRecord,
  FilmUpdateInput,
  PublicFilm,
} from "./films.types.js";

// The legacy table stores the category as a numeric "type" id.
const CATEGORY_TO_TYPE: Record<FilmCategory, number> = {
  all: 0,
  veg: 1,
  "non-veg": 2,
  "private-dining": 3,
};

const TYPE_TO_CATEGORY: Record<number, FilmCategory> = {
  0: "all",
  1: "veg",
  2: "non-veg",
  3: "private-dining",
};

const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;

interface NormalizedEmbed {
  platform: FilmPlatform;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

/**
 * Legacy `video.youtube_id` holds a mix of plain YouTube embed URLs and, for older rows,
 * full Facebook <iframe> embed HTML — normalize both into a renderable shape.
 */
function normalizeEmbed(raw: string): NormalizedEmbed {
  const youtubeMatch = YOUTUBE_ID_PATTERN.exec(raw);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      platform: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const iframeMatch = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(raw);
  if (iframeMatch) {
    return { platform: "facebook", embedUrl: iframeMatch[1], thumbnailUrl: null };
  }

  return { platform: "unknown", embedUrl: raw || null, thumbnailUrl: null };
}

// Derives platform, embed URL and thumbnail from the stored source string.
function toRecord(row: FilmRow): FilmRecord {
  const { platform, embedUrl, thumbnailUrl } = normalizeEmbed(row.youtubeId);
  return {
    id: row.id,
    category: TYPE_TO_CATEGORY[row.type] ?? "all",
    addDate: row.addDate,
    platform,
    embedUrl,
    thumbnailUrl,
  };
}

// Public list: one page, filtered in the database. Rows with an empty source have nothing to play.
export async function listPublicPage(
  query: PublicFilmQuery,
): Promise<{ items: PublicFilm[]; total: number }> {
  const where: Prisma.GalleryVideoWhereInput = {
    youtubeId: { not: "" },
    ...(query.category ? { type: CATEGORY_TO_TYPE[query.category] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.galleryVideo.findMany({
      where,
      orderBy: { id: "desc" },
      skip: query.offset,
      take: query.limit,
      select: { id: true, type: true, youtubeId: true },
    }),
    prisma.galleryVideo.count({ where }),
  ]);
  const items = rows.map((row) => {
    const { platform, embedUrl, thumbnailUrl } = normalizeEmbed(row.youtubeId);
    return {
      id: row.id,
      category: TYPE_TO_CATEGORY[row.type] ?? "all",
      platform,
      embedUrl,
      thumbnailUrl,
    };
  });
  return { items, total };
}

// Optional category filter plus search on the stored source (URL or embed HTML).
function buildListWhere(query: FilmListQuery): Prisma.GalleryVideoWhereInput {
  const and: Prisma.GalleryVideoWhereInput[] = [];
  if (query.category) {
    and.push({ type: CATEGORY_TO_TYPE[query.category] });
  }
  if (query.search) {
    and.push({ youtubeId: { contains: query.search } });
  }
  return and.length ? { AND: and } : {};
}

export async function listPage(
  query: FilmListQuery,
): Promise<{ items: FilmRecord[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.GalleryVideoOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.galleryVideo.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.galleryVideo.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<FilmRecord | null> {
  const row = await prisma.galleryVideo.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

// Everything the edit form needs, including the stored link or embed code.
export async function findDetailById(id: number): Promise<FilmDetail | null> {
  const row = await prisma.galleryVideo.findUnique({ where: { id } });
  return row ? { ...toRecord(row), source: row.youtubeId } : null;
}

// Partial update: only fields present in the input are written.
export async function update(id: number, input: FilmUpdateInput): Promise<FilmDetail> {
  const row = await prisma.galleryVideo.update({
    where: { id },
    data: {
      ...(input.source !== undefined ? { youtubeId: input.source } : {}),
      ...(input.category !== undefined ? { type: CATEGORY_TO_TYPE[input.category] } : {}),
    },
  });
  return { ...toRecord(row), source: row.youtubeId };
}

export async function create(input: FilmInput): Promise<FilmRecord> {
  const row = await prisma.galleryVideo.create({
    data: {
      youtubeId: input.source,
      type: CATEGORY_TO_TYPE[input.category],
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<void> {
  await prisma.galleryVideo.delete({ where: { id } });
}
