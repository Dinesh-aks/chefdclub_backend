import { prisma } from "../../config/prisma.js";
import { MENU_CARD_TYPE_LABELS } from "./menu-card.types.js";
import type { PublicMenuCategoryQuery } from "./menu-public.validator.js";
import {
  MENU_TYPE_SLUG_TO_ID,
  type MenuTypeSlug,
  type PublicMenuCategory,
  type PublicMenuTab,
  type PublicMenuType,
} from "./menu-public.types.js";

// Only active rows are public (status is stored as the text "1").
const ACTIVE = "1";

// Tabs for the Menus page, in the admin's display order.
export async function listTabs(): Promise<PublicMenuTab[]> {
  return prisma.menuCategory.findMany({
    where: { status: ACTIVE },
    orderBy: { sort: "asc" },
    select: { slug: true, name: true },
  });
}

const TYPE_SLUGS = Object.keys(MENU_TYPE_SLUG_TO_ID) as MenuTypeSlug[];

// One active category with a page of cards per meal type, all filtered in the database. Each meal
// type is paginated on its own; a page past the end is clamped to the last page.
export async function findBySlug(
  slug: string,
  query: PublicMenuCategoryQuery,
): Promise<PublicMenuCategory | null> {
  const category = await prisma.menuCategory.findFirst({
    where: { slug, status: ACTIVE },
    select: { id: true, slug: true, name: true },
  });
  if (!category) return null;

  const base = { menu: category.id, status: ACTIVE };
  const counts = await prisma.menuCard.groupBy({ by: ["type"], where: base, _count: { _all: true } });
  const countByType = new Map(counts.map((row) => [row.type, row._count._all]));

  const types: PublicMenuType[] = TYPE_SLUGS.flatMap((typeSlug) => {
    const typeId = MENU_TYPE_SLUG_TO_ID[typeSlug];
    const count = countByType.get(typeId) ?? 0;
    return count > 0 ? [{ slug: typeSlug, label: MENU_CARD_TYPE_LABELS[typeId], count }] : [];
  });

  const visibleTypes = query.type ? types.filter((type) => type.slug === query.type) : types;

  const sections = await Promise.all(
    visibleTypes.map(async (type) => {
      const typeId = MENU_TYPE_SLUG_TO_ID[type.slug];
      const totalPages = Math.max(1, Math.ceil(type.count / query.limit));
      const page = Math.min(query.pages[type.slug] ?? 1, totalPages);
      const rows = await prisma.menuCard.findMany({
        where: { ...base, type: typeId },
        orderBy: [{ sort: "asc" }, { id: "asc" }],
        skip: (page - 1) * query.limit,
        take: query.limit,
        select: { id: true, name: true, banner: true, type: true },
      });
      return {
        slug: type.slug,
        label: type.label,
        total: type.count,
        page,
        limit: query.limit,
        totalPages,
        items: rows.map((card) => ({
          id: card.id,
          name: card.name,
          bannerUrl: card.banner ? `/uploads/cms/menu-cards/${card.banner}` : null,
          type: card.type,
          typeLabel: MENU_CARD_TYPE_LABELS[card.type] ?? "Other",
        })),
      };
    }),
  );

  return {
    slug: category.slug,
    name: category.name,
    total: types.reduce((sum, type) => sum + type.count, 0),
    types,
    sections,
  };
}
