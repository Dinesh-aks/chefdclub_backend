import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as galleryPhotoService from "./gallery-photo.service.js";
import {
  parseGalleryPhotoListQuery,
  parsePhotoId,
  parsePublicGalleryPhotoQuery,
  validateCreatePhoto,
  validateUpdatePhoto,
} from "./gallery-photo.validator.js";

export const listPublicPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = parsePublicGalleryPhotoQuery(req.query as Record<string, unknown>);
    const photos = await galleryPhotoService.listPublicPhotos(query);
    sendSuccess(res, photos, "Gallery photos fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const listPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = parseGalleryPhotoListQuery(req.query as Record<string, unknown>);
    const result = await galleryPhotoService.listPhotos(query);
    sendSuccess(res, result, "Gallery photos fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const getPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parsePhotoId(req.params.id);
    const photo = await galleryPhotoService.getPhoto(id);
    sendSuccess(res, photo, "Gallery photo fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const createPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateCreatePhoto(req.body, req.file);
    const photo = await galleryPhotoService.createPhoto(input);
    sendSuccess(res, photo, "Gallery photo created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

export const updatePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parsePhotoId(req.params.id);
    const input = validateUpdatePhoto(req.body, req.file);
    const photo = await galleryPhotoService.updatePhoto(id, input);
    sendSuccess(res, photo, "Gallery photo updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parsePhotoId(req.params.id);
    await galleryPhotoService.deletePhoto(id);
    sendSuccess(res, { id }, "Gallery photo deleted successfully.");
  } catch (error) {
    next(error);
  }
};
