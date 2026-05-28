import type { QueryExecutor } from "../types";

export interface CommercialLineRecord {
  id: string;
  tenantId: string;
  description: string;
  quantity: number;
  status?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface LineRow {
  [key: string]: unknown;
  id: string;
  tenant_id: string;
  description: string;
  quantity: string;
  status?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapLine(row: LineRow): CommercialLineRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    description: row.description,
    quantity: Number(row.quantity),
    status: typeof row.status === "string" ? row.status : undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseCommercialLineRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async listDeliveryLines(tenantId: string, deliveryId: string): Promise<CommercialLineRecord[]> {
    const rows = await this.executor.query<LineRow>(
      `SELECT id, tenant_id, description, quantity, status, metadata, created_at, updated_at
       FROM delivery_lines WHERE tenant_id = $1 AND delivery_id = $2 ORDER BY created_at ASC`,
      [tenantId, deliveryId]
    );
    return rows.map(mapLine);
  }

  async listInvoiceLines(tenantId: string, invoiceId: string): Promise<CommercialLineRecord[]> {
    const rows = await this.executor.query<LineRow>(
      `SELECT id, tenant_id, description, quantity, metadata, created_at, updated_at
       FROM invoice_lines WHERE tenant_id = $1 AND invoice_id = $2 ORDER BY created_at ASC`,
      [tenantId, invoiceId]
    );
    return rows.map((row) => mapLine({ ...row, status: undefined }));
  }

  async listReturnLines(tenantId: string, returnId: string): Promise<CommercialLineRecord[]> {
    const rows = await this.executor.query<LineRow>(
      `SELECT id, tenant_id, description, quantity, status, metadata, created_at, updated_at
       FROM return_lines WHERE tenant_id = $1 AND return_id = $2 ORDER BY created_at ASC`,
      [tenantId, returnId]
    );
    return rows.map(mapLine);
  }
}
