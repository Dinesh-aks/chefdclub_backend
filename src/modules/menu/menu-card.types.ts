/// The legacy `type` lookup table is fixed at these 4 rows and never gets its own
/// CRUD in Laravel either — hardcoded here rather than modeled in Prisma.
export const MENU_CARD_TYPE_LABELS: Record<number, string> = {
  12: "Breakfast",
  13: "Lunch",
  14: "Dinner",
  15: "Wine",
};

export type MenuCardType = 12 | 13 | 14 | 15;

export interface MenuCardRecord {
  id: number;
  menu: number;
  type: MenuCardType;
  typeLabel: string;
  name: string;
  slug: string;
  banner: string | null;
  bannerUrl: string | null;
  status: boolean;
  sort: number;
  showOnHome: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MenuCardInput {
  menu: number;
  type: MenuCardType;
  name: string;
  slug: string;
  status: boolean;
  sort: number;
  showOnHome: boolean;
  bannerFilename?: string;
}

export type MenuCardUpdateInput = Partial<MenuCardInput>;
