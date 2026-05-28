import type { Permission, Role, User } from "./auth";
import type { SessionId } from "./identifiers";
import type { Tenant } from "./tenant";

export type AuthState = "loading" | "authenticated" | "anonymous";

export interface SessionModel {
  id: SessionId;
  tenant: Tenant;
  user: User;
  roles: Role[];
  permissions: Permission[];
  issuedAt: string;
  expiresAt: string;
}

export interface LoginInput {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  session: SessionModel;
  accessToken: string;
  refreshToken: string;
}
