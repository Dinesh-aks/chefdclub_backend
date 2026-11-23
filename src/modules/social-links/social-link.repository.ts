import { prisma } from "../../config/prisma.js";
import type { Prisma, SocialLink as SocialLinkRow } from "../../generated/prisma/index.js";
import type { AdminListQueryBase } from "../../utils/adminListQuery.js";
import type { SocialLinkInput, SocialLinkRecord, SocialLinkUpdateInput } from "./social-link.types.js";

function toRecord(row: SocialLinkRow): SocialLinkRecord {
  return { id: row.id, link: row.link, icon: row.icon };
}

// Unpaginated, stable order by id; the table is small and used by the public site.
export async function listAll(): Promise<SocialLinkRecord[]> {
  const rows = await prisma.socialLink.findMany({ orderBy: { id: "asc" } });
  return rows.map(toRecord);
}

export async function listPage(
  query: AdminListQueryBase,
): Promise<{ items: SocialLinkRecord[]; total: number }> {
  // Search matches either the URL or the icon name.
  const where: Prisma.SocialLinkWhereInput = query.search
    ? {
        OR: [{ link: { contains: query.search } }, { icon: { contains: query.search } }],
      }
    : {};
  const orderBy = { [query.sort]: query.order } as Prisma.SocialLinkOrderByWithRelationInput;
  const [rows, total] = await Promise.all([
    prisma.socialLink.findMany({ where, orderBy, skip: query.offset, take: query.limit }),
    prisma.socialLink.count({ where }),
  ]);
  return { items: rows.map(toRecord), total };
}

export async function findById(id: number): Promise<SocialLinkRecord | null> {
  const row = await prisma.socialLink.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function create(input: SocialLinkInput): Promise<SocialLinkRecord> {
  const row = await prisma.socialLink.create({ data: { link: input.link, icon: input.icon } });
  return toRecord(row);
}

export async function update(id: number, input: SocialLinkUpdateInput): Promise<SocialLinkRecord> {
  const row = await prisma.socialLink.update({
    where: { id },
    // Only write fields that were sent (partial update).
    data: {
      ...(input.link !== undefined ? { link: input.link } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
    },
  });
  return toRecord(row);
}

export async function remove(id: number): Promise<void> {
  await prisma.socialLink.delete({ where: { id } });
}
