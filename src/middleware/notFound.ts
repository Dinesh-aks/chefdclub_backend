import { Request, Response } from "express";
import { sendError } from "../utils/apiResponse.js";

// Fallback for any route no module handled.
export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};
