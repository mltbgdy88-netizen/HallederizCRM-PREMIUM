import { assertAnyPermission, assertAuthenticated } from "./auth-guards";
import type { RequestContext } from "./request-context";

export function requireReadAccess(permissions: readonly string[]) {
  return [
    assertAuthenticated,
    (context: RequestContext) => assertAnyPermission(context, permissions)
  ];
}

export const readPermissions = {
  customers: ["customers.read", "customers.write", "customers.manage"],
  products: ["products.read", "products.write", "products.manage"],
  pricing: ["products.read", "products.write", "pricing.write", "pricing.manage"],
  offers: ["offers.read", "offers.write", "offers.manage"],
  orders: ["orders.read", "orders.write", "orders.manage"],
  payments: ["payments.read", "payments.write", "payments.manage"],
  warehouse: ["warehouse.read", "warehouse.write", "warehouse.manage"],
  deliveries: ["deliveries.read", "deliveries.write", "deliveries.manage"],
  invoices: ["invoices.read", "invoices.write", "documents.write"],
  returns: ["returns.read", "returns.write", "returns.manage"],
  documents: ["documents.read", "documents.write", "documents.render"],
  approvals: ["approvals.read", "approvals.write", "approvals.manage"],
  tasks: ["tasks.read", "tasks.write", "workflow.read", "workflow.write"],
  workflow: ["workflow.read", "workflow.write", "orders.read", "orders.write"],
  integrations: ["integrations.read", "integrations.write"],
  localOutput: ["local_output.read", "local_output.write", "documents.read", "documents.write"],
  users: ["platform.users.read", "platform.users.write", "users.manage"],
  roles: ["platform.roles.read", "platform.users.read", "users.manage"],
  settings: ["platform.settings.read", "platform.settings.write", "settings.manage"]
} as const;
