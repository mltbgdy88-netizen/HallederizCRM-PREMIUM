import type { Customer, Delivery, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { buildDeliveryLines } from "./build-delivery-lines";
import { validateDeliveryCustomerLink } from "./validate-delivery-customer-link";
import { validateDeliveryPaymentRule, type DeliveryPaymentPolicy } from "./validate-delivery-payment-rule";
import { validateDeliveryWarehouseState } from "./validate-delivery-warehouse-state";

export function buildDeliveryFromOrder({
  order,
  customer,
  warehouseOrders,
  policy
}: {
  order: SaleOrder;
  customer?: Pick<Customer, "id" | "active"> | null;
  warehouseOrders: WarehouseOrder[];
  policy?: DeliveryPaymentPolicy;
}): Delivery {
  const deliveryId = `delivery_${order.id}`;
  const warehouseState = validateDeliveryWarehouseState(
    {
      id: deliveryId,
      tenantId: order.tenantId,
      deliveryNo: "",
      orderId: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      warehouseOrderId: warehouseOrders.find((warehouseOrder) => warehouseOrder.orderId === order.id)?.id,
      status: "pending",
      plannedAt: new Date().toISOString(),
      documentStatus: "missing",
      validation: {
        customerVerified: false,
        orderMatched: false,
        warehouseReady: false,
        paymentMissing: false,
        approvalRequired: false,
        riskNote: "",
        valid: false,
        blockers: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: []
    },
    warehouseOrders
  );
  const customerLink = validateDeliveryCustomerLink(
    {
      id: deliveryId,
      tenantId: order.tenantId,
      deliveryNo: "",
      orderId: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      status: "pending",
      plannedAt: new Date().toISOString(),
      documentStatus: "missing",
      validation: {
        customerVerified: false,
        orderMatched: false,
        warehouseReady: false,
        paymentMissing: false,
        approvalRequired: false,
        riskNote: "",
        valid: false,
        blockers: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: []
    },
    order,
    customer
  );
  const paymentRule = validateDeliveryPaymentRule(order, policy);
  const blockers = [...customerLink.blockers, ...warehouseState.blockers, ...paymentRule.blockers];
  const warehouseOrder = warehouseState.linkedWarehouseOrder;

  return {
    id: deliveryId,
    tenantId: order.tenantId,
    deliveryNo: `DLV-${order.orderNo.replace(/\D/g, "") || order.id}`,
    orderId: order.id,
    orderNo: order.orderNo,
    customerId: order.customerId,
    warehouseOrderId: warehouseOrder?.id,
    status: blockers.length === 0 ? "ready" : "pending",
    plannedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    documentStatus: "missing",
    note: "Siparisten olusan teslimat taslagi.",
    validation: {
      customerVerified: customerLink.valid,
      orderMatched: deliveryId.includes(order.id),
      warehouseReady: warehouseState.warehouseReady,
      paymentMissing: paymentRule.paymentMissing,
      approvalRequired: paymentRule.approvalRequired,
      riskNote: blockers.length > 0 ? blockers.join(" ") : "Teslimat icin kritik blokaj yok.",
      valid: blockers.length === 0,
      blockers
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines: buildDeliveryLines(order, deliveryId, warehouseOrder)
  };
}
