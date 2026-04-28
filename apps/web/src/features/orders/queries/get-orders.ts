import type { Customer, SaleOrder } from "@hallederiz/types";
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
  return {
    orders: await getOrderMockData(),
    customers
  };
}

export async function getOrderDetail(orderId?: string, sourceOfferId?: string | null, customerId?: string | null): Promise<OrderDetailQueryResult> {
  return {
    order: await getOrderById(orderId, sourceOfferId, customerId),
    orders: await getOrderMockData(),
    customers
  };
}
