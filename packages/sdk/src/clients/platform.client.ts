import type { PlatformSettings, RolePresetItem, User } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class PlatformClient {
  constructor(private readonly api: ApiClient) {}

  getSettings() {
    return this.api.get<{ schema: unknown; data: PlatformSettings }>("/settings");
  }

  patchSettings(payload: Partial<PlatformSettings>) {
    return this.api.patch<ItemResponse<PlatformSettings>>("/settings", payload);
  }

  getPilotTemplate() {
    return this.api.get<{
      tenantId: string;
      template: {
        key: string;
        importPlaceholdersKey: string;
        companyFields: string[];
        importModules: string[];
        integrationChecks: string[];
      };
    }>("/settings/pilot-template");
  }

  getPilotReadiness() {
    return this.api.get<{
      item: {
        completionRate: number;
        completed: number;
        warning: number;
        missing: number;
        total: number;
        blockers: string[];
        items: Array<{
          id: string;
          title: string;
          group:
            | "company_tenant"
            | "pricing_category_currency"
            | "warehouses_stock"
            | "users_roles"
            | "data_import"
            | "documents_print"
            | "integrations"
            | "ai_operations";
          status: "tamam" | "eksik" | "uyari";
          priority: "critical" | "warning" | "ready" | "info";
          readinessState: "demo_gap" | "go_live_blocker" | "warning" | "ready";
          description: string;
          reason: string;
          actionLabel: string;
          actionHref: string;
          recommendedNextStep: string;
          blocking: boolean;
        }>;
        onboardingCards: Array<{
          roleCode: "yonetici" | "satis" | "muhasebe" | "depo" | "pazarlama";
          roleName: string;
          summary: string;
          mustCheck: string[];
          firstScreens: Array<{ label: string; href: string }>;
          ownGaps: string[];
        }>;
        integrationHealth: {
          status: "healthy" | "degraded" | "fallback" | "disabled" | "misconfigured" | "error";
          configuredCount: number;
          liveCount: number;
          fallbackCount: number;
          disabledCount: number;
          lastCheckedAt: string;
          services: Array<{
            service: string;
            status: "healthy" | "degraded" | "fallback" | "disabled" | "misconfigured" | "error";
            mode: "live" | "fallback" | "disabled" | "mock";
            configured: boolean;
            reason: string;
            lastCheckedAt: string;
            details: Record<string, unknown>;
          }>;
        };
        consistencyWarnings: string[];
        generatedAt: string;
      };
    }>("/settings/pilot-readiness");
  }

  listUsers() {
    return this.api.get<ListResponse<User>>("/users");
  }

  createUser(payload: Partial<User> & { roleCode?: string }) {
    return this.api.post<ItemResponse<User>>("/users", payload);
  }

  listRolePresets() {
    return this.api.get<ListResponse<RolePresetItem>>("/roles/presets");
  }
}
