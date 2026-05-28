import type { ErpConnection, ErpEntityType, ErpMapping } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import { validateErpConfig } from "../../../shared/service-config";
import {
  createErpConnection,
  getErpConnection,
  listErpConnections,
  listErpLogs,
  listErpMappings,
  listErpTemplates,
  patchErpConnection,
  patchErpMappings,
  syncErpConnection,
  testErpConnection
} from "../../../integrations/mock-store";

const previewByEntity: Record<ErpEntityType, string[]> = {
  customer: ["code", "name", "phone", "city"],
  product: ["code", "name", "brand", "category"],
  stock: ["productCode", "warehouse", "quantity"],
  price: ["productCode", "slot", "price", "currency"],
  payment: ["receiptNo", "customer", "amount", "method"],
  invoice: ["invoiceNo", "customer", "total", "status"],
  order: ["orderNo", "customer", "total", "deliveryType"],
  return: ["returnNo", "customer", "reason", "status"]
};

export class ErpAdapter {
  constructor(private readonly context: RequestContext) {}

  private get liveEnabled() {
    return (process.env.ERP_PROVIDER ?? "mock") === "live";
  }

  private get baseUrl() {
    return process.env.ERP_API_BASE_URL ?? "";
  }

  private get timeoutMs() {
    return Number(process.env.ERP_TIMEOUT_MS ?? 12000);
  }

  private buildHeaders() {
    return {
      "content-type": "application/json",
      ...(process.env.ERP_API_KEY ? { "x-api-key": process.env.ERP_API_KEY } : {}),
      ...(process.env.ERP_USERNAME ? { "x-erp-user": process.env.ERP_USERNAME } : {}),
      ...(process.env.ERP_PASSWORD ? { "x-erp-pass": process.env.ERP_PASSWORD } : {})
    };
  }

  private async fetchLive(path: string, method: "GET" | "POST", body?: unknown) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
        method,
        headers: this.buildHeaders(),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        const reason = await response.text();
        throw new Error(`ERP provider failed: ${response.status} ${reason}`);
      }
      return (await response.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }
  }

  listConnections() {
    return listErpConnections().filter((item) => item.tenantId === this.context.tenantId);
  }

  getConnection(id: string) {
    const item = getErpConnection(id);
    return item?.tenantId === this.context.tenantId ? item : null;
  }

  createConnection(payload: Partial<ErpConnection>) {
    return createErpConnection(payload);
  }

  patchConnection(id: string, payload: Partial<ErpConnection>) {
    return patchErpConnection(id, payload);
  }

  async testConnection(id: string) {
    const base = testErpConnection(id);
    if (!base) return null;
    if (!this.liveEnabled || !this.baseUrl) return { ...base, provider: "mock" };

    try {
      const health = await this.fetchLive("/health", "GET");
      return {
        ...base,
        provider: "live",
        lastTestResult: "success",
        checkedAt: new Date().toISOString(),
        health
      };
    } catch (error) {
      return {
        ...base,
        provider: "fallback",
        lastTestResult: "failed",
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "ERP test failed"
      };
    }
  }

  async syncConnection(id: string) {
    const result = syncErpConnection(id);
    if (!result) return null;

    if (this.liveEnabled && this.baseUrl) {
      try {
        const providerResponse = await this.fetchLive("/sync", "POST", {
          connectionId: id,
          tenantId: this.context.tenantId
        });
        const entityType = (providerResponse.entityType as ErpEntityType) ?? (result.log?.entityType ?? "customer");
        const direction = (providerResponse.direction as "import" | "export") ?? (result.log?.direction ?? "import");
        return {
          ...result,
          provider: "live",
          providerResponse,
          preview: {
            direction,
            entityType,
            fields: previewByEntity[entityType]
          }
        };
      } catch (error) {
        return {
          ...result,
          provider: "fallback",
          warning: error instanceof Error ? error.message : "ERP sync fallback",
          preview: {
            direction: result.log?.direction ?? "import",
            entityType: result.log?.entityType ?? "customer",
            fields: previewByEntity[result.log?.entityType ?? "customer"]
          }
        };
      }
    }

    const entityType = result.log?.entityType ?? "customer";
    const direction = result.log?.direction ?? "import";
    return {
      ...result,
      provider: "mock",
      preview: {
        direction,
        entityType,
        fields: previewByEntity[entityType]
      }
    };
  }

  listMappings() {
    return listErpMappings().filter((item) => item.tenantId === this.context.tenantId);
  }

  patchMappings(payload: ErpMapping[]) {
    return patchErpMappings(payload);
  }

  listLogs() {
    return listErpLogs().filter((item) => item.tenantId === this.context.tenantId);
  }

  listTemplates() {
    return listErpTemplates();
  }

  getHealth() {
    const config = validateErpConfig();
    return {
      ...config,
      details: {
        ...config.details,
        runtimeLiveEnabled: this.liveEnabled,
        runtimeBaseUrl: this.baseUrl
      }
    };
  }
}
