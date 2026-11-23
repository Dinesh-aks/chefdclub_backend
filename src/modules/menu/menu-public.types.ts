/** A tab on the public Menus page: just enough to link to the category. */
export interface PublicMenuTab {
  slug: string;
  name: string;
}

/** Meal types as they appear in the website's query string. */
export const MENU_TYPE_SLUG_TO_ID = {
  breakfast: 12,
  lunch: 13,
  dinner: 14,
  wine: 15,
} as const;

export type MenuTypeSlug = keyof typeof MENU_TYPE_SLUG_TO_ID;

/** A photo card inside a menu category (image + name only). */
export interface PublicMenuCard {
  id: number;
  name: string;
  bannerUrl: string | null;
  /** Meal type id (12 Breakfast, 13 Lunch, 14 Dinner, 15 Wine). */
  type: number;
  typeLabel: string;
}

/** One meal type in a category, with how many active cards it has (for the filter chips). */
export interface PublicMenuType {
  slug: MenuTypeSlug;
  label: string;
  count: number;
}

/** One meal type's own page of cards. Each section is paginated on its own. */
export interface PublicMenuSection {
  slug: MenuTypeSlug;
  label: string;
  /** All active cards of this meal type. */
  total: number;
  /** The page actually returned (a requested page past the end is clamped to the last one). */
  page: number;
  limit: number;
  totalPages: number;
  items: PublicMenuCard[];
}

/**
 * One active menu category: its name, the meal types it has (with counts), and one page of cards
 * for each meal type (just the one asked for, when filtered).
 */
export interface PublicMenuCategory extends PublicMenuTab {
  /** All active cards in the category, whatever the filter. */
  total: number;
  types: PublicMenuType[];
  sections: PublicMenuSection[];
}
