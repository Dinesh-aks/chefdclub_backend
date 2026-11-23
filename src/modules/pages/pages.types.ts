export type PageSlug = "about-us" | "privacy-policy" | "terms-and-conditions";

export interface CmsPageRecord {
  id: number;
  slug: PageSlug;
  title: string | null;
  short: string | null;
  description: string | null;
  banner: string | null;
  bannerUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  addDate: Date;
}

/** What the admin editor needs: no id/slug/banner filename/SEO/addDate. */
export type CmsPageAdminView = Pick<CmsPageRecord, "title" | "short" | "description" | "bannerUrl">;

export interface CmsPageUpdateInput {
  title?: string;
  short?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  bannerFilename?: string;
}
