import type { Customer, Document } from "@hallederiz/types";
import { getDocumentTypeLabel } from "../queries/document-mock-data";
import { formatDocumentEntityType } from "./document-faz-f";
import { dateLabel } from "../utils";

export function buildDocumentHeaderMeta(document: Document, customer: Customer | null): string {
  return `${document.documentNo} · ${customer?.name ?? "—"} · ${formatDocumentEntityType(document.entityType)} ${document.entityNo}`;
}

export function buildDocumentReferenceKpis(document: Document) {
  const deliveryCount = document.deliveries.length;
  const lastDelivery = document.deliveries[document.deliveries.length - 1];
  return [
    { id: "type", label: "Belge tipi", value: getDocumentTypeLabel(document.type) },
    { id: "entity", label: "Bağlı kayıt", value: `${formatDocumentEntityType(document.entityType)} ${document.entityNo}` },
    { id: "created", label: "Oluşturma", value: dateLabel(document.createdAt) },
    { id: "delivery", label: "İletim", value: deliveryCount > 0 ? `${deliveryCount} kayıt` : "Henüz yok" },
    {
      id: "status",
      label: "Durum",
      value: lastDelivery?.status ?? "Taslak",
      tone: deliveryCount > 0 ? ("success" as const) : ("warning" as const)
    }
  ];
}

export function buildDocumentInfoFields(document: Document, customer: Customer | null) {
  return [
    { label: "Belge no", value: document.documentNo },
    { label: "Belge adı", value: document.title ?? getDocumentTypeLabel(document.type) },
    { label: "Belge tipi", value: getDocumentTypeLabel(document.type) },
    { label: "İlişkili cari", value: customer?.name ?? "—" },
    { label: "İlişkili kayıt", value: `${formatDocumentEntityType(document.entityType)} · ${document.entityNo}` },
    { label: "Oluşturma tarihi", value: dateLabel(document.createdAt) },
    { label: "Durum", value: document.deliveries.at(-1)?.status ?? "Hazırlanıyor", full: true }
  ];
}
