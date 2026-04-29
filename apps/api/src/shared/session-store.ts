import type { LoginInput, LoginResponse, Permission, SessionModel } from "@hallederiz/types";
import { createLoginPayload, mockRoles, mockTenant, mockUsers } from "../platform-core/mock-data";
import { assertDemoAuthAllowed } from "./auth-mode";

const sessionByToken = new Map<string, LoginResponse>();

const demoBusinessReadPermissions = [
  "customers.read",
  "products.read",
  "offers.read",
  "orders.read",
  "payments.read",
  "warehouse.read",
  "deliveries.read",
  "invoices.read",
  "returns.read",
  "documents.read",
  "approvals.read",
  "tasks.read",
  "workflow.read",
  "integrations.read",
  "local_output.read"
];

const demoBusinessWritePermissions = [
  "customers.write",
  "products.write",
  "offers.write",
  "orders.write",
  "payments.write",
  "warehouse.write",
  "deliveries.write",
  "invoices.write",
  "returns.write",
  "tasks.write",
  "workflow.write",
  "approvals.write",
  "ai.actions.write",
  "documents.write",
  "documents.render",
  "local_output.write",
  "pricing.write",
  "integrations.write",
  "erp.write",
  "factory.write",
  "whatsapp.write",
  "orders.confirm",
  "orders.plan_sourcing",
  "orders.cancel",
  "warehouse.assign",
  "warehouse.execute",
  "warehouse.cancel",
  "payments.confirm",
  "payments.reverse",
  "deliveries.validate",
  "deliveries.complete",
  "deliveries.rollback",
  "invoices.issue",
  "invoices.cancel",
  "returns.approve",
  "returns.receive",
  "returns.complete",
  "returns.cancel",
  "approvals.approve",
  "approvals.execute"
];

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
  const rolePermissions = resolvedRoles.flatMap((role) => role.permissions);
  const extraPermissionKeys = input.email.includes("operator")
    ? demoBusinessReadPermissions
    : [...demoBusinessReadPermissions, ...demoBusinessWritePermissions];
  const extraPermissions: Permission[] = extraPermissionKeys.map((key) => ({
    id: `demo_${key.replaceAll(".", "_")}`,
    key,
    name: key,
    moduleCode: "core"
  }));
  const response: LoginResponse = {
    ...payload,
    session: {
      ...payload.session,
      tenant: mockTenant,
      user: user ?? payload.session.user,
      roles: resolvedRoles as SessionModel["roles"],
      permissions: [...rolePermissions, ...extraPermissions]
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
