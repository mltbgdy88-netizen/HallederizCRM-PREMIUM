import type { DbOperatorTenantSummary } from "@hallederiz/database";
import { mockTenant } from "../platform-core/mock-data";
import { assertOperatorPostgresRuntime, isOperatorPostgresEnabled } from "../shared/operator-persistence-runtime";

export type OperatorTenantSummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string;
  modules: string[];
};

const DEMO_TENANTS: OperatorTenantSummary[] = [
  {
    id: mockTenant.id,
    slug: mockTenant.slug,
    name: mockTenant.name,
    status: mockTenant.status,
    planCode: "premium",
    modules: mockTenant.modules.filter((module) => module.enabled).map((module) => module.code)
  },
  {
    id: "tenant_2",
    slug: "duvar-dekor",
    name: "Duvar Dekor A.Ş.",
    status: "active",
    planCode: "core",
    modules: ["core", "users", "settings", "reporting"]
  },
  {
    id: "tenant_3",
    slug: "istanbul-wall",
    name: "İstanbul Wall Studio",
    status: "trial",
    planCode: "premium",
    modules: ["core", "users", "settings", "whatsapp", "ai"]
  }
];

function modulesForPlan(planCode: string): string[] {
  const normalized = planCode.trim().toLowerCase();
  if (normalized === "premium" || normalized === "enterprise") {
    return ["core", "users", "settings", "whatsapp", "ai", "reporting"];
  }
  return ["core", "users", "settings", "reporting"];
}

function fromDbTenant(record: DbOperatorTenantSummary): OperatorTenantSummary {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    status: record.status,
    planCode: record.planCode,
    modules: modulesForPlan(record.planCode)
  };
}

export async function listOperatorTenants(): Promise<OperatorTenantSummary[]> {
  if (!isOperatorPostgresEnabled()) {
    return DEMO_TENANTS;
  }
  const runtime = assertOperatorPostgresRuntime();
  const items = await runtime.tenants.listTenants();
  return items.map(fromDbTenant);
}

export async function resolveTenantPlanCode(tenantId: string, tenantSlug: string): Promise<string> {
  if (!isOperatorPostgresEnabled()) {
    const match = DEMO_TENANTS.find(
      (tenant) => tenant.id === tenantId || tenant.slug.toLowerCase() === tenantSlug.toLowerCase()
    );
    return match?.planCode ?? "core";
  }
  const runtime = assertOperatorPostgresRuntime();
  const byId = await runtime.tenants.findById(tenantId);
  if (byId) return byId.planCode;
  const bySlug = await runtime.tenants.findBySlug(tenantSlug);
  return bySlug?.planCode ?? "core";
}

export async function resolveTenantSlug(tenantId: string): Promise<string> {
  if (!isOperatorPostgresEnabled()) {
    const match = DEMO_TENANTS.find((tenant) => tenant.id === tenantId);
    if (match) return match.slug;
    if (tenantId === "tenant_1") return "hallederiz";
    return tenantId.replace(/^tenant_/, "");
  }
  const runtime = assertOperatorPostgresRuntime();
  const tenant = await runtime.tenants.findById(tenantId);
  if (tenant) return tenant.slug;
  if (tenantId === "tenant_1") return "hallederiz";
  return tenantId.replace(/^tenant_/, "");
}
