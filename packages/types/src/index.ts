export type TenantId = string;
export type UserId = string;

export interface TenantContext {
  tenantId: TenantId;
  locale: string;
  timeZone: string;
}

export interface AuditInfo {
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
}
