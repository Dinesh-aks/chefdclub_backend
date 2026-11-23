import { Response } from "express";
import { ApiErrorResponse, ApiSuccessResponse } from "../types/api.js";

// Standard success/error JSON envelopes (see types/api.ts).
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors: unknown[] = []
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
