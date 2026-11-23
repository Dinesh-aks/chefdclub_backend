export interface BlogPostRecord {
  id: number;
  catId: number;
  author: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  imageUrl: string | null;
  video: string | null;
  publishDate: string;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
  updatedAt: Date;
  viewCount: number;
  likeCount: number;
}

/** A row in the admin list: omits the long description, video and SEO fields. */
export type BlogPostListItem = Omit<
  BlogPostRecord,
  "description" | "video" | "seoTitle" | "seoDescription"
> & { categoryName: string | null };

export interface BlogPostInput {
  catId: number;
  author: string;
  title: string;
  slug: string;
  description: string;
  video?: string;
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
  status: boolean;
  imageFilename?: string;
}

export type BlogPostUpdateInput = Partial<BlogPostInput>;
