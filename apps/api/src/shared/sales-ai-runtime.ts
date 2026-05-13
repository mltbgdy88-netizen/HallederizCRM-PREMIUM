import type { SalesAiTrainingScope } from "@hallederiz/ai-contracts";
import { createQueryExecutor, createDatabaseSalesAiKnowledgeRepository } from "@hallederiz/database";
import type { RequestContext } from "./request-context";

export type SalesAiKnowledgePersistenceMode = "memory" | "postgres" | "unsupported";

export interface SalesAiKnowledgeRepository {
  listByTenant(tenantId: string): Promise<SalesAiTrainingScope[]>;
  getById(tenantId: string, id: string): Promise<SalesAiTrainingScope | undefined>;
  create(item: Omit<SalesAiTrainingScope, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<SalesAiTrainingScope>;
  patch(
    tenantId: string,
    id: string,
    patch: Partial<Omit<SalesAiTrainingScope, "id" | "tenantId" | "createdAt" | "updatedAt">>
  ): Promise<SalesAiTrainingScope | undefined>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export interface SalesAiKnowledgeResolution {
  repository: SalesAiKnowledgeRepository | null;
  mode: SalesAiKnowledgePersistenceMode;
  skipped: boolean;
  reasons: string[];
}

function toScope(record: {
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
}): SalesAiTrainingScope {
  return {
    id: record.id,
    tenantId: record.tenantId,
    productId: record.productId,
    productName: record.productName,
    category: record.category,
    description: record.description,
    salesNotes: record.salesNotes,
    allowedClaims: record.allowedClaims,
    blockedClaims: record.blockedClaims,
    priceVisibility: record.priceVisibility,
    stockVisibility: record.stockVisibility,
    faqSnippets: record.faqSnippets,
    selectedDocuments: record.selectedDocuments,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

class InMemorySalesAiKnowledgeRepository implements SalesAiKnowledgeRepository {
  private readonly store = new Map<string, SalesAiTrainingScope[]>();

  async listByTenant(tenantId: string): Promise<SalesAiTrainingScope[]> {
    return [...(this.store.get(tenantId) ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getById(tenantId: string, id: string): Promise<SalesAiTrainingScope | undefined> {
    return (this.store.get(tenantId) ?? []).find((item) => item.id === id);
  }

  async create(item: Omit<SalesAiTrainingScope, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<SalesAiTrainingScope> {
    const now = new Date().toISOString();
    const saved: SalesAiTrainingScope = {
      ...item,
      id: item.id ?? `sales_kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    const current = this.store.get(item.tenantId) ?? [];
    current.unshift(saved);
    this.store.set(item.tenantId, current);
    return saved;
  }

  async patch(
    tenantId: string,
    id: string,
    patch: Partial<Omit<SalesAiTrainingScope, "id" | "tenantId" | "createdAt" | "updatedAt">>
  ): Promise<SalesAiTrainingScope | undefined> {
    const current = this.store.get(tenantId) ?? [];
    const index = current.findIndex((item) => item.id === id);
    if (index < 0) return undefined;
    const existing = current[index];
    if (!existing) return undefined;
    const merged: SalesAiTrainingScope = {
      ...existing,
      id,
      tenantId,
      productName: patch.productName ?? existing.productName,
      productId: patch.productId ?? existing.productId,
      category: patch.category ?? existing.category,
      description: patch.description ?? existing.description,
      salesNotes: patch.salesNotes ?? existing.salesNotes,
      allowedClaims: patch.allowedClaims ?? existing.allowedClaims,
      blockedClaims: patch.blockedClaims ?? existing.blockedClaims,
      priceVisibility: patch.priceVisibility ?? existing.priceVisibility,
      stockVisibility: patch.stockVisibility ?? existing.stockVisibility,
      faqSnippets: patch.faqSnippets ?? existing.faqSnippets,
      selectedDocuments: patch.selectedDocuments ?? existing.selectedDocuments,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    current[index] = merged;
    this.store.set(tenantId, current);
    return merged;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const current = this.store.get(tenantId) ?? [];
    const next = current.filter((item) => item.id !== id);
    this.store.set(tenantId, next);
    return next.length !== current.length;
  }

  reset() {
    this.store.clear();
  }
}

let cachedPostgresUrl: string | null = null;
let cachedPostgresRepository: SalesAiKnowledgeRepository | null = null;
const inMemoryRepository = new InMemorySalesAiKnowledgeRepository();

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function resolveSalesAiKnowledgeRepository(context: RequestContext): SalesAiKnowledgeResolution {
  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (context.persistenceMode === "postgres") {
    if (!postgresUrl) {
      return {
        repository: null,
        mode: "unsupported",
        skipped: true,
        reasons: ["sales_ai_postgres_url_missing"]
      };
    }
    if (!cachedPostgresRepository || cachedPostgresUrl !== postgresUrl) {
      const dbRepository = createDatabaseSalesAiKnowledgeRepository({
        executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
        persistenceMode: "postgres"
      });
      cachedPostgresRepository = {
        listByTenant: async (tenantId) => (await dbRepository.listByTenant(tenantId)).map((item) => toScope(item)),
        getById: async (tenantId, id) => {
          const item = await dbRepository.getById(tenantId, id);
          return item ? toScope(item) : undefined;
        },
        create: async (item) =>
          toScope(
            await dbRepository.create({
              id: item.id ?? `sales_kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              tenantId: item.tenantId,
              productId: item.productId,
              productName: item.productName,
              category: item.category,
              description: item.description,
              salesNotes: item.salesNotes,
              allowedClaims: item.allowedClaims,
              blockedClaims: item.blockedClaims,
              priceVisibility: item.priceVisibility,
              stockVisibility: item.stockVisibility,
              faqSnippets: item.faqSnippets,
              selectedDocuments: item.selectedDocuments,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          ),
        patch: async (tenantId, id, patch) => {
          const updated = await dbRepository.patch(tenantId, id, patch);
          return updated ? toScope(updated) : undefined;
        },
        delete: (tenantId, id) => dbRepository.delete(tenantId, id)
      };
      cachedPostgresUrl = postgresUrl;
    }
    return {
      repository: cachedPostgresRepository,
      mode: "postgres",
      skipped: false,
      reasons: []
    };
  }

  if (isProductionEnvironment()) {
    return {
      repository: null,
      mode: "unsupported",
      skipped: true,
      reasons: ["sales_ai_memory_fallback_forbidden_in_production"]
    };
  }

  return {
    repository: inMemoryRepository,
    mode: "memory",
    skipped: false,
    reasons: []
  };
}

export function resetSalesAiRuntimeForTests() {
  inMemoryRepository.reset();
  cachedPostgresRepository = null;
  cachedPostgresUrl = null;
}
