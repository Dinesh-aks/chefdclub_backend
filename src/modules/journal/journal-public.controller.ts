import { NextFunction, Request, Response } from "express";
import { parseAdminListPagination } from "../../utils/adminListQuery.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as journalPublicService from "./journal-public.service.js";
import { PUBLIC_SUMMARY_FIELDS, type PublicBlogPostSummaryField } from "./journal-public.types.js";

// `?fields=slug,title` keeps only the known fields; unknown names are ignored, empty means all.
function parseFields(value: unknown): PublicBlogPostSummaryField[] | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const requested = value.split(",").map((field) => field.trim());
  const fields = PUBLIC_SUMMARY_FIELDS.filter((field) => requested.includes(field));
  return fields.length ? fields : undefined;
}

// Public Journal list: active posts, newest first, paginated (?page=&limit=), optional
// ?exclude=<slug> and ?fields= (only the fields the screen shows).
export const listPublicPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagination = parseAdminListPagination(req.query as Record<string, unknown>);
    const exclude = typeof req.query.exclude === "string" ? req.query.exclude.trim().slice(0, 255) : "";
    const fields = parseFields(req.query.fields);
    const result = await journalPublicService.listPublicPosts(pagination, exclude || undefined, fields);
    sendSuccess(res, result, "Posts fetched successfully.");
  } catch (error) {
    next(error);
  }
};

// One active post by slug.
export const getPublicPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : "";
    const post = await journalPublicService.getPublicPost(slug);
    sendSuccess(res, post, "Post fetched successfully.");
  } catch (error) {
    next(error);
  }
};
