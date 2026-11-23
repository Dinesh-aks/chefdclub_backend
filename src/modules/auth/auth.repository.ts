import { prisma } from "../../config/prisma.js";

// Used at login.
export async function findAdminByEmail(email: string) {
  return prisma.admin.findFirst({
    where: { email },
  });
}

export async function updateAdmin(
  id: number,
  data: {
    firstName?: string;
    lastName?: string | null;
    email?: string;
    mobile?: string | null;
    address?: string | null;
    image?: string;
    password?: string;
  }
) {
  return prisma.admin.update({ where: { id }, data });
}

// Another admin already using this email (uniqueness check on profile update).
export async function findOtherAdminByEmail(email: string, excludeId: number) {
  return prisma.admin.findFirst({
    where: { email, NOT: { id: excludeId } },
    select: { id: true },
  });
}

// Used to re-check the admin on every authenticated request and refresh.
export async function findAdminById(id: number) {
  return prisma.admin.findUnique({
    where: { id },
  });
}
