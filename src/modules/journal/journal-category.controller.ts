import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as journalCategoryService from "./journal-category.service.js";
import {
  parseBlogCategoryId,
  parseBlogCategoryListQuery,
  validateCreateBlogCategory,
  validateUpdateBlogCategory,
} from "./journal-category.validator.js";

export const listBlogCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseBlogCategoryListQuery(req.query as Record<string, unknown>);
    const result = await journalCategoryService.listBlogCategories(query);
    sendSuccess(res, result, "Journal categories fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = validateCreateBlogCategory(req.body);
    const category = await journalCategoryService.createBlogCategory(input);
    sendSuccess(res, category, "Journal category created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseBlogCategoryId(req.params.id);
    const input = validateUpdateBlogCategory(req.body);
    const category = await journalCategoryService.updateBlogCategory(id, input);
    sendSuccess(res, category, "Journal category updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseBlogCategoryId(req.params.id);
    await journalCategoryService.deleteBlogCategory(id);
    sendSuccess(res, { id }, "Journal category deleted successfully.");
  } catch (error) {
    next(error);
  }
};
