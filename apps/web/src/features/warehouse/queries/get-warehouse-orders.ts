import type { Customer, WarehouseOrder } from "@hallederiz/types";
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
  return {
    warehouseOrders: await getWarehouseOrderMockData(),
    customers
  };
}

export async function getWarehouseOrderDetail(warehouseOrderId?: string): Promise<WarehouseOrderDetailQueryResult> {
  return {
    warehouseOrder: await getWarehouseOrderById(warehouseOrderId),
    warehouseOrders: await getWarehouseOrderMockData(),
    customers
  };
}
