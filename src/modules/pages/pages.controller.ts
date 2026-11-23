import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as pagesService from "./pages.service.js";
import { parsePageSlug, validateUpdatePage } from "./pages.validator.js";
import type { CmsPageAdminView, CmsPageRecord } from "./pages.types.js";

const ADMIN_VIEW_FIELDS: (keyof CmsPageAdminView)[] = ["title", "short", "description", "bannerUrl"];

/** Admin editor fields; `?fields=title,description` trims the response to what a page's form shows. */
function toAdminView(page: CmsPageRecord, requested?: unknown): Partial<CmsPageAdminView> {
  const wanted =
    typeof requested === "string" && requested
      ? ADMIN_VIEW_FIELDS.filter((field) => requested.split(",").includes(field))
      : ADMIN_VIEW_FIELDS;
  return Object.fromEntries(wanted.map((field) => [field, page[field]]));
}

// Admin response: trimmed to the editor fields.
export const getAdminPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = parsePageSlug(req.params.slug);
    const page = await pagesService.getPage(slug);
    sendSuccess(res, toAdminView(page, req.query.fields), "Page fetched successfully.");
  } catch (error) {
    next(error);
  }
};

// Public response: full record including SEO fields.
export const getPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = parsePageSlug(req.params.slug);
    const page = await pagesService.getPage(slug);
    sendSuccess(res, page, "Page fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = parsePageSlug(req.params.slug);
    const input = validateUpdatePage(req.body, req.file);
    const page = await pagesService.updatePage(slug, input);
    sendSuccess(res, toAdminView(page), "Page updated successfully.");
  } catch (error) {
    next(error);
  }
};
