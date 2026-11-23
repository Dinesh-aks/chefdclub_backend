import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as menuPublicService from "./menu-public.service.js";
import { parsePublicMenuCategoryQuery } from "./menu-public.validator.js";

// Public tab list: active menu categories in display order.
export const listPublicTabs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tabs = await menuPublicService.listTabs();
    sendSuccess(res, tabs, "Menus fetched successfully.");
  } catch (error) {
    next(error);
  }
};

// One active menu category with its cards.
export const getPublicCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : "";
    const query = parsePublicMenuCategoryQuery(req.query as Record<string, unknown>);
    const category = await menuPublicService.getCategory(slug, query);
    sendSuccess(res, category, "Menu fetched successfully.");
  } catch (error) {
    next(error);
  }
};
