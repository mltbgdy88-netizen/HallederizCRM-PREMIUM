import { buildFactoryHealthSummary } from "@hallederiz/domain";
import type {
  Factory,
  FactoryIntegration,
  FactoryOrder,
  FactoryStockItem,
  FactoryStockSnapshot,
  IntegrationHealthSummary,
  IntegrationLog
} from "@hallederiz/types";
import type { Brand } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import {
  getFactoryOrderById as getDemoFactoryOrderById,
  getFactoryOrderData as getDemoFactoryOrderData,
  getFactoryStockData as getDemoFactoryStockData
} from "./factory-mock-data";
import {
  logsForFactoryOrderRecord,
  sortFactoryIntegrationLogsDesc
} from "../utils/sort-factory-integration-logs";

export interface FactoryStockData {
  factories: Factory[];
  brands: Brand[];
  integrations: FactoryIntegration[];
  items: FactoryStockItem[];
  snapshots: FactoryStockSnapshot[];
  health: IntegrationHealthSummary;
}

function snapshotStatusForItems(items: FactoryStockItem[]): FactoryStockSnapshot["status"] {
  if (items.some((item) => item.integrationStatus === "error")) {
    return "failed";
  }
  if (items.some((item) => !item.lastSyncedAt)) {
    return "stale";
  }
  return "synced";
}

function buildSnapshotsFromItems(
  factories: Factory[],
  items: FactoryStockItem[],
  integrations: FactoryIntegration[]
): FactoryStockSnapshot[] {
  return factories.map((factory) => {
    const factoryItems = items.filter((item) => item.factoryId === factory.id);
    const integration = integrations.find((entry) => entry.factoryId === factory.id);
    return {
      id: `factory_snapshot_${factory.id}`,
      tenantId: factory.tenantId,
      factoryId: factory.id,
      integrationId: integration?.id ?? "manual",
      capturedAt:
        factoryItems
          .map((item) => item.lastSyncedAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? new Date().toISOString(),
      itemCount: factoryItems.length,
      status: snapshotStatusForItems(factoryItems),
      items: factoryItems
    };
  });
}

function logsForFactoryOrder(logs: IntegrationLog[], order: FactoryOrder | null | undefined): IntegrationLog[] {
  return logsForFactoryOrderRecord(logs, order ?? undefined);
}

async function fetchFactoryIntegrationLogs(): Promise<IntegrationLog[]> {
  if (dataSourceConfig.useDemoData) {
    const demo = await getDemoFactoryOrderData();
    return sortFactoryIntegrationLogsDesc(demo.logs);
  }
  const response = await sdk.factory.listLogs();
  return sortFactoryIntegrationLogsDesc(response.items ?? []);
}

export async function getFactoryStockData(): Promise<FactoryStockData> {
  if (dataSourceConfig.useDemoData) {
    return getDemoFactoryStockData();
  }

  const [factoriesResponse, integrationHealthResponse] = await Promise.all([
    sdk.factory.listFactories(),
    sdk.factory.getIntegrationHealth()
  ]);

  const factories = factoriesResponse.items ?? [];
  const integrations = integrationHealthResponse.item?.integrations ?? [];
  const stockResponses = await Promise.all(factories.map((factory) => sdk.factory.listStocks(factory.id)));
  const items = stockResponses.flatMap((response) => response.items ?? []);
  const snapshots = buildSnapshotsFromItems(factories, items, integrations);

  return {
    factories,
    brands: [],
    integrations,
    items,
    snapshots,
    health: buildFactoryHealthSummary(snapshots)
  };
}

export async function getFactoryOrderData(): Promise<{ orders: FactoryOrder[]; logs: IntegrationLog[] }> {
  if (dataSourceConfig.useDemoData) {
    return getDemoFactoryOrderData();
  }

  const [ordersResponse, logs] = await Promise.all([sdk.factory.listOrders(), fetchFactoryIntegrationLogs()]);
  return { orders: ordersResponse.items ?? [], logs };
}

export async function getFactoryOrderById(factoryOrderId?: string) {
  if (dataSourceConfig.useDemoData) {
    return getDemoFactoryOrderById(factoryOrderId);
  }

  const logs = await fetchFactoryIntegrationLogs();

  if (!factoryOrderId) {
    const list = await getFactoryOrderData();
    const order = list.orders[0] ?? null;
    return { order, logs: logsForFactoryOrder(logs, order) };
  }

  try {
    const response = await sdk.factory.getOrder(factoryOrderId);
    const order = response.item ?? null;
    return { order, logs: logsForFactoryOrder(logs, order) };
  } catch {
    const list = await getFactoryOrderData();
    const order =
      list.orders.find((entry) => entry.id === factoryOrderId || entry.factoryOrderNo === factoryOrderId) ?? null;
    return { order, logs: logsForFactoryOrder(logs, order) };
  }
}

export { getDemoFactoryStockData, getDemoFactoryOrderData, getDemoFactoryOrderById };
