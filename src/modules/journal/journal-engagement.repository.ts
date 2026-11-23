import { prisma } from "../../config/prisma.js";

// `blog_view.ip_address` is VarChar(80) and `blog_like.ip_address` VarChar(55).
const VIEW_IP_MAX = 80;
const LIKE_IP_MAX = 55;

/** Midnight (UTC) today: the value stored in the DATE columns. */
function today(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/** Id of an active post, or null (inactive and unknown posts can't be viewed or liked). */
export async function findActivePostId(slug: string): Promise<number | null> {
  const row = await prisma.blogPost.findFirst({ where: { slug, status: 1 }, select: { id: true } });
  return row?.id ?? null;
}

export async function countLikes(blogId: number): Promise<number> {
  return prisma.blogLike.count({ where: { blogId, like: 1 } });
}

// One row per visitor IP per day; each view adds 1 to that row's counter.
export async function recordView(blogId: number, ip: string): Promise<void> {
  const where = { blogId, ipAddress: ip.slice(0, VIEW_IP_MAX), viewDate: today() };
  const updated = await prisma.blogView.updateMany({ where, data: { noOfView: { increment: 1 } } });
  if (updated.count === 0) {
    await prisma.blogView.create({ data: { ...where, noOfView: 1 } });
  }
}

export interface LikeState {
  count: number;
  liked: boolean;
}

export async function getLikeState(blogId: number, ip: string): Promise<LikeState> {
  const [count, mine] = await Promise.all([
    countLikes(blogId),
    prisma.blogLike.findFirst({
      where: { blogId, ipAddress: ip.slice(0, LIKE_IP_MAX) },
      orderBy: { id: "desc" },
      select: { like: true },
    }),
  ]);
  return { count, liked: mine?.like === 1 };
}

// Like <-> unlike for one visitor IP. Rows are never deleted: unliking flips `like` to 0 and
// `un_like` to 1 on the same row, and liking again flips it back.
export async function toggleLike(blogId: number, ip: string): Promise<LikeState> {
  const ipAddress = ip.slice(0, LIKE_IP_MAX);
  const existing = await prisma.blogLike.findFirst({
    where: { blogId, ipAddress },
    orderBy: { id: "desc" },
    select: { id: true, like: true },
  });

  if (!existing) {
    const now = new Date();
    await prisma.blogLike.create({
      // user_id is NOT NULL in the real table (the Prisma schema says optional); the legacy site
      // stored 0 for guests, and readers here are always guests.
      data: { blogId, ipAddress, userId: 0, like: 1, unlike: 0, date: today(), addDate: now },
    });
  } else {
    const nowLiked = existing.like !== 1;
    await prisma.blogLike.update({
      where: { id: existing.id },
      data: { like: nowLiked ? 1 : 0, unlike: nowLiked ? 0 : 1 },
    });
  }
  return getLikeState(blogId, ipAddress);
}
