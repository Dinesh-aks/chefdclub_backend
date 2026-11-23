/** A row on the public Journal list: no body, just what the card shows. */
export interface PublicBlogPostSummary {
  slug: string;
  title: string;
  /** Legacy free-text, normally `yyyy-mm-dd`. */
  publishDate: string;
  excerpt: string;
  imageUrl: string | null;
  categoryName: string | null;
}

/** One full post for the public Journal article page. */
export interface PublicBlogPost extends PublicBlogPostSummary {
  author: string;
  /** Admin-authored HTML from the rich text editor. */
  description: string;
  /** YouTube video id, if the post has one. */
  video: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Active likes (`blog_like` rows with like = 1). */
  likeCount: number;
}

/** Fields a public list request may ask for with `?fields=`; omitting it returns all of them. */
export const PUBLIC_SUMMARY_FIELDS = [
  "slug",
  "title",
  "publishDate",
  "excerpt",
  "imageUrl",
  "categoryName",
] as const;
export type PublicBlogPostSummaryField = (typeof PUBLIC_SUMMARY_FIELDS)[number];
