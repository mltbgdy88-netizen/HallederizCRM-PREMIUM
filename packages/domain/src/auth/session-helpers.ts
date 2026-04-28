import type {
  LoginInput,
  LoginResponse,
  Role,
  SessionModel,
  Tenant,
  User
} from "@hallederiz/types";
import { getEffectivePermissions } from "./permission-helpers";

function nowIso(): string {
  return new Date().toISOString();
}

export function isSessionActive(session: SessionModel): boolean {
  return new Date(session.expiresAt).getTime() > Date.now();
}

export function createMockSession(params: {
  tenant: Tenant;
  user: User;
  roles: Role[];
}): SessionModel {
  const issuedAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();

  return {
    id: `sess_${params.user.id}`,
    tenant: params.tenant,
    user: params.user,
    roles: params.roles,
    permissions: getEffectivePermissions(params.user, params.roles),
    issuedAt,
    expiresAt
  };
}

export function createMockLoginResponse(input: LoginInput, tenant: Tenant, user: User, roles: Role[]): LoginResponse {
  const session = createMockSession({ tenant, user, roles });
  const tokenSeed = `${input.tenantSlug}:${input.email}`.toLowerCase();

  return {
    session,
    accessToken: `mock_access_${tokenSeed}`,
    refreshToken: `mock_refresh_${tokenSeed}`
  };
}
