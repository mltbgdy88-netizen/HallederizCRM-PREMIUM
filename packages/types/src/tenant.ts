import type { TenantId } from "./identifiers";

export type TenantStatus = "active" | "suspended" | "archived";
export type TenantModuleCode =
  | "core"
  | "users"
  | "settings"
  | "whatsapp"
  | "ai"
  | "erp"
  | "reporting";

export interface TenantModule {
  code: TenantModuleCode;
  enabled: boolean;
  configured: boolean;
  label: string;
}

export interface Tenant {
  id: TenantId;
  slug: string;
  name: string;
  status: TenantStatus;
  locale: string;
  timeZone: string;
  modules: TenantModule[];
  createdAt: string;
  updatedAt: string;
}

export interface TenantContext {
  tenantId: TenantId;
  locale: string;
  timeZone: string;
}
