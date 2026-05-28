// @ts-nocheck
import type { SaleOrder } from "@hallederiz/types";
import { REFERENCE_ROUTE_IDS } from "./reference/reference-route-ids";

export type SiparisFulfillmentKind = "merkez" | "fabrika" | "bolunmus" | "none";

export type SiparisFulfillment = {
  kind: SiparisFulfillmentKind;
  label: string;
  factoryOrderId?: string;
  warehouseOrderId?: string;
};

const DEMO_SALES_TO_FACTORY: Record<string, string> = {
  order_1: REFERENCE_ROUTE_IDS.factoryOrderId,
  "1": "1",
  "3": "3",
  "4": "2",
  "7": "7"
};

const DEMO_SALES_TO_WAREHOUSE: Record<string, string> = {
  order_1: REFERENCE_ROUTE_IDS.warehouseOrderId,
  "1": "1",
  "4": "4"
};

export function resolveFabrikaSiparisDetayHref(factoryOrderId: string): string {
  return `/fabrikalar/siparis/detay?factoryOrderId=${encodeURIComponent(factoryOrderId)}`;
}

export function resolveFabrikaSiparisListeHref(salesOrderId?: string): string {
  if (!salesOrderId?.trim()) {
    return "/fabrikalar/siparis";
  }
  return `/fabrikalar/siparis?salesOrderId=${encodeURIComponent(salesOrderId.trim())}`;
}

export function resolveDepoHazirlikHref(warehouseOrderId?: string): string {
  if (!warehouseOrderId?.trim()) {
    return "/depo";
  }
  return `/depo?warehouseOrderId=${encodeURIComponent(warehouseOrderId.trim())}`;
}

export function mapDemoFactoryOrderId(salesOrderId: string): string | undefined {
  return DEMO_SALES_TO_FACTORY[salesOrderId];
}

export function mapDemoWarehouseOrderId(salesOrderId: string): string | undefined {
  return DEMO_SALES_TO_WAREHOUSE[salesOrderId];
}

export function fulfillmentFromSaleOrder(order: SaleOrder): SiparisFulfillment {
  const factoryQty = order.sourcePlans.reduce((sum, plan) => sum + (plan.factoryQuantity ?? 0), 0);
  const warehouseQty = order.sourcePlans.reduce((sum, plan) => sum + (plan.warehouseQuantity ?? 0), 0);
  const hasFactory = factoryQty > 0;
  const hasWarehouse = warehouseQty > 0;

  if (hasFactory && hasWarehouse) {
    return {
      kind: "bolunmus",
      label: `BÃ¶lÃ¼nmÃ¼ÅŸ (merkez ${warehouseQty} Â· fabrika ${factoryQty})`,
      factoryOrderId: mapDemoFactoryOrderId(order.id),
      warehouseOrderId: mapDemoWarehouseOrderId(order.id)
    };
  }

  if (hasFactory) {
    return {
      kind: "fabrika",
      label: `Fabrika (${factoryQty} birim)`,
      factoryOrderId: mapDemoFactoryOrderId(order.id)
    };
  }

  if (hasWarehouse) {
    return {
      kind: "merkez",
      label: `Merkez depo (${warehouseQty} birim)`,
      warehouseOrderId: mapDemoWarehouseOrderId(order.id)
    };
  }

  return { kind: "none", label: "Kaynak planÄ± bekleniyor" };
}

export function fulfillmentFromDemoRow(input: {
  salesOrderId: string;
  kind: SiparisFulfillmentKind;
  label: string;
  factoryOrderId?: string;
  warehouseOrderId?: string;
}): SiparisFulfillment {
  return {
    kind: input.kind,
    label: input.label,
    factoryOrderId: input.factoryOrderId ?? mapDemoFactoryOrderId(input.salesOrderId),
    warehouseOrderId: input.warehouseOrderId ?? mapDemoWarehouseOrderId(input.salesOrderId)
  };
}

export function fulfillmentShowsFabrikaLink(fulfillment: SiparisFulfillment): boolean {
  return (
    (fulfillment.kind === "fabrika" || fulfillment.kind === "bolunmus") && Boolean(fulfillment.factoryOrderId)
  );
}

export function fulfillmentShowsDepoLink(fulfillment: SiparisFulfillment): boolean {
  return (
    (fulfillment.kind === "merkez" || fulfillment.kind === "bolunmus") && Boolean(fulfillment.warehouseOrderId)
  );
}

