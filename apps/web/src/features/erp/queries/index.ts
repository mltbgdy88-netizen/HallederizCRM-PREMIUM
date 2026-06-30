import type { ErpConnection, ErpMapping, ErpSyncLog, IntegrationHealthSummary } from "@hallederiz/types";
import { buildErpSyncPreview, buildIntegrationHealthSummary } from "@hallederiz/domain";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getErpIntegrationData as getDemoErpIntegrationData } from "./erp-mock-data";

export type ErpTemplateItem = {
  key: string;
  title: string;
  entityType: string;
  lastUsedAt?: string;
};

export interface ErpIntegrationData {
  connections: ErpConnection[];
  mappings: ErpMapping[];
  logs: ErpSyncLog[];
  templates: ErpTemplateItem[];
  health: IntegrationHealthSummary;
  previews: ReturnType<typeof buildErpSyncPreview>[];
}

export async function getErpIntegrationData(): Promise<ErpIntegrationData> {
  if (dataSourceConfig.useDemoData) {
    return getDemoErpIntegrationData();
  }

  const [connectionsResponse, mappingsResponse, logsResponse, templatesResponse] = await Promise.all([
    sdk.erp.listConnections(),
    sdk.erp.listMappings(),
    sdk.erp.listLogs(),
    sdk.erp.listTemplates()
  ]);

  const connections = connectionsResponse.items ?? [];
  const mappings = mappingsResponse.items ?? [];
  const logs = logsResponse.items ?? [];
  const templates = templatesResponse.items ?? [];
  const health = buildIntegrationHealthSummary(connections);
  const previews = connections.map((connection) =>
    buildErpSyncPreview({
      connection,
      mappings,
      direction: connection.mode === "import_only" ? "import" : "export"
    })
  );

  return { connections, mappings, logs, templates, health, previews };
}

export { getDemoErpIntegrationData };
