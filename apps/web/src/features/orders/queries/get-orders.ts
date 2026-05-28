import type { Customer, SaleOrder } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { customers } from "../../customers/queries/customer-mock-data";
import { getOrderById, getOrderMockData } from "./order-mock-data";

export interface OrdersQueryResult {
  orders: SaleOrder[];
  customers: Customer[];
}

export interface OrderDetailQueryResult extends OrdersQueryResult {
  order: SaleOrder | null;
}

export async function getOrders(): Promise<OrdersQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [ordersResponse, customersResponse] = await Promise.all([sdk.orders.list(), sdk.customers.list()]);
    return {
      orders: ordersResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    orders: await getOrderMockData(),
    customers
  };
}

export async function getOrderDetail(orderId?: string, sourceOfferId?: string | null, customerId?: string | null): Promise<OrderDetailQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [ordersResponse, customersResponse] = await Promise.all([sdk.orders.list(), sdk.customers.list()]);
    const order = orderId ? (await sdk.orders.detail(orderId)).item ?? null : await getOrderById(undefined, sourceOfferId, customerId);

    return {
      order,
      orders: ordersResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    order: await getOrderById(orderId, sourceOfferId, customerId),
    orders: await getOrderMockData(),
    customers
  };
}
