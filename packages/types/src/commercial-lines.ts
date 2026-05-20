import type { TenantId } from "./identifiers";

/** UI-safe timeline row for entity detail panels. */
export interface EntityTimelineItem {
  id: string;
  title: string;
  description: string;
  actorLabel: string;
  createdAt: string;
  eventType: string;
  actionKey?: string;
}

/** Foundation record shape for payment reversals (API/SDK future). */
export interface PaymentReversalLineRecord {
  id: string;
  tenantId: TenantId;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}
