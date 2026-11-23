import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { BlogPost as BlogPostRow, Prisma } from "../../generated/prisma/index.js";
import type { BlogPostListQuery } from "./journal-post.validator.js";
import type {
  BlogPostInput,
  BlogPostListItem,
  BlogPostRecord,
  BlogPostUpdateInput,
} from "./journal-post.types.js";
import {
  journalHeroDir,
  journalHeroStagingDir,
  resolveHeroImageUrl,
} from "./journal-image-paths.js";

// Maps a DB row to the full API record, adding view/like totals from their own tables.
async function toRecord(row: BlogPostRow): Promise<BlogPostRecord> {
  const [viewAgg, likeCount] = await Promise.all([
    prisma.blogView.aggregate({ where: { blogId: row.id }, _sum: { noOfView: true } }),
    prisma.blogLike.count({ where: { blogId: row.id, like: 1 } }),
  ]);

  return {
    id: row.id,
    catId: row.catId,
    author: row.author,
    title: row.title,
    slug: row.slug,
    description: row.description,
    image: row.image,
    imageUrl: resolveHeroImageUrl(row.id, row.image),
    video: row.video,
    publishDate: row.publishDate,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    status: row.status === 1,
    updatedAt: row.updatedAt,
    viewCount: viewAgg._sum.noOfView ?? 0,
    likeCount,
  };
}

export async function listAll(): Promise<BlogPostRecord[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return Promise.all(rows.map(toRecord));
}

// Search matches title, author or slug.
function buildListWhere(query: BlogPostListQuery): Prisma.BlogPostWhereInput {
  const and: Prisma.BlogPostWhereInput[] = [];
  if (query.catId !== undefined) and.push({ catId: query.catId });
  if (query.status !== undefined) and.push({ status: query.status ? 1 : 0 });
  if (query.search) {
    and.push({
      OR: [
        { title: { contains: query.search } },
        { author: { contains: query.search } },
        { slug: { contains: query.search } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

export async function listPage(
  query: BlogPostListQuery,
): Promise<{ items: BlogPostListItem[]; total: number }> {
  const where = buildListWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.BlogPostOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy,
      skip: query.offset,
      take: query.limit,
      // Only the columns the admin table shows; the heavy description/SEO fields stay on the by-id endpoint.
      select: {
        id: true,
        catId: true,
        author: true,
        title: true,
        slug: true,
        image: true,
        publishDate: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);
  // One small query for just this page's category names (no relation is modelled between the tables).
  const categories = await prisma.blogCategory.findMany({
    where: { id: { in: [...new Set(rows.map((row) => row.catId))] } },
    select: { id: true, category: true },
  });
  const categoryNames = new Map(categories.map((category) => [category.id, category.category]));
  const items = await Promise.all(
    rows.map(async (row): Promise<BlogPostListItem> => {
      const [viewAgg, likeCount] = await Promise.all([
        prisma.blogView.aggregate({ where: { blogId: row.id }, _sum: { noOfView: true } }),
        prisma.blogLike.count({ where: { blogId: row.id, like: 1 } }),
      ]);
      return {
        id: row.id,
        catId: row.catId,
        categoryName: categoryNames.get(row.catId) ?? null,
        author: row.author,
        title: row.title,
        slug: row.slug,
        image: row.image,
        imageUrl: resolveHeroImageUrl(row.id, row.image),
        publishDate: row.publishDate,
        status: row.status === 1,
        updatedAt: row.updatedAt,
        viewCount: viewAgg._sum.noOfView ?? 0,
        likeCount,
      };
    }),
  );
  return { items, total };
}

export async function findById(id: number): Promise<BlogPostRecord | null> {
  const row = await prisma.blogPost.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: BlogPostInput): Promise<BlogPostRecord> {
  const row = await prisma.blogPost.create({
    data: {
      catId: input.catId,
      author: input.author,
      title: input.title,
      slug: input.slug,
      description: input.description,
      image: input.imageFilename ?? null,
      video: input.video ?? null,
      publishDate: input.publishDate,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      status: input.status ? 1 : 0,
    },
  });
  return toRecord(row);
}

export async function update(id: number, input: BlogPostUpdateInput): Promise<BlogPostRecord> {
  const row = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(input.catId !== undefined ? { catId: input.catId } : {}),
      ...(input.author !== undefined ? { author: input.author } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.video !== undefined ? { video: input.video } : {}),
      ...(input.publishDate !== undefined ? { publishDate: input.publishDate } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.status !== undefined ? { status: input.status ? 1 : 0 } : {}),
      ...(input.imageFilename !== undefined ? { image: input.imageFilename } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<BlogPostRecord> {
  const row = await prisma.blogPost.delete({ where: { id } });
  return toRecord(row);
}

/** Moves a cover image uploaded on create from staging into `posts/<id>/hero/`. */
export async function finalizeHeroUpload(postId: number, filename: string): Promise<void> {
  const staged = path.join(journalHeroStagingDir(), filename);
  const destDir = journalHeroDir(postId);
  await fs.mkdir(destDir, { recursive: true });
  await fs.rename(staged, path.join(destDir, filename));
}

export async function deleteImageFile(postId: number, filename: string): Promise<void> {
  const candidates = [
    path.join(journalHeroDir(postId), filename),
    path.join(journalHeroStagingDir(), filename),
  ];
  for (const filePath of candidates) {
    try {
      await fs.unlink(filePath);
    } catch {
      // Try other locations.
    }
  }
}
