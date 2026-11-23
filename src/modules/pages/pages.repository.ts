import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma.js";
import type { CmsPage as CmsPageRow } from "../../generated/prisma/index.js";
import type { CmsPageRecord, CmsPageUpdateInput, PageSlug } from "./pages.types.js";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);
const PAGES_UPLOAD_DIR = path.join(__dirname, "../../../uploads/cms/pages");

// Legacy cms_pages rows are fixed; slugs map to their ids.
const SLUG_TO_ID: Record<PageSlug, number> = {
  "about-us": 1,
  "privacy-policy": 2,
  "terms-and-conditions": 3,
};

function toRecord(row: CmsPageRow, slug: PageSlug): CmsPageRecord {
  return {
    id: row.id,
    slug,
    title: row.title,
    short: row.short,
    description: row.description,
    banner: row.banner,
    bannerUrl: row.banner ? `/uploads/cms/pages/${row.banner}` : null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    addDate: row.addDate ?? new Date(0), // DB column is nullable
  };
}

export async function findBySlug(slug: PageSlug): Promise<CmsPageRecord | null> {
  const row = await prisma.cmsPage.findUnique({ where: { id: SLUG_TO_ID[slug] } });
  return row ? toRecord(row, slug) : null;
}

// Partial update: only fields present in the input are written.
export async function update(slug: PageSlug, input: CmsPageUpdateInput): Promise<CmsPageRecord> {
  const row = await prisma.cmsPage.update({
    where: { id: SLUG_TO_ID[slug] },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.short !== undefined ? { short: input.short } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.bannerFilename !== undefined ? { banner: input.bannerFilename } : {}),
    },
  });
  return toRecord(row, slug);
}

export async function deleteBannerFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(PAGES_UPLOAD_DIR, filename));
  } catch {
    // File already missing — nothing to clean up.
  }
}
