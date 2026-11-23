import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as siteSettingsService from "./site-settings.service.js";
import { validateUpdateSiteSettings } from "./site-settings.validator.js";

export const getSiteSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await siteSettingsService.getSiteSettings();
    sendSuccess(res, settings, "Site settings fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = validateUpdateSiteSettings(req.body);
    const settings = await siteSettingsService.updateSiteSettings(input);
    sendSuccess(res, settings, "Site settings updated successfully.");
  } catch (error) {
    next(error);
  }
};
