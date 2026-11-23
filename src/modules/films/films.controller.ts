import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as filmsService from "./films.service.js";
import {
  parseFilmListQuery,
  parsePublicFilmQuery,
  parseVideoId,
  validateCreateVideo,
  validateUpdateVideo,
} from "./films.validator.js";

export const listPublicVideos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = parsePublicFilmQuery(req.query as Record<string, unknown>);
    const videos = await filmsService.listPublicVideos(query);
    sendSuccess(res, videos, "Films fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const listVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseFilmListQuery(req.query as Record<string, unknown>);
    const result = await filmsService.listVideos(query);
    sendSuccess(res, result, "Films fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseVideoId(req.params.id);
    const video = await filmsService.getVideoDetail(id);
    sendSuccess(res, video, "Film fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseVideoId(req.params.id);
    const input = validateUpdateVideo(req.body);
    const video = await filmsService.updateVideo(id, input);
    sendSuccess(res, video, "Film updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const createVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreateVideo(req.body);
    const video = await filmsService.createVideo(input);
    sendSuccess(res, video, "Film created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseVideoId(req.params.id);
    await filmsService.deleteVideo(id);
    sendSuccess(res, { id }, "Film deleted successfully.");
  } catch (error) {
    next(error);
  }
};
