import type {
  Factory,
  FactoryIntegration,
  FactoryOrder,
  FactoryStockItem,
  IntegrationHealthSummary,
  IntegrationLog
} from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export type FactoryStockSyncResult = {
  factoryId: string;
  syncedAt?: string;
  items?: number;
  provider?: string;
  payload?: unknown;
  warning?: string;
};

export type FactoryOrderSendResult = FactoryOrder & {
  provider?: string;
  providerResult?: unknown;
  warning?: string;
};

export type FactoryIntegrationHealthPayload = {
  health: IntegrationHealthSummary;
  integrations: FactoryIntegration[];
};

export class FactoryClient {
  constructor(private readonly api: ApiClient) {}

  getChannelHealth() {
    return this.api.get<
      ItemResponse<{
        service: "factory";
        status: string;
        mode: string;
        configured: boolean;
        reason: string;
        lastCheckedAt?: string;
        details?: Record<string, unknown>;
      }>
    >("/health/factory");
  }

  testChannelSync(factoryId?: string) {
    return this.api.post<
      ItemResponse<{
        ok: boolean;
        mode: string;
        reason: string;
        lastCheckedAt?: string;
        details?: FactoryStockSyncResult;
      }>
    >("/health/factory/test-sync", factoryId ? { factoryId } : {});
  }

  getIntegrationHealth() {
    return this.api.get<ItemResponse<FactoryIntegrationHealthPayload>>("/integrations/factories/health");
  }

  listFactories() {
    return this.api.get<ListResponse<Factory>>("/factories");
  }

  listStocks(factoryId: string) {
    return this.api.get<ListResponse<FactoryStockItem>>(`/factories/${factoryId}/stocks`);
  }

  syncStock(factoryId: string) {
    return this.api.post<ItemResponse<FactoryStockSyncResult>>(`/factories/${factoryId}/sync-stock`, {});
  }

  listOrders() {
    return this.api.get<ListResponse<FactoryOrder>>("/factory-orders");
  }

  listLogs() {
    return this.api.get<ListResponse<IntegrationLog>>("/factory/logs");
  }

  getOrder(id: string) {
    return this.api.get<ItemResponse<FactoryOrder>>(`/factory-orders/${id}`);
  }

  sendOrder(id: string) {
    return this.api.post<ItemResponse<FactoryOrderSendResult>>(`/factory-orders/${id}/send`, {});
  }
}
