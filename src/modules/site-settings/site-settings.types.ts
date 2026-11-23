export interface SiteSettingsRecord {
  email: string | null;
  phone: string | null;
  address: string | null;
}

export type SiteSettingsUpdateInput = Partial<SiteSettingsRecord>;
