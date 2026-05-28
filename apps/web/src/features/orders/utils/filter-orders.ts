import type { Customer, SaleOrder } from "@hallederiz/types";
import type { OrderFilters } from "../schemas/order-filter-schema";

export function filterOrders(orders: SaleOrder[], customers: Customer[], filters: OrderFilters): SaleOrder[] {
  return orders.filter((order) => {
    const customer = customers.find((item) => item.id === order.customerId);
    const searchText = `${order.orderNo} ${customer?.name ?? ""}`.toLocaleLowerCase("tr-TR");
    const matchesCustomer = filters.customer ? searchText.includes(filters.customer.toLocaleLowerCase("tr-TR")) : true;
    const matchesStatus = filters.status === "all" || order.status === filters.status;
    const matchesPayment = filters.paymentStatus === "all" || order.paymentStatus === filters.paymentStatus;
    const matchesDelivery = filters.deliveryStatus === "all" || order.deliveryStatus === filters.deliveryStatus;
    const matchesChannel = filters.channel === "all" || order.channel === filters.channel;
    const matchesSource =
      filters.sourceType === "all" || order.lines.some((line) => line.sourcePreference === filters.sourceType);
    const matchesOpenOps =
      !filters.openOperationsOnly ||
      order.paymentStatus !== "paid" ||
      order.deliveryStatus !== "delivered" ||
      order.sourcePlans.some((plan) => plan.status === "needs_factory_order");

    return matchesCustomer && matchesStatus && matchesPayment && matchesDelivery && matchesChannel && matchesSource && matchesOpenOps;
  });
}
