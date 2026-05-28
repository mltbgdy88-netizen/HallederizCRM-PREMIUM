import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbSalesAiKnowledgeRecord {
  id: string;
  tenantId: string;
  productId?: string;
  productName: string;
  category?: string;
  description?: string;
  salesNotes?: string;
  allowedClaims: string[];
  blockedClaims: string[];
  priceVisibility: "visible" | "hidden";
  stockVisibility: "visible" | "hidden";
  faqSnippets: string[];
  selectedDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

interface SalesAiKnowledgeRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  product_id: string | null;
  product_name: string;
  category: string | null;
  description: string | null;
  sales_notes: string | null;
  allowed_claims: unknown;
  blocked_claims: unknown;
  price_visibility: "visible" | "hidden";
  stock_visibility: "visible" | "hidden";
  faq_snippets: unknown;
  selected_documents: unknown;
  created_at: string;
  updated_at: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function assertNonEmpty(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: SalesAiKnowledgeRow): DbSalesAiKnowledgeRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    productId: row.product_id ?? undefined,
    productName: row.product_name,
    category: row.category ?? undefined,
    description: row.description ?? undefined,
    salesNotes: row.sales_notes ?? undefined,
    allowedClaims: parseStringArray(row.allowed_claims),
    blockedClaims: parseStringArray(row.blocked_claims),
    priceVisibility: row.price_visibility,
    stockVisibility: row.stock_visibility,
    faqSnippets: parseStringArray(row.faq_snippets),
    selectedDocuments: parseStringArray(row.selected_documents),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toParams(record: DbSalesAiKnowledgeRecord): unknown[] {
  assertNonEmpty(record.id, "id");
  assertNonEmpty(record.tenantId, "tenant_id");
  assertNonEmpty(record.productName, "product_name");
  return [
    record.id,
    record.tenantId,
    record.productId ?? null,
    record.productName,
    record.category ?? null,
    record.description ?? null,
    record.salesNotes ?? null,
    JSON.stringify(record.allowedClaims ?? []),
    JSON.stringify(record.blockedClaims ?? []),
    record.priceVisibility,
    record.stockVisibility,
    JSON.stringify(record.faqSnippets ?? []),
    JSON.stringify(record.selectedDocuments ?? []),
    record.createdAt,
    record.updatedAt
  ];
}

export class DatabaseSalesAiKnowledgeRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("sales_ai_knowledge_postgres_mode_required");
    }
  }

  async create(record: DbSalesAiKnowledgeRecord): Promise<DbSalesAiKnowledgeRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<SalesAiKnowledgeRow>(
      `INSERT INTO sales_ai_knowledge (
        id, tenant_id, product_id, product_name, category, description, sales_notes, allowed_claims, blocked_claims,
        price_visibility, stock_visibility, faq_snippets, selected_documents, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12::jsonb,$13::jsonb,$14::timestamptz,$15::timestamptz
      )
      RETURNING
        id, tenant_id, product_id, product_name, category, description, sales_notes, allowed_claims, blocked_claims,
        price_visibility, stock_visibility, faq_snippets, selected_documents, created_at, updated_at`,
      toParams(record)
    );
    if (!rows[0]) {
      throw new Error("sales_ai_knowledge_insert_failed");
    }
    return mapRow(rows[0]);
  }

  async listByTenant(tenantId: string): Promise<DbSalesAiKnowledgeRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    const rows = await this.executor.query<SalesAiKnowledgeRow>(
      `SELECT
        id, tenant_id, product_id, product_name, category, description, sales_notes, allowed_claims, blocked_claims,
        price_visibility, stock_visibility, faq_snippets, selected_documents, created_at, updated_at
      FROM sales_ai_knowledge
      WHERE tenant_id = $1
      ORDER BY updated_at DESC`,
      [tenantId]
    );
    return rows.map((row) => mapRow(row));
  }

  async getById(tenantId: string, id: string): Promise<DbSalesAiKnowledgeRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(id, "id");
    const rows = await this.executor.query<SalesAiKnowledgeRow>(
      `SELECT
        id, tenant_id, product_id, product_name, category, description, sales_notes, allowed_claims, blocked_claims,
        price_visibility, stock_visibility, faq_snippets, selected_documents, created_at, updated_at
      FROM sales_ai_knowledge
      WHERE tenant_id = $1 AND id = $2
      LIMIT 1`,
      [tenantId, id]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async patch(
    tenantId: string,
    id: string,
    patch: Partial<Omit<DbSalesAiKnowledgeRecord, "id" | "tenantId" | "createdAt">>
  ): Promise<DbSalesAiKnowledgeRecord | undefined> {
    this.assertPersistenceSupported();
    const current = await this.getById(tenantId, id);
    if (!current) {
      return undefined;
    }
    const merged: DbSalesAiKnowledgeRecord = {
      ...current,
      ...patch,
      id: current.id,
      tenantId: current.tenantId,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };
    const rows = await this.executor.query<SalesAiKnowledgeRow>(
      `UPDATE sales_ai_knowledge
      SET
        product_id = $3,
        product_name = $4,
        category = $5,
        description = $6,
        sales_notes = $7,
        allowed_claims = $8::jsonb,
        blocked_claims = $9::jsonb,
        price_visibility = $10,
        stock_visibility = $11,
        faq_snippets = $12::jsonb,
        selected_documents = $13::jsonb,
        updated_at = $15::timestamptz
      WHERE tenant_id = $2 AND id = $1
      RETURNING
        id, tenant_id, product_id, product_name, category, description, sales_notes, allowed_claims, blocked_claims,
        price_visibility, stock_visibility, faq_snippets, selected_documents, created_at, updated_at`,
      toParams(merged)
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(id, "id");
    const rows = await this.executor.query<{ id: string }>(
      `DELETE FROM sales_ai_knowledge
      WHERE tenant_id = $1 AND id = $2
      RETURNING id`,
      [tenantId, id]
    );
    return Boolean(rows[0]);
  }
}

export function createDatabaseSalesAiKnowledgeRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseSalesAiKnowledgeRepository(options);
}
