import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

// Validates the token with Cloudflare; a failed call is 503, a rejected token is 400.
async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteip?: string
): Promise<void> {
  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteip) {
    body.set("remoteip", remoteip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new AppError("Security verification unavailable", 503);
  }

  const data = (await response.json()) as TurnstileVerifyResponse;
  if (!data.success) {
    throw new AppError("Validation failed", 400, [
      { field: "turnstileToken", message: "Security verification failed. Please try again." },
    ]);
  }
}

function clientIp(req: { ip?: string; socket?: { remoteAddress?: string } }): string | undefined {
  return req.ip ?? req.socket?.remoteAddress;
}

// Skipped when no secret is configured (e.g. local development).
export async function assertContactTurnstile(
  token: string | undefined,
  req: { ip?: string; socket?: { remoteAddress?: string } }
): Promise<void> {
  const secret = env.turnstileContactSecretKey;
  if (!secret) {
    return;
  }
  if (!token?.trim()) {
    throw new AppError("Validation failed", 400, [
      { field: "turnstileToken", message: "Complete the security check before submitting." },
    ]);
  }
  await verifyTurnstileToken(secret, token.trim(), clientIp(req));
}

// Same check as contact, using the reservation form's secret.
export async function assertReservationTurnstile(
  token: string | undefined,
  req: { ip?: string; socket?: { remoteAddress?: string } }
): Promise<void> {
  const secret = env.turnstileReservationSecretKey;
  if (!secret) {
    return;
  }
  if (!token?.trim()) {
    throw new AppError("Validation failed", 400, [
      { field: "turnstileToken", message: "Complete the security check before submitting." },
    ]);
  }
  await verifyTurnstileToken(secret, token.trim(), clientIp(req));
}
