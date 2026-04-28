import type { Customer, Delivery } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getDeliveryById, getDeliveryMockData } from "./delivery-mock-data";

export async function getDeliveries(): Promise<{ deliveries: Delivery[]; customers: Customer[] }> {
  return {
    deliveries: await getDeliveryMockData(),
    customers
  };
}

export async function getDeliveryDetail(deliveryId?: string): Promise<{ delivery: Delivery | null; deliveries: Delivery[]; customers: Customer[] }> {
  return {
    delivery: await getDeliveryById(deliveryId),
    deliveries: await getDeliveryMockData(),
    customers
  };
}
