export interface AdminPublicProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  image: string | null;
}

// The admin attached to req.admin; same fields as the public profile.
export type AdminSessionAdmin = AdminPublicProfile;

export interface AdminLoginResult {
  accessToken: string;
  expiresInSeconds: number;
  refreshToken: string;
  refreshExpiresInSeconds: number;
  admin: AdminPublicProfile;
}

// Fields the Settings > Profile tab shows and edits.
export interface AdminProfileRecord {
  firstName: string;
  lastName: string | null;
  email: string;
  mobile: string | null;
  address: string | null;
  imageUrl: string | null;
}

export interface AdminProfileUpdateInput {
  firstName?: string;
  lastName?: string | null;
  email?: string;
  mobile?: string | null;
  address?: string | null;
  imageFilename?: string;
}

export interface AdminChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}
