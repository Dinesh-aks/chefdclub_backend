import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as menuCategoryService from "./menu-category.service.js";
import {
  parseMenuCategoryId,
  parseMenuCategoryListQuery,
  validateCreateMenuCategory,
  validateUpdateMenuCategory,
} from "./menu-category.validator.js";

// multer yields an array or a field map depending on config; only the field map is used.
function asFieldsMap(
  files: Request["files"]
): { image?: Express.Multer.File[]; banner?: Express.Multer.File[] } | undefined {
  if (!files || Array.isArray(files)) {
    return undefined;
  }
  return files;
}

export const listMenuCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseMenuCategoryListQuery(req.query as Record<string, unknown>);
    const result = await menuCategoryService.listMenuCategories(query);
    sendSuccess(res, result, "Menu categories fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseMenuCategoryId(req.params.id);
    const category = await menuCategoryService.getMenuCategory(id);
    sendSuccess(res, category, "Menu category fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = validateCreateMenuCategory(req.body, asFieldsMap(req.files));
    const category = await menuCategoryService.createMenuCategory(input);
    sendSuccess(res, category, "Menu category created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseMenuCategoryId(req.params.id);
    const input = validateUpdateMenuCategory(req.body, asFieldsMap(req.files));
    const category = await menuCategoryService.updateMenuCategory(id, input);
    sendSuccess(res, category, "Menu category updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseMenuCategoryId(req.params.id);
    await menuCategoryService.deleteMenuCategory(id);
    sendSuccess(res, { id }, "Menu category deleted successfully.");
  } catch (error) {
    next(error);
  }
};
