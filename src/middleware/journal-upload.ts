import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  journalHeroDir,
  journalHeroStagingDir,
  journalInlineDir,
  journalInlinePublicUrl,
} from "../modules/journal/journal-image-paths.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function uniqueImageFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  return `${Date.now()}-${uniqueSuffix}${ext}`;
}

function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    callback(new AppError("Image must be JPEG, PNG, or WEBP", 400));
    return;
  }
  callback(null, true);
}

function createDynamicImageStorage(resolveDir: (req: Request) => string) {
  return multer.diskStorage({
    destination: (req, _file, callback) => {
      const dir = resolveDir(req);
      fs.mkdirSync(dir, { recursive: true });
      callback(null, dir);
    },
    filename: (_req, file, callback) => {
      callback(null, uniqueImageFilename(file.originalname));
    },
  });
}

function parsePostIdFromParams(req: Request): number | null {
  const raw = req.params.id;
  if (raw === undefined) return null;
  const id = Number.parseInt(String(raw), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const journalHeroStorage = createDynamicImageStorage((req) => {
  const postId = parsePostIdFromParams(req);
  return postId ? journalHeroDir(postId) : journalHeroStagingDir();
});

const journalInlineStorage = createDynamicImageStorage((req) => {
  const postId = Number.parseInt(String(req.query.postId), 10);
  return journalInlineDir(postId);
});

const journalMulterBase = {
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: imageFileFilter,
};

/** Journal cover image: staging on create, `posts/:id/hero` on update. */
export const uploadJournalHeroImage = multer({
  storage: journalHeroStorage,
  ...journalMulterBase,
}).single("image");

/** Journal rich-text images require `?postId=` and save under `posts/:id/inline`. */
export const uploadJournalInlineImage = multer({
  storage: journalInlineStorage,
  ...journalMulterBase,
}).single("upload");

export function requireJournalInlinePostId(req: Request, _res: Response, next: NextFunction): void {
  const postId = Number.parseInt(String(req.query.postId), 10);
  if (!Number.isInteger(postId) || postId <= 0) {
    next(new AppError("postId query parameter is required", 400));
    return;
  }
  next();
}

export function journalInlineImageResponse(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.file) {
      next(new AppError("Image is required", 400));
      return;
    }
    const postId = Number.parseInt(String(req.query.postId), 10);
    const url = journalInlinePublicUrl(postId, req.file.filename);
    sendSuccess(res, { url }, "Image uploaded", 201);
  } catch (error) {
    next(error);
  }
}