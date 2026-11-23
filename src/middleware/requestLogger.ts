import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

const MAX_ARRAY_ITEMS = 3;
const MAX_STRING_LENGTH = 120;
const SKIPPED_PREFIXES = ["/health", "/uploads"];
const logBodies = env.nodeEnv !== "production" && env.apiLogBodies;

// Colors only when the terminal can show them.
const useColor = Boolean(process.stdout.isTTY);
const paint = (code: number, text: string): string => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const dim = (text: string): string => paint(2, text);

function statusColor(status: number, text: string): string {
  if (status >= 500) return paint(31, text);
  if (status >= 400) return paint(33, text);
  return paint(32, text);
}

/**
 * Shrinks a body for the terminal: long lists keep their first few items, long strings are cut,
 * and passwords/tokens are hidden.
 */
function slim(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    const head = value.slice(0, MAX_ARRAY_ITEMS).map(slim);
    if (value.length > MAX_ARRAY_ITEMS) head.push(`… +${value.length - MAX_ARRAY_ITEMS} more items`);
    return head;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, /password|token/i.test(key) ? "***" : slim(item)]),
    );
  }
  if (typeof value === "string" && value.length > MAX_STRING_LENGTH) {
    return `${value.slice(0, MAX_STRING_LENGTH)}… (${value.length} chars)`;
  }
  return value;
}

// Indented JSON, shifted right so it reads as part of the log entry.
function block(label: string, value: unknown): string {
  const json = JSON.stringify(slim(value), null, 2) ?? "-";
  return `${dim(`  ${label}`)}\n${json.replace(/^/gm, "    ")}`;
}

/**
 * Logs every API call: `GET /api/faq 200 12ms`. In development it also prints the request body
 * and the JSON response, so calls made from Next.js Server Components (which never show in the
 * browser's Network tab) can still be inspected.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!env.apiLogEnabled || SKIPPED_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    next();
    return;
  }

  const startedAt = Date.now();
  let responseBody: unknown;

  if (logBodies) {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      responseBody = body;
      return originalJson(body);
    };
  }

  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    const parts = [
      `[api] ${paint(1, req.method)} ${req.originalUrl} ${statusColor(res.statusCode, String(res.statusCode))} ${dim(`${ms}ms`)}`,
    ];
    if (logBodies) {
      // Multipart uploads are parsed by multer, so their fields show up in req.body too.
      if (req.body && Object.keys(req.body).length > 0) parts.push(block("sent", req.body));
      if (responseBody !== undefined) parts.push(block("got", responseBody));
    }
    console.log(`${parts.join("\n")}\n`);
  });

  next();
}
