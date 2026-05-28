import type { QuickOperationSubmitRequest, QuickOperationType } from "@hallederiz/types";
import { HZ_CUSTOMERS_DEMO_PREFIX } from "../../customers/data/customers-demo-rows";
import { loadQuickOperationCustomers } from "../../quick-operations/data/quick-operation-catalog";
import { isQuickOpPreviewCustomerId } from "../../quick-operations/data/quick-operation-guards";
import { previewQuickOperationRecord } from "../../../services/api/quick-operations.service";
import type { HizliActionCard } from "../data/hizli-islem-mock";

const HUB_PREVIEW_LINE = {
  id: "hub_preview_line",
  productCode: "HUB-001",
  productName: "Örnek kalem",
  quantity: 1,
  unitPrice: 100,
  taxRate: 20,
  sourceType: "center_warehouse" as const,
  lineTotal: 120
};

const CARD_OPERATION_MAP: Record<string, QuickOperationType | null> = {
  order: "sale_order",
  offer: "offer",
  collection: "payment",
  delivery: "delivery",
  return: "return",
  impact: null
};

export function resolveHizliIslemOperationType(cardId: string): QuickOperationType | null {
  return CARD_OPERATION_MAP[cardId] ?? null;
}

async function resolveHubPreviewCustomer(): Promise<{ id: string; name: string }> {
  const customers = await loadQuickOperationCustomers();
  const liveCustomer = customers.find((c) => !isQuickOpPreviewCustomerId(c.id));
  if (liveCustomer) {
    return { id: liveCustomer.id, name: liveCustomer.name };
  }

  const demoCustomer = customers.find((c) => isQuickOpPreviewCustomerId(c.id));
  if (demoCustomer) {
    return { id: demoCustomer.id, name: demoCustomer.name };
  }

  return {
    id: `${HZ_CUSTOMERS_DEMO_PREFIX}delta`,
    name: "Örnek cari (önizleme)"
  };
}

export async function buildHizliIslemHubPreviewPayload(
  card: HizliActionCard
): Promise<QuickOperationSubmitRequest | null> {
  const operationType = resolveHizliIslemOperationType(card.id);
  if (!operationType) {
    return null;
  }

  const customer = await resolveHubPreviewCustomer();
  return {
    operationType,
    customerId: customer.id,
    customerName: customer.name,
    lines: [{ ...HUB_PREVIEW_LINE, id: `hub_preview_${card.id}` }]
  };
}

export async function fetchHizliIslemActionPreview(card: HizliActionCard) {
  const payload = await buildHizliIslemHubPreviewPayload(card);
  if (!payload) {
    return null;
  }
  return previewQuickOperationRecord(payload);
}
