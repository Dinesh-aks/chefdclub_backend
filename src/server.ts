import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";
import { startKeepAlive } from "./utils/keepAlive.js";

// Verifies the database is reachable before accepting traffic.
async function start() {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  logger.info("Database connected");

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} (${env.nodeEnv})`);
    startKeepAlive();
  });
}

start().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
