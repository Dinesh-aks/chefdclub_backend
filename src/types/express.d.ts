import type { AdminSessionAdmin } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      // Set by requireAdminAuth on authenticated admin routes.
      admin?: AdminSessionAdmin;
    }
  }
}

export {};
