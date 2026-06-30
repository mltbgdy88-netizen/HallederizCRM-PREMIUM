import type { FactoryOrder, IntegrationLog } from "@hallederiz/types";

export function sortFactoryIntegrationLogsDesc(logs: IntegrationLog[]): IntegrationLog[] {
  return [...logs].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export function logsForFactoryOrderRecord(
  logs: IntegrationLog[],
  order: Pick<FactoryOrder, "id" | "factoryOrderNo"> | null | undefined
): IntegrationLog[] {
  if (!order) {
    return [];
  }
  return sortFactoryIntegrationLogsDesc(
    logs.filter((log) => log.entityId === order.id || log.entityId === order.factoryOrderNo)
  );
}

export function latestFactoryOrderLog(
  logs: IntegrationLog[],
  order: Pick<FactoryOrder, "id" | "factoryOrderNo"> | null | undefined
): IntegrationLog | null {
  return logsForFactoryOrderRecord(logs, order)[0] ?? null;
}
