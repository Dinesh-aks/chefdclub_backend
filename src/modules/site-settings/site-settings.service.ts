import * as siteSettingsRepository from "./site-settings.repository.js";
import type { SiteSettingsRecord, SiteSettingsUpdateInput } from "./site-settings.types.js";

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  return siteSettingsRepository.get();
}

export async function updateSiteSettings(
  input: SiteSettingsUpdateInput
): Promise<SiteSettingsRecord> {
  return siteSettingsRepository.update(input);
}
