import { AppError } from "../../utils/AppError.js";
import * as pagesRepository from "./pages.repository.js";
import type { CmsPageRecord, CmsPageUpdateInput, PageSlug } from "./pages.types.js";

export async function getPage(slug: PageSlug): Promise<CmsPageRecord> {
  const page = await pagesRepository.findBySlug(slug);
  if (!page) {
    throw new AppError("Page not found", 404);
  }
  return page;
}

export async function updatePage(slug: PageSlug, input: CmsPageUpdateInput): Promise<CmsPageRecord> {
  const existing = await getPage(slug);
  const updated = await pagesRepository.update(slug, input);

  // Remove the replaced banner from disk once the DB update succeeded.
  if (
    input.bannerFilename !== undefined &&
    existing.banner &&
    input.bannerFilename !== existing.banner
  ) {
    await pagesRepository.deleteBannerFile(existing.banner);
  }

  return updated;
}
