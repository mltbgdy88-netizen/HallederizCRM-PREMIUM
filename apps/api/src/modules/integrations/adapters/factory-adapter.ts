import type { FactoryOrder } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import { validateFactoryConfig } from "../../../shared/service-config";
import {
  createFactoryOrder,
  getFactoryIntegrationHealth,
  getFactoryOrder,
  listFactories,
  listFactoryOrders,
  listFactoryStocks,
  syncFactoryStock,
  updateFactoryOrderStatus
} from "../../../integrations/mock-store";

export class FactoryAdapter {
  constructor(private readonly context: RequestContext) {}

  private get liveEnabled() {
    return (process.env.FACTORY_PROVIDER ?? "mock") === "live";
  }

  private get baseUrl() {
    return process.env.FACTORY_API_BASE_URL ?? "";
  }

  private get timeoutMs() {
    return Number(process.env.FACTORY_TIMEOUT_MS ?? 12000);
  }

  private buildHeaders() {
    return {
      "content-type": "application/json",
      ...(process.env.FACTORY_API_KEY ? { "x-api-key": process.env.FACTORY_API_KEY } : {})
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
        throw new Error(`Factory provider failed: ${response.status} ${reason}`);
      }
      return (await response.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timeout);
    }
  }

  listFactories() {
    return listFactories().filter((item) => item.tenantId === this.context.tenantId);
  }

  listStocks(factoryId: string) {
    return listFactoryStocks(factoryId).filter((item) => item.tenantId === this.context.tenantId);
  }

  async syncStock(factoryId: string) {
    const fallback = syncFactoryStock(factoryId);
    if (!this.liveEnabled || !this.baseUrl) return { ...fallback, provider: "mock" };
    try {
      const payload = await this.fetchLive(`/factories/${factoryId}/sync-stock`, "POST", { tenantId: this.context.tenantId });
      return { ...fallback, provider: "live", payload };
    } catch (error) {
      return { ...fallback, provider: "fallback", warning: error instanceof Error ? error.message : "Factory sync fallback" };
    }
  }

  listOrders() {
    return listFactoryOrders().filter((item) => item.tenantId === this.context.tenantId);
  }

  getOrder(id: string) {
    const order = getFactoryOrder(id);
    return order?.tenantId === this.context.tenantId ? order : null;
  }

  createOrder(payload: Partial<FactoryOrder>) {
    return createFactoryOrder(payload);
  }

  async sendOrder(id: string) {
    const fallback = updateFactoryOrderStatus(id, "sent");
    if (!fallback) return null;
    if (!this.liveEnabled || !this.baseUrl) return { ...fallback, provider: "mock" };
    try {
      const result = await this.fetchLive(`/factory-orders/${id}/send`, "POST", { tenantId: this.context.tenantId });
      return { ...fallback, provider: "live", providerResult: result };
    } catch (error) {
      return { ...fallback, provider: "fallback", warning: error instanceof Error ? error.message : "Factory send fallback" };
    }
  }

  confirmOrder(id: string) {
    return updateFactoryOrderStatus(id, "confirmed");
  }

  markShipped(id: string) {
    return updateFactoryOrderStatus(id, "shipped");
  }

  completeOrder(id: string) {
    return updateFactoryOrderStatus(id, "completed");
  }

  getHealth() {
    const fallback = getFactoryIntegrationHealth();
    const config = validateFactoryConfig();
    return {
      ...config,
      details: {
        ...config.details,
        integration: fallback,
        runtimeLiveEnabled: this.liveEnabled,
        runtimeBaseUrl: this.baseUrl
      }
    };
  }
}
