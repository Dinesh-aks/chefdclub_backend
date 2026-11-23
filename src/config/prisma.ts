import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

/** Prisma 7 driver adapter (connects to MySQL via `DATABASE_URL`). */
const adapter = new PrismaMariaDb(env.databaseUrl);

export const prisma = new PrismaClient({ adapter });
