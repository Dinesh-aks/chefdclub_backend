import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as highlightsService from "./highlights.service.js";
import {
  parseHighlightId,
  parseHighlightListQuery,
  validateCreateHighlight,
  validateUpdateHighlight,
} from "./highlights.validator.js";

export const listHighlights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseHighlightListQuery(req.query as Record<string, unknown>);
    const result = await highlightsService.listHighlights(query);
    sendSuccess(res, result, "Highlights fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getHighlight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseHighlightId(req.params.id);
    const highlight = await highlightsService.getHighlight(id);
    sendSuccess(res, highlight, "Highlight fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = validateCreateHighlight(req.body, req.file);
    const highlight = await highlightsService.createHighlight(input);
    sendSuccess(res, highlight, "Highlight created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseHighlightId(req.params.id);
    const input = validateUpdateHighlight(req.body, req.file);
    const highlight = await highlightsService.updateHighlight(id, input);
    sendSuccess(res, highlight, "Highlight updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteHighlight = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseHighlightId(req.params.id);
    await highlightsService.deleteHighlight(id);
    sendSuccess(res, { id }, "Highlight deleted successfully.");
  } catch (error) {
    next(error);
  }
};
