import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

export type AdminTokenPayload = {
  sub: number;
  email: string;
  type: "admin";
};

// Short-lived token for API access; the refresh token below renews it.
export function signAdminAccessToken(payload: Omit<AdminTokenPayload, "type">): {
  accessToken: string;
  expiresInSeconds: number;
} {
  if (!env.jwtSecret) {
    throw new AppError("Authentication is not configured", 503);
  }

  const expiresInSeconds = env.jwtAccessExpiresInSeconds;
  const accessToken = jwt.sign(
    { ...payload, type: "admin" as const },
    env.jwtSecret,
    { expiresIn: expiresInSeconds }
  );

  return { accessToken, expiresInSeconds };
}

export function signAdminRefreshToken(payload: Omit<AdminTokenPayload, "type">): {
  refreshToken: string;
  expiresInSeconds: number;
} {
  if (!env.jwtSecret) {
    throw new AppError("Authentication is not configured", 503);
  }

  const expiresInSeconds = env.jwtRefreshExpiresInSeconds;
  const refreshToken = jwt.sign(
    { ...payload, type: "admin_refresh" as const },
    env.jwtSecret,
    { expiresIn: expiresInSeconds }
  );

  return { refreshToken, expiresInSeconds };
}

export function verifyAdminAccessToken(token: string): AdminTokenPayload {
  return verifyAdminToken(token, "admin");
}

export function verifyAdminRefreshToken(token: string): AdminTokenPayload {
  return verifyAdminToken(token, "admin_refresh");
}

function verifyAdminToken(token: string, expectedType: "admin" | "admin_refresh"): AdminTokenPayload {
  if (!env.jwtSecret) {
    throw new AppError("Authentication is not configured", 503);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded !== "object" || decoded === null) {
      throw new AppError("Unauthorized", 401);
    }

    const record = decoded as Record<string, unknown>;
    const sub = record.sub;
    const email = record.email;
    const type = record.type;

    // Access and refresh tokens share a secret, so `type` keeps one from standing in for the other.
    if (type !== expectedType || typeof email !== "string" || (typeof sub !== "number" && typeof sub !== "string")) {
      throw new AppError("Unauthorized", 401);
    }

    const adminId = typeof sub === "number" ? sub : Number.parseInt(sub, 10);
    if (!Number.isInteger(adminId) || adminId < 1) {
      throw new AppError("Unauthorized", 401);
    }

    return { sub: adminId, email, type: "admin" };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Unauthorized", 401);
  }
}
