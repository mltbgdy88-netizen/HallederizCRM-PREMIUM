import type { LoginInput, LoginResponse, SessionModel } from "@hallederiz/types";
import { createLoginPayload, mockRoles, mockTenant, mockUsers } from "../platform-core/mock-data";
import { assertDemoAuthAllowed } from "./auth-mode";

const sessionByToken = new Map<string, LoginResponse>();

function getUserByEmail(email: string) {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? mockUsers[0];
}

export function createSession(input: LoginInput): LoginResponse {
  assertDemoAuthAllowed();
  const payload = createLoginPayload(input);
  const user = getUserByEmail(input.email);
  const resolvedRoles = (input.email.includes("operator") ? [mockRoles[1] ?? mockRoles[0]] : [mockRoles[0]]).filter(
    (role): role is NonNullable<typeof role> => Boolean(role)
  );
  const response: LoginResponse = {
    ...payload,
    session: {
      ...payload.session,
      tenant: mockTenant,
      user: user ?? payload.session.user,
      roles: resolvedRoles as SessionModel["roles"],
      permissions: resolvedRoles.flatMap((role) => role.permissions)
    }
  };
  sessionByToken.set(response.accessToken, response);
  return response;
}

export function getSessionByToken(token?: string): SessionModel | null {
  if (!token) return null;
  const session = sessionByToken.get(token)?.session;
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;
  return session;
}
