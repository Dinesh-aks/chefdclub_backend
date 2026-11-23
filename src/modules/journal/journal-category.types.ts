export interface BlogCategoryRecord {
  id: number;
  category: string;
  slug: string;
  status: boolean;
  sort: number;
}

export interface BlogCategoryInput {
  category: string;
  slug: string;
  status: boolean;
  sort: number;
}

export type BlogCategoryUpdateInput = Partial<BlogCategoryInput>;
