import type { ErpConnection, ErpMapping, ErpSyncLog } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export type ErpTemplateItem = {
  key: string;
  title: string;
  entityType: string;
  lastUsedAt?: string;
};

export type ErpSyncResult = {
  connection: ErpConnection;
  log?: ErpSyncLog;
  provider?: string;
  preview?: {
    direction: string;
    entityType: string;
    fields: string[];
  };
  warning?: string;
};

export class ErpClient {
  constructor(private readonly api: ApiClient) {}

  getChannelHealth() {
    return this.api.get<
      ItemResponse<{
        service: "erp";
        status: string;
        mode: string;
        configured: boolean;
        reason: string;
        lastCheckedAt?: string;
        details?: Record<string, unknown>;
      }>
    >("/health/erp");
  }

  testChannelHealth(connectionId?: string) {
    return this.api.post<
      ItemResponse<{
        ok: boolean;
        mode: string;
        reason: string;
        lastCheckedAt?: string;
        details?: ErpConnection;
      }>
    >("/health/erp/test", connectionId ? { connectionId } : {});
  }

  listConnections() {
    return this.api.get<ListResponse<ErpConnection>>("/erp/connections");
  }

  getConnection(id: string) {
    return this.api.get<ItemResponse<ErpConnection>>(`/erp/connections/${id}`);
  }

  testConnection(id: string) {
    return this.api.post<ItemResponse<ErpConnection>>(`/erp/connections/${id}/test`, {});
  }

  syncConnection(id: string) {
    return this.api.post<ItemResponse<ErpSyncResult>>(`/erp/connections/${id}/sync`, {});
  }

  listMappings() {
    return this.api.get<ListResponse<ErpMapping>>("/erp/mappings");
  }

  listLogs() {
    return this.api.get<ListResponse<ErpSyncLog>>("/erp/logs");
  }

  listTemplates() {
    return this.api.get<ListResponse<ErpTemplateItem>>("/erp/templates");
  }
}
