import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { assertContactTurnstile } from "../../utils/turnstile.js";
import {
  parseContactListQuery,
  parseContactMessageId,
  validateCreateContactMessage,
} from "./contact.validator.js";
import * as contactService from "./contact.service.js";

export const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { input, turnstileToken } = validateCreateContactMessage(req.body);
    // Bot check runs after validation and before anything is saved.
    await assertContactTurnstile(turnstileToken, req);
    const result = await contactService.createContactMessage(input);
    sendSuccess(res, result, "Message received. We will get back to you soon.", 201);
  } catch (error) {
    next(error);
  }
};

export const listContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parseContactListQuery(req.query as Record<string, unknown>);
    const result = await contactService.listContactMessages(query);
    sendSuccess(res, result, "Contact messages fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseContactMessageId(req.params.id);
    const message = await contactService.getContactMessage(id);
    sendSuccess(res, message, "Contact message fetched successfully.");
  } catch (error) {
    next(error);
  }
};
