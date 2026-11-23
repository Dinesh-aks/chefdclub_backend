import { AppError } from "../../utils/AppError.js";
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyAdminRefreshToken,
} from "../../utils/jwt.js";
import type {
  AdminChangePasswordInput,
  AdminLoginInput,
  AdminLoginResult,
  AdminProfileRecord,
  AdminProfileUpdateInput,
  AdminPublicProfile,
  AdminSessionAdmin,
} from "./auth.types.js";
import * as authRepository from "./auth.repository.js";

// Whitelists profile fields so the password never leaves the service.
function toPublicProfile(admin: {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  image: string | null;
}): AdminPublicProfile {
  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    image: admin.image,
  };
}

/** Legacy Laravel stores plain-text passwords in `admin.password`. */
function verifyLegacyPassword(stored: string, provided: string): boolean {
  return stored === provided;
}

// Same error for unknown email and wrong password to avoid revealing which accounts exist.
export async function login(input: AdminLoginInput): Promise<AdminLoginResult> {
  const admin = await authRepository.findAdminByEmail(input.email);
  if (!admin || !verifyLegacyPassword(admin.password, input.password)) {
    throw new AppError("Invalid email or password", 401);
  }

  if (admin.status !== 1) {
    throw new AppError("Your account has been deactivated", 403);
  }

  return issueSession(toPublicProfile(admin));
}

// Signs both tokens; the controller puts them in cookies.
function issueSession(admin: AdminPublicProfile): AdminLoginResult {
  const claims = { sub: admin.id, email: admin.email };
  const { accessToken, expiresInSeconds } = signAdminAccessToken(claims);
  const { refreshToken, expiresInSeconds: refreshExpiresInSeconds } = signAdminRefreshToken(claims);

  return { accessToken, expiresInSeconds, refreshToken, refreshExpiresInSeconds, admin };
}

/** Exchanges a valid refresh token for a fresh session; re-checks the admin still exists and is active. */
export async function refresh(refreshToken: string | undefined): Promise<AdminLoginResult> {
  if (!refreshToken) {
    throw new AppError("Unauthorized", 401);
  }
  const payload = verifyAdminRefreshToken(refreshToken);
  return issueSession(await getSessionAdmin(payload.sub));
}

// Rejects missing or deactivated admins (status !== 1).
export async function getSessionAdmin(adminId: number): Promise<AdminSessionAdmin> {
  const admin = await authRepository.findAdminById(adminId);
  if (!admin || admin.status !== 1) {
    throw new AppError("Unauthorized", 401);
  }
  return toPublicProfile(admin);
}

function toProfileRecord(admin: {
  firstName: string;
  lastName: string | null;
  email: string;
  mobile: string | null;
  address: string | null;
  image: string | null;
}): AdminProfileRecord {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    mobile: admin.mobile,
    address: admin.address,
    imageUrl: admin.image ? `/uploads/admin/${admin.image}` : null,
  };
}

export async function getProfile(adminId: number): Promise<AdminProfileRecord> {
  const admin = await authRepository.findAdminById(adminId);
  if (!admin) {
    throw new AppError("Unauthorized", 401);
  }
  return toProfileRecord(admin);
}

export async function updateProfile(
  adminId: number,
  input: AdminProfileUpdateInput
): Promise<AdminProfileRecord> {
  if (input.email && (await authRepository.findOtherAdminByEmail(input.email, adminId))) {
    throw new AppError("Validation failed", 400, [
      { field: "email", message: "This email is already in use" },
    ]);
  }
  const { imageFilename, ...fields } = input;
  const admin = await authRepository.updateAdmin(adminId, {
    ...fields,
    ...(imageFilename ? { image: imageFilename } : {}),
  });
  return toProfileRecord(admin);
}

export async function changePassword(adminId: number, input: AdminChangePasswordInput): Promise<void> {
  const admin = await authRepository.findAdminById(adminId);
  if (!admin) {
    throw new AppError("Unauthorized", 401);
  }
  if (!verifyLegacyPassword(admin.password, input.currentPassword)) {
    throw new AppError("Validation failed", 400, [
      { field: "currentPassword", message: "Current password is incorrect" },
    ]);
  }
  // Stored as plain text to stay compatible with the legacy login check above.
  await authRepository.updateAdmin(adminId, { password: input.newPassword });
}
