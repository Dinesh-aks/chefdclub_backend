import { NextFunction, Request, Response } from "express";

// Sets Cache-Control: no-store so admin data is never served stale.
export const noCache = (_req: Request, res: Response, next: NextFunction): void => {
  res.set("Cache-Control", "no-store");
  next();
};
