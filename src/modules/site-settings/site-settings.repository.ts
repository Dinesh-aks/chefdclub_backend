import { prisma } from "../../config/prisma.js";
import type { SiteSettings as SiteSettingsRow } from "../../generated/prisma/index.js";
import type { SiteSettingsRecord, SiteSettingsUpdateInput } from "./site-settings.types.js";

// Site settings is a singleton row, always stored with id 1.
const SETTINGS_ID = 1;

function toRecord(row: SiteSettingsRow): SiteSettingsRecord {
  return { email: row.email, phone: row.phone, address: row.address };
}

// Upsert with an empty update creates the row on first read, so callers never get null.
export async function get(): Promise<SiteSettingsRecord> {
  const row = await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {},
  });
  return toRecord(row);
}

export async function update(input: SiteSettingsUpdateInput): Promise<SiteSettingsRecord> {
  const row = await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...input },
    update: input,
  });
  return toRecord(row);
}
