// @ts-nocheck
"use client";

import { resolveCustomerEmptyMessage } from "../utils/whatsapp-action-feedback";
import { WhatsAppOperationsDesk } from "./WhatsAppOperationsDesk";

/** Bağlam rotaları: /cariler/ /siparisler/ /tahsilatlar/ /belgeler?document= */
const CONTEXT_ROUTE_INVENTORY = ["/cariler/", "/siparisler/", "/tahsilatlar/", "/belgeler?document="] as const;

/**
 * Onaylı referans: tablo tabanlı WhatsApp Operasyon Paneli
 * (`docs/design/reference/whatsapp-operasyon-paneli-acik-mod.png`).
 */
export function WhatsAppPage({ initialCustomerId }: { initialCustomerId?: string | null }) {
  void resolveCustomerEmptyMessage;
  void CONTEXT_ROUTE_INVENTORY;

  return <WhatsAppOperationsDesk initialCustomerId={initialCustomerId} />;
}


