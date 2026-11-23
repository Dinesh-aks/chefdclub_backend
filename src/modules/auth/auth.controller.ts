import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { clearAdminCookies, readAdminRefreshCookie, setAdminCookies } from "../../utils/adminCookie.js";
import {
  validateAdminChangePassword,
  validateAdminLogin,
  validateAdminProfileUpdate,
} from "./auth.validator.js";
import type { AdminLoginResult } from "./auth.types.js";
import * as authService from "./auth.service.js";

// Tokens only travel in httpOnly cookies, never in the JSON body.
function setSessionCookies(res: Response, result: AdminLoginResult): void {
  setAdminCookies(res, {
    accessToken: result.accessToken,
    accessExpiresInSeconds: result.expiresInSeconds,
    refreshToken: result.refreshToken,
    refreshExpiresInSeconds: result.refreshExpiresInSeconds,
  });
}

// On failure the cookies are cleared so a dead session does not keep retrying.
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.refresh(readAdminRefreshCookie(req));
    setSessionCookies(res, result);
    sendSuccess(res, { expiresInSeconds: result.expiresInSeconds, admin: result.admin }, "Session refreshed");
  } catch (error) {
    clearAdminCookies(res);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateAdminLogin(req.body);
    const result = await authService.login(input);
    setSessionCookies(res, result);
    sendSuccess(res, { expiresInSeconds: result.expiresInSeconds, admin: result.admin }, "Login successful");
  } catch (error) {
    next(error);
  }
};

// Returns the admin loaded by requireAdminAuth.
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Unauthorized", errors: [] });
      return;
    }
    sendSuccess(res, req.admin, "OK");
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    clearAdminCookies(res);
    sendSuccess(res, { ok: true }, "Logged out");
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await authService.getProfile(req.admin!.id), "Profile fetched successfully.");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateAdminProfileUpdate(req.body, req.file);
    sendSuccess(res, await authService.updateProfile(req.admin!.id, input), "Profile updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = validateAdminChangePassword(req.body);
    await authService.changePassword(req.admin!.id, input);
    sendSuccess(res, { ok: true }, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};
