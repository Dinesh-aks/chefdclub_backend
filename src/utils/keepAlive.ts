import { env } from "../config/env.js";
import { logger } from "./logger.js";

const PING_INTERVAL_MS = 10 * 60 * 1000;

/** Self-pings the deployed URL every 10 minutes so Render's free tier doesn't spin down from inactivity. */
export function startKeepAlive(): void {
  if (!env.keepAliveEnabled || !env.keepAliveUrl) {
    return;
  }

  const url = `${env.keepAliveUrl.replace(/\/$/, "")}/health`;

  setInterval(() => {
    fetch(url).catch((error) => {
      logger.warn("Keep-alive ping failed", error);
    });
  }, PING_INTERVAL_MS);

  logger.info(`Keep-alive enabled, pinging ${url} every 10 minutes`);
}
