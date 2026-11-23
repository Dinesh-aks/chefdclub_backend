import path from "path";
import { moduleDirname } from "../../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);

const UPLOADS_ROOT = path.join(__dirname, "../../../uploads");

export function journalHeroStagingDir(): string {
  return path.join(UPLOADS_ROOT, "cms/blog/staging/hero");
}

export function journalHeroDir(postId: number): string {
  return path.join(UPLOADS_ROOT, "cms/blog/posts", String(postId), "hero");
}

export function journalInlineDir(postId: number): string {
  return path.join(UPLOADS_ROOT, "cms/blog/posts", String(postId), "inline");
}

export function journalHeroPublicUrl(postId: number, filename: string): string {
  return `/uploads/cms/blog/posts/${postId}/hero/${filename}`;
}

export function journalInlinePublicUrl(postId: number, filename: string): string {
  return `/uploads/cms/blog/posts/${postId}/inline/${filename}`;
}

export function resolveHeroImageUrl(postId: number, image: string | null): string | null {
  if (!image) return null;
  return journalHeroPublicUrl(postId, image);
}