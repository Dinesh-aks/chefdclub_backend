import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as socialLinkService from "./social-link.service.js";
import {
  parseSocialLinkId,
  parseSocialLinkListQuery,
  validateCreateSocialLink,
  validateUpdateSocialLink,
} from "./social-link.validator.js";

export const getPublicSocialLinks = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const links = await socialLinkService.listPublicSocialLinks();
    sendSuccess(res, links, "Social links fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const listSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseSocialLinkListQuery(req.query as Record<string, unknown>);
    const result = await socialLinkService.listSocialLinks(query);
    sendSuccess(res, result, "Social links fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = validateCreateSocialLink(req.body);
    const link = await socialLinkService.createSocialLink(input);
    sendSuccess(res, link, "Social link created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseSocialLinkId(req.params.id);
    const input = validateUpdateSocialLink(req.body);
    const link = await socialLinkService.updateSocialLink(id, input);
    sendSuccess(res, link, "Social link updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseSocialLinkId(req.params.id);
    await socialLinkService.deleteSocialLink(id);
    sendSuccess(res, { id }, "Social link deleted successfully.");
  } catch (error) {
    next(error);
  }
};
