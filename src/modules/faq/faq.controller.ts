import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as faqService from "./faq.service.js";
import {
  parseCategoryParam,
  parseFaqId,
  parseFaqListQuery,
  validateCreateFaq,
  validateUpdateFaq,
} from "./faq.validator.js";

export const getHomeFaqs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faqs = await faqService.listHomeFaqs();
    sendSuccess(res, faqs, "Home FAQs fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getFaqsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = parseCategoryParam(req.params.category);
    const faqs = await faqService.listFaqsByCategory(category);
    sendSuccess(res, faqs, "FAQs fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const listFaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseFaqListQuery(req.query as Record<string, unknown>);
    const result = await faqService.listFaqs(query);
    sendSuccess(res, result, "FAQs fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseFaqId(req.params.id);
    const faq = await faqService.getFaq(id);
    sendSuccess(res, faq, "FAQ fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreateFaq(req.body);
    const faq = await faqService.createFaq(input);
    sendSuccess(res, faq, "FAQ created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseFaqId(req.params.id);
    const input = validateUpdateFaq(req.body);
    const faq = await faqService.updateFaq(id, input);
    sendSuccess(res, faq, "FAQ updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseFaqId(req.params.id);
    await faqService.deleteFaq(id);
    sendSuccess(res, { id }, "FAQ deleted successfully.");
  } catch (error) {
    next(error);
  }
};
