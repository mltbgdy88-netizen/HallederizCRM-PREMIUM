import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { customers } from "../../customers/queries/customer-mock-data";
import { getWarehouseOrderById, getWarehouseOrderMockData } from "./warehouse-mock-data";

export interface WarehouseOrdersQueryResult {
  warehouseOrders: WarehouseOrder[];
  customers: Customer[];
}

export interface WarehouseOrderDetailQueryResult extends WarehouseOrdersQueryResult {
  warehouseOrder: WarehouseOrder | null;
}

export async function getWarehouseOrders(): Promise<WarehouseOrdersQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [warehouseResponse, customersResponse] = await Promise.all([sdk.warehouse.list(), sdk.customers.list()]);
    return {
      warehouseOrders: warehouseResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    warehouseOrders: await getWarehouseOrderMockData(),
    customers
  };
}

export async function getWarehouseOrderDetail(warehouseOrderId?: string): Promise<WarehouseOrderDetailQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [warehouseResponse, customersResponse] = await Promise.all([sdk.warehouse.list(), sdk.customers.list()]);
    const warehouseOrder = warehouseOrderId ? (await sdk.warehouse.detail(warehouseOrderId)).item ?? null : null;
    return {
      warehouseOrder,
      warehouseOrders: warehouseResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    warehouseOrder: await getWarehouseOrderById(warehouseOrderId),
    warehouseOrders: await getWarehouseOrderMockData(),
    customers
  };
}
