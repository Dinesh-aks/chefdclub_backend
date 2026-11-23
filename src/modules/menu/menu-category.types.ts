export interface MenuCategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageUrl: string;
  banner: string | null;
  bannerUrl: string | null;
  status: boolean;
  sort: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MenuCategoryInput {
  name: string;
  slug: string;
  description: string;
  status: boolean;
  sort: number;
  imageFilename?: string;
  bannerFilename?: string;
}

export type MenuCategoryUpdateInput = Partial<MenuCategoryInput>;
