import type { ErpConnection, ErpEntityType, ErpMapping, ErpSyncDirection, ErpSyncLog, IntegrationHealthSummary } from "@hallederiz/types";

export function summarizeErpConnection(connection: ErpConnection): string {
  const type = connection.type === "api" ? "API" : "Excel";
  const mode = connection.mode === "bidirectional" ? "cift yonlu" : connection.mode === "import_only" ? "sadece import" : "sadece export";
  return `${connection.name} ${type} baglantisi ${mode} modda calisiyor.`;
}

export function extractErpEntityList(mappings: ErpMapping[]): ErpEntityType[] {
  return Array.from(new Set(mappings.filter((mapping) => mapping.active).map((mapping) => mapping.entityType)));
}

export function buildErpSyncPreview({ connection, mappings, direction }: { connection: ErpConnection; mappings: ErpMapping[]; direction: ErpSyncDirection }) {
  const entities = extractErpEntityList(mappings.filter((mapping) => mapping.connectionId === connection.id));
  return { connectionId: connection.id, connectionName: connection.name, direction, entityCount: entities.length, entities, safeToRun: connection.active && connection.status !== "error" };
}

export function buildIntegrationHealthSummary(connections: Array<Pick<ErpConnection, "status" | "active" | "lastSyncedAt">>): IntegrationHealthSummary {
  const activeConnections = connections.filter((connection) => connection.active);
  const errorCount = activeConnections.filter((connection) => connection.status === "error").length;
  const warningCount = activeConnections.filter((connection) => connection.status === "warning").length;
  const lastSyncedAt = activeConnections.map((connection) => connection.lastSyncedAt).filter(Boolean).sort().at(-1);
  return { status: errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "healthy", activeConnectionCount: activeConnections.length, warningCount, errorCount, lastSyncedAt, message: errorCount > 0 ? "Mudahale gerektiren entegrasyon hatasi var." : warningCount > 0 ? "Bazi senkronlar stale durumda." : "Entegrasyon sagligi normal." };
}

export function buildErpSyncLog(input: Omit<ErpSyncLog, "id" | "startedAt">): ErpSyncLog {
  return { ...input, id: `erp_log_${Date.now()}`, startedAt: new Date().toISOString() };
}
