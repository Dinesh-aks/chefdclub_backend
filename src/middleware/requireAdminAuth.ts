import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAdminAccessToken } from "../utils/jwt.js";
import { readAdminCookie } from "../utils/adminCookie.js";
import * as authService from "../modules/auth/auth.service.js";

// Parses an `Authorization: Bearer <token>` header.
function extractBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim();
}

// Guards admin routes: accepts the httpOnly cookie or a Bearer token, then loads the active admin onto req.admin.
export async function requireAdminAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = readAdminCookie(req) ?? extractBearerToken(req.headers.authorization);
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const payload = verifyAdminAccessToken(token);
    req.admin = await authService.getSessionAdmin(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}
