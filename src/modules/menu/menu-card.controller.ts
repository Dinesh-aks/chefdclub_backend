import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as menuCardService from "./menu-card.service.js";
import {
  parseMenuCardId,
  parseMenuCardListQuery,
  validateCreateMenuCard,
  validateUpdateMenuCard,
} from "./menu-card.validator.js";

export const listMenuCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseMenuCardListQuery(req.query as Record<string, unknown>);
    const result = await menuCardService.listMenuCards(query);
    sendSuccess(res, result, "Menu cards fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getMenuCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseMenuCardId(req.params.id);
    const card = await menuCardService.getMenuCard(id);
    sendSuccess(res, card, "Menu card fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createMenuCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreateMenuCard(req.body, req.file);
    const card = await menuCardService.createMenuCard(input);
    sendSuccess(res, card, "Menu card created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateMenuCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseMenuCardId(req.params.id);
    const input = validateUpdateMenuCard(req.body, req.file);
    const card = await menuCardService.updateMenuCard(id, input);
    sendSuccess(res, card, "Menu card updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteMenuCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseMenuCardId(req.params.id);
    await menuCardService.deleteMenuCard(id);
    sendSuccess(res, { id }, "Menu card deleted successfully.");
  } catch (error) {
    next(error);
  }
};
