import type { AuditInfo, TenantId } from "@hallederiz/types";

export type LeadStatus = "new" | "qualified" | "proposal" | "won" | "lost";

export interface Lead extends AuditInfo {
  id: string;
  tenantId: TenantId;
  customerName: string;
  status: LeadStatus;
}
