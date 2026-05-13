import type { PlatformSettings, RolePresetItem, User } from "@hallederiz/types";
import { sdk } from "../../lib/data-source";

export interface PilotReadinessItem {
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
}

export interface PilotOnboardingCard {
  roleCode: "yonetici" | "satis" | "muhasebe" | "depo" | "pazarlama";
  roleName: string;
  summary: string;
  mustCheck: string[];
  firstScreens: Array<{ label: string; href: string }>;
  ownGaps: string[];
}

export interface PilotReadinessSummary {
  completionRate: number;
  completed: number;
  warning: number;
  missing: number;
  total: number;
  blockers: string[];
  items: PilotReadinessItem[];
  onboardingCards: PilotOnboardingCard[];
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
}

export interface ProductionReadinessSummary {
  ok: boolean;
  tenantId: string;
  overallStatus: "ready" | "degraded" | "blocked";
  blockers: string[];
  warnings: string[];
  requiredEnv: string[];
  missingEnv: string[];
  unsafeFallbacks: string[];
  nextActions: string[];
  environment: {
    nodeEnv: string;
    isProduction: boolean;
    persistenceMode: string;
  };
  persistence: {
    mode: string;
    databaseConfigured: boolean;
  };
  auth: {
    sessionSecretConfigured: boolean;
    demoAuthEnabled: boolean;
    headerFallbackEnabled: boolean;
  };
  database: {
    configured: boolean;
    urlSource: "POSTGRES_URL" | "DATABASE_URL" | "missing";
  };
  approvalExecution: {
    mode: string;
    pendingApprovalPersistenceMode: string;
    ready: boolean;
  };
  workerOutbox: {
    workerMode: string;
    ready: boolean;
  };
  tenantUsage: {
    persistenceMode: string;
    ready: boolean;
  };
  omnichannel: {
    persistenceMode: string;
    ready: boolean;
    providerModes: Array<{ kind: string; mode: string; ok: boolean }>;
  };
  whatsapp: {
    liveEnvConfigured: boolean;
  };
  localAi: {
    configured: boolean;
  };
  localAgent: {
    configured: boolean;
  };
  documentGeneration: {
    localOutputConfigured: boolean;
  };
  billingUsage: {
    dbBacked: boolean;
  };
}

export async function getPlatformSettingsApi(): Promise<PlatformSettings> {
  const response = await sdk.platform.getSettings();
  return response.data;
}

export async function patchPlatformSettingsApi(payload: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const response = await sdk.platform.patchSettings(payload);
  return response.item;
}

export async function getPilotTemplateApi() {
  return sdk.platform.getPilotTemplate();
}

export async function getPilotReadinessApi(): Promise<PilotReadinessSummary> {
  const response = await sdk.platform.getPilotReadiness();
  return response.item;
}

export async function listUsersApi(): Promise<User[]> {
  const response = await sdk.platform.listUsers();
  return response.items;
}

export async function createUserApi(payload: Partial<User> & { roleCode?: string }): Promise<User> {
  const response = await sdk.platform.createUser(payload);
  return response.item;
}

export async function listRolePresetsApi(): Promise<RolePresetItem[]> {
  const response = await sdk.platform.listRolePresets();
  return response.items;
}

export async function getProductionReadinessApi(): Promise<ProductionReadinessSummary> {
  return sdk.platform.getProductionReadiness();
}
