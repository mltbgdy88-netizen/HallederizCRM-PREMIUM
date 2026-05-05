import type { WarehouseOrder, WarehouseOrderLine } from "@hallederiz/types";

export type PrepDisplayStatus = "beklemede" | "hazirlandi" | "eksik" | "iptal" | "teslim_edildi";

export function orderHasShortage(order: WarehouseOrder): boolean {
  if (order.status === "cancelled" || order.status === "delivered") return false;
  return order.lines.some((line) => line.preparedQuantity < line.requestedQuantity);
}

export function lineShortage(line: WarehouseOrderLine): number {
  return Math.max(0, line.requestedQuantity - line.preparedQuantity);
}

export function orderTotalRollUnits(order: WarehouseOrder): number {
  return order.lines.reduce((sum, line) => sum + line.requestedQuantity, 0);
}

export function orderPreparedTotal(order: WarehouseOrder): number {
  return order.lines.reduce((sum, line) => sum + line.preparedQuantity, 0);
}

/** Satır bazlı açık adet toplamı (requested − prepared, negatif yok). */
export function orderShortageTotal(order: WarehouseOrder): number {
  return order.lines.reduce((sum, line) => sum + lineShortage(line), 0);
}

/**
 * Kullanıcıya gösterilen türetilmiş durum.
 * - Toplama sürerken (`picking`) satır bazında kısmi adetler **Beklemede** sayılır.
 * - Raftan henüz çıkış yok / operasyon eksikliği (`waiting` + satır açığı) **Eksik** olarak ayrılır.
 */
export function getPrepDisplayStatus(order: WarehouseOrder): PrepDisplayStatus {
  if (order.status === "cancelled") return "iptal";
  if (order.status === "delivered") return "teslim_edildi";
  if (order.status === "prepared") {
    if (orderHasShortage(order)) return "eksik";
    return "hazirlandi";
  }
  if (order.status === "picking") {
    return "beklemede";
  }
  if (order.status === "waiting") {
    if (orderHasShortage(order)) return "eksik";
    return "beklemede";
  }
  if (orderHasShortage(order)) return "eksik";
  return "beklemede";
}

export function prepDisplayLabel(status: PrepDisplayStatus): string {
  const map: Record<PrepDisplayStatus, string> = {
    beklemede: "Beklemede",
    hazirlandi: "Hazırlandı",
    eksik: "Eksik",
    iptal: "İptal",
    teslim_edildi: "Teslim edildi"
  };
  return map[status];
}

export function prepPillClass(status: PrepDisplayStatus): string {
  if (status === "hazirlandi") return "hz-warehouse-prep-pill hz-warehouse-prep-pill--ok";
  if (status === "eksik") return "hz-warehouse-prep-pill hz-warehouse-prep-pill--danger";
  if (status === "beklemede") return "hz-warehouse-prep-pill hz-warehouse-prep-pill--warn";
  if (status === "iptal") return "hz-warehouse-prep-pill hz-warehouse-prep-pill--muted";
  return "hz-warehouse-prep-pill hz-warehouse-prep-pill--info";
}

export function getWarehouseOrderPrepLabel(order: WarehouseOrder): string {
  return prepDisplayLabel(getPrepDisplayStatus(order));
}

export function getWarehouseOrderPrepPillClass(order: WarehouseOrder): string {
  return prepPillClass(getPrepDisplayStatus(order));
}
