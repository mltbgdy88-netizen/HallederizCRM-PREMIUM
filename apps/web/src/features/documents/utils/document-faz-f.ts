import type { Document, DocumentDelivery } from "@hallederiz/types";

const TEMPLATE_VERSION_BY_TYPE: Partial<Record<Document["type"], string>> = {
  offer_pdf: "teklif-v1.4.0",
  order_pdf: "siparis-v1.2.1",
  payment_receipt_pdf: "tahsilat-makbuzu-v1.1.0",
  warehouse_note_pdf: "depo-hazirlik-v1.0.3",
  delivery_note_pdf: "teslim-irsaliye-v1.3.0",
  invoice_pdf: "fatura-v2.0.0",
  statement_pdf: "ekstre-v1.0.2",
  return_note_pdf: "iade-notu-v1.0.1",
  dispatch_note_pdf: "sevk-v1.0.0"
};

export function formatDocumentTemplateVersion(document: Document): string {
  return TEMPLATE_VERSION_BY_TYPE[document.type] ?? `genel-v1.0.0+${document.type}`;
}

export function formatDocumentDeliveryChannel(channel: DocumentDelivery["channel"]): string {
  switch (channel) {
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "E-posta";
    case "print":
      return "Yazdirma";
    case "download":
      return "Indirme";
  }
}

export function describeArchivePolicy(): string {
  return "Arsiv: immutable PDF + metadata; tenant saklama suresi ve WORM politikasi API/ayarlarda; silme yalniz policy + onay ile.";
}

export function summarizeDocumentDeliveries(deliveries: DocumentDelivery[]): string {
  const d = deliveries[0];
  if (!d) return "Teslim kaydi yok (kuyruk veya gonderim bekleniyor).";
  const ch = formatDocumentDeliveryChannel(d.channel);
  return `${ch}: ${d.status}${d.sentAt ? `, gonderim ${new Date(d.sentAt).toLocaleString("tr-TR")}` : ""}${d.deliveredAt ? `, teslim ${new Date(d.deliveredAt).toLocaleString("tr-TR")}` : ""}.`;
}
