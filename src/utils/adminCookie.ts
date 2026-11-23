import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

export const ADMIN_COOKIE_NAME = "chefdclub_admin_token";
export const ADMIN_REFRESH_COOKIE_NAME = "chefdclub_admin_refresh";

// Same options for set and clear; browsers only clear a cookie whose attributes match.
function cookieOptions(): CookieOptions {
  const crossSite = env.adminCookieSameSite === "none";
  return {
    httpOnly: true,
    // SameSite=None is only accepted by browsers together with Secure.
    secure: crossSite || env.nodeEnv === "production",
    sameSite: env.adminCookieSameSite,
    path: "/",
  };
}

export function setAdminCookies(
  res: Response,
  tokens: {
    accessToken: string;
    accessExpiresInSeconds: number;
    refreshToken: string;
    refreshExpiresInSeconds: number;
  },
): void {
  res.cookie(ADMIN_COOKIE_NAME, tokens.accessToken, {
    ...cookieOptions(),
    maxAge: tokens.accessExpiresInSeconds * 1000,
  });
  res.cookie(ADMIN_REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...cookieOptions(),
    maxAge: tokens.refreshExpiresInSeconds * 1000,
  });
}

export function clearAdminCookies(res: Response): void {
  res.clearCookie(ADMIN_COOKIE_NAME, cookieOptions());
  res.clearCookie(ADMIN_REFRESH_COOKIE_NAME, cookieOptions());
}

// Reads a cookie parsed by cookie-parser; missing or empty values return undefined.
function readCookie(req: Request, name: string): string | undefined {
  const value: unknown = req.cookies?.[name];
  return typeof value === "string" && value ? value : undefined;
}

export const readAdminCookie = (req: Request) => readCookie(req, ADMIN_COOKIE_NAME);
export const readAdminRefreshCookie = (req: Request) => readCookie(req, ADMIN_REFRESH_COOKIE_NAME);
