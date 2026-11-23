import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { getHealthStatus } from "./health.service.js";

export const getHealth = (_req: Request, res: Response): void => {
  const status = getHealthStatus();
  sendSuccess(res, status, "Chef'd Club API is running");
};
