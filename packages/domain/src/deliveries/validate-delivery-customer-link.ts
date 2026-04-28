import type { Customer, Delivery, SaleOrder } from "@hallederiz/types";

export function validateDeliveryCustomerLink(delivery: Delivery, order: SaleOrder, customer?: Pick<Customer, "id" | "active"> | null) {
  const blockers: string[] = [];

  if (delivery.orderId !== order.id) {
    blockers.push("Teslimat ile siparis eslesmesi hatali.");
  }

  if (delivery.customerId !== order.customerId) {
    blockers.push("Teslimat musterisi siparis musterisiyle uyusmuyor.");
  }

  if (customer && !customer.active) {
    blockers.push("Cari pasif durumda; teslim onayi icin yetkili kontrolu gerekir.");
  }

  return {
    valid: blockers.length === 0,
    blockers
  };
}
