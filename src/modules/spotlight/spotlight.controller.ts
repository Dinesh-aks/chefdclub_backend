import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as spotlightService from "./spotlight.service.js";
import {
  parsePublicPlacement,
  parseSpotlightId,
  parseSpotlightListQuery,
  validateCreateSpotlight,
  validateUpdateSpotlight,
} from "./spotlight.validator.js";

export const getPublicSpotlight = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const placement = parsePublicPlacement(req.query.placement);
    sendSuccess(res, await spotlightService.listPublicSpotlight(placement), "Spotlight fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const listSpotlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseSpotlightListQuery(req.query as Record<string, unknown>);
    sendSuccess(res, await spotlightService.listSpotlight(query), "Spotlight cards fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getSpotlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseSpotlightId(req.params.id);
    sendSuccess(res, await spotlightService.getSpotlight(id), "Spotlight card fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createSpotlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreateSpotlight(req.body, req.file);
    sendSuccess(res, await spotlightService.createSpotlight(input), "Spotlight card created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const deleteSpotlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseSpotlightId(req.params.id);
    await spotlightService.deleteSpotlight(id);
    sendSuccess(res, { id }, "Spotlight card deleted successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateSpotlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseSpotlightId(req.params.id);
    const input = validateUpdateSpotlight(req.body, req.file);
    sendSuccess(res, await spotlightService.updateSpotlight(id, input), "Spotlight card updated successfully.");
  } catch (error) {
    next(error);
  }
};
