import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/apiResponse.js";

// Central error handler: known AppErrors keep their status, anything else is a logged 500.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  logger.error("Unhandled error", err);
  sendError(res, "Internal server error", 500);
};
