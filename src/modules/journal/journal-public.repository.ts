import { prisma } from "../../config/prisma.js";
import { countLikes } from "./journal-engagement.repository.js";
import type { AdminListPagination } from "../../utils/adminListQuery.js";
import { resolveHeroImageUrl } from "./journal-image-paths.js";
import {
  PUBLIC_SUMMARY_FIELDS,
  type PublicBlogPost,
  type PublicBlogPostSummary,
  type PublicBlogPostSummaryField,
} from "./journal-public.types.js";

const EXCERPT_LENGTH = 180;

// Only active posts are public.
const ACTIVE = 1;

// The entities the rich text editor and legacy posts actually produce.
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  bull: "•",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

// "<p>Hello &amp; welcome</p>" -> "Hello & welcome", cut to a short plain-text teaser.
function toExcerpt(html: string): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
}

function imageUrlFor(postId: number, image: string | null): string | null {
  return resolveHeroImageUrl(postId, image);
}

async function categoryNames(catIds: number[]): Promise<Map<number, string>> {
  const rows = await prisma.blogCategory.findMany({
    where: { id: { in: [...new Set(catIds)] } },
    select: { id: true, category: true },
  });
  return new Map(rows.map((row) => [row.id, row.category]));
}

// Newest first. publish_date is `yyyy-mm-dd` text, so a text sort is a date sort.
export async function listPublic(
  pagination: AdminListPagination,
  excludeSlug?: string,
  fields: readonly PublicBlogPostSummaryField[] = PUBLIC_SUMMARY_FIELDS,
): Promise<{ items: Partial<PublicBlogPostSummary>[]; total: number }> {
  const wanted = new Set(fields);
  // excludeSlug lets an article page ask for "other posts" without fetching itself.
  const where = { status: ACTIVE, ...(excludeSlug ? { slug: { not: excludeSlug } } : {}) };
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishDate: "desc" }, { id: "desc" }],
      skip: pagination.offset,
      take: pagination.limit,
      select: {
        id: true,
        slug: true,
        title: true,
        publishDate: true,
        image: true,
        catId: true,
        // The (large) description is only read to build the excerpt, and never returned.
        ...(wanted.has("excerpt") ? { description: true } : {}),
      },
    }),
    prisma.blogPost.count({ where }),
  ]);
  // Skip the category lookup when the caller does not need category names.
  const names = wanted.has("categoryName")
    ? await categoryNames(rows.map((row) => row.catId))
    : new Map<number, string>();
  const items = rows.map((row) => {
    const full: PublicBlogPostSummary = {
      slug: row.slug,
      title: row.title,
      publishDate: row.publishDate,
      excerpt: "description" in row ? toExcerpt(row.description) : "",
      imageUrl: imageUrlFor(row.id, row.image),
      categoryName: names.get(row.catId) ?? null,
    };
    // Return only the requested fields.
    return Object.fromEntries(fields.map((field) => [field, full[field]])) as Partial<PublicBlogPostSummary>;
  });
  return { items, total };
}

export async function findPublicBySlug(slug: string): Promise<PublicBlogPost | null> {
  const row = await prisma.blogPost.findFirst({
    where: { slug, status: ACTIVE },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      publishDate: true,
      description: true,
      image: true,
      video: true,
      seoTitle: true,
      seoDescription: true,
      catId: true,
    },
  });
  if (!row) return null;
  const [names, likeCount] = await Promise.all([categoryNames([row.catId]), countLikes(row.id)]);
  return {
    slug: row.slug,
    title: row.title,
    author: row.author,
    publishDate: row.publishDate,
    excerpt: toExcerpt(row.description),
    description: row.description,
    imageUrl: imageUrlFor(row.id, row.image),
    video: row.video,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categoryName: names.get(row.catId) ?? null,
    likeCount,
  };
}
