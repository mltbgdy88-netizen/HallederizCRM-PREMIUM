import { randomUUID } from "node:crypto";
import type { QueryExecutor } from "../types";

export type PaymentReversalStatus = "pending" | "approved" | "completed" | "cancelled";

export interface PaymentReversalRecord {
  id: string;
  tenantId: string;
  paymentId: string;
  reversalNo?: string;
  amount: number;
  currency: string;
  reason?: string;
  status: PaymentReversalStatus;
  requestedBy?: string;
  approvedBy?: string;
  approvalId?: string;
  outboxJobId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReversalInsertInput {
  tenantId: string;
  paymentId: string;
  amount: number;
  currency?: string;
  reason?: string;
  reversalNo?: string;
  requestedBy?: string;
  status?: PaymentReversalRecord["status"];
  metadata?: Record<string, unknown>;
}

interface PaymentReversalRow {
  [key: string]: unknown;
  id: string;
  tenant_id: string;
  payment_id: string;
  reversal_no: string | null;
  amount: string;
  currency: string;
  reason: string | null;
  status: PaymentReversalRecord["status"];
  requested_by: string | null;
  approved_by: string | null;
  approval_id: string | null;
  outbox_job_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapRow(row: PaymentReversalRow): PaymentReversalRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    paymentId: row.payment_id,
    reversalNo: row.reversal_no ?? undefined,
    amount: Number(row.amount),
    currency: row.currency,
    reason: row.reason ?? undefined,
    status: row.status,
    requestedBy: row.requested_by ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    approvalId: row.approval_id ?? undefined,
    outboxJobId: row.outbox_job_id ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabasePaymentReversalRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async insert(input: PaymentReversalInsertInput): Promise<PaymentReversalRecord> {
    if (!input.tenantId?.trim()) {
      throw new Error("payment_reversal_tenant_id_required");
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    await this.executor.query(
      `INSERT INTO payment_reversals (
        id, tenant_id, payment_id, reversal_no, amount, currency, reason, status,
        requested_by, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)`,
      [
        id,
        input.tenantId,
        input.paymentId,
        input.reversalNo ?? null,
        input.amount,
        input.currency ?? "TRY",
        input.reason ?? null,
        input.status ?? "pending",
        input.requestedBy ?? null,
        JSON.stringify(input.metadata ?? {}),
        now,
        now
      ]
    );
    const rows = await this.listByPayment(input.tenantId, input.paymentId);
    const created = rows.find((row) => row.id === id);
    if (!created) {
      throw new Error("payment_reversal_insert_failed");
    }
    return created;
  }

  async listByPayment(tenantId: string, paymentId: string): Promise<PaymentReversalRecord[]> {
    const rows = await this.executor.query<PaymentReversalRow>(
      `SELECT * FROM payment_reversals WHERE tenant_id = $1 AND payment_id = $2 ORDER BY created_at DESC`,
      [tenantId, paymentId]
    );
    return rows.map(mapRow);
  }
}
