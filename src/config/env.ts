export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  turnstileContactSecretKey: process.env.TURNSTILE_CONTACT_SECRET_KEY ?? "",
  turnstileReservationSecretKey: process.env.TURNSTILE_RESERVATION_SECRET_KEY ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtAccessExpiresInSeconds: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? 28800),
  jwtRefreshExpiresInSeconds: Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? 604800),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3002")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Falls back to "lax" when the value is missing or invalid.
  adminCookieSameSite: (["lax", "strict", "none"] as const).includes(
    process.env.ADMIN_COOKIE_SAMESITE as "lax" | "strict" | "none",
  )
    ? (process.env.ADMIN_COOKIE_SAMESITE as "lax" | "strict" | "none")
    : ("lax" as "lax" | "strict" | "none"),
  // Render injects RENDER_EXTERNAL_URL; KEEP_ALIVE_URL is the manual override.
  keepAliveUrl: process.env.RENDER_EXTERNAL_URL ?? process.env.KEEP_ALIVE_URL ?? "",
  keepAliveEnabled: process.env.KEEP_ALIVE_ENABLED !== "false",
  // API_LOG=false turns the request log off; API_LOG_BODIES=false keeps the one-line log but hides
  // the request/response JSON (bodies are only ever printed outside production).
  apiLogEnabled: process.env.API_LOG !== "false",
  apiLogBodies: process.env.API_LOG_BODIES !== "false",
};
