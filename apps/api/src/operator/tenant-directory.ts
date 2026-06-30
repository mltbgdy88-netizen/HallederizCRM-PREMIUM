import { mockTenant } from "../platform-core/mock-data";

export type OperatorTenantSummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string;
  modules: string[];
};

/** Demo tenant directory — production hedefi: platform DB + billing plan join. */
export function listOperatorTenants(): OperatorTenantSummary[] {
  return [
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
}

export function resolveTenantPlanCode(tenantId: string, tenantSlug: string): string {
  const match = listOperatorTenants().find(
    (tenant) => tenant.id === tenantId || tenant.slug.toLowerCase() === tenantSlug.toLowerCase()
  );
  return match?.planCode ?? "core";
}

export function resolveTenantSlug(tenantId: string): string {
  const match = listOperatorTenants().find((tenant) => tenant.id === tenantId);
  if (match) return match.slug;
  if (tenantId === "tenant_1") return "hallederiz";
  return tenantId.replace(/^tenant_/, "");
}
