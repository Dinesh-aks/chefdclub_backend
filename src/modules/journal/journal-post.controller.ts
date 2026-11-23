import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as journalPostService from "./journal-post.service.js";
import {
  parseBlogPostId,
  parseBlogPostListQuery,
  validateCreateBlogPost,
  validateUpdateBlogPost,
} from "./journal-post.validator.js";

export const listBlogPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseBlogPostListQuery(req.query as Record<string, unknown>);
    const result = await journalPostService.listBlogPosts(query);
    sendSuccess(res, result, "Journal posts fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseBlogPostId(req.params.id);
    const post = await journalPostService.getBlogPost(id);
    sendSuccess(res, post, "Journal post fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreateBlogPost(req.body, req.file);
    const post = await journalPostService.createBlogPost(input);
    sendSuccess(res, post, "Journal post created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseBlogPostId(req.params.id);
    const input = validateUpdateBlogPost(req.body, req.file);
    const post = await journalPostService.updateBlogPost(id, input);
    sendSuccess(res, post, "Journal post updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseBlogPostId(req.params.id);
    await journalPostService.deleteBlogPost(id);
    sendSuccess(res, { id }, "Journal post deleted successfully.");
  } catch (error) {
    next(error);
  }
};
