export type DocumentTemplateRow = {
  id: string;
  name: string;
  type: string;
  lastUsedAt: string;
  active: boolean;
  previewNote: string;
};

export type ArchivedDocumentRow = {
  id: string;
  documentNo: string;
  title: string;
  type: string;
  customerName: string;
  archivedAt: string;
  entityNo: string;
};

export const DOCUMENT_TEMPLATE_DEMO_ROWS: DocumentTemplateRow[] = [
  {
    id: "tpl-offer-v3",
    name: "Teklif PDF — Kurumsal",
    type: "Teklif PDF",
    lastUsedAt: "2026-05-28T10:15:00.000Z",
    active: true,
    previewNote: "Logo, satır tablosu ve geçerlilik notu içerir."
  },
  {
    id: "tpl-delivery-v2",
    name: "Teslim Fişi",
    type: "Teslim fişi",
    lastUsedAt: "2026-05-27T14:40:00.000Z",
    active: true,
    previewNote: "Teslim satırları ve imza alanı."
  },
  {
    id: "tpl-payment-v1",
    name: "Tahsilat Makbuzu",
    type: "Tahsilat makbuzu",
    lastUsedAt: "2026-05-20T09:05:00.000Z",
    active: true,
    previewNote: "Tutar, yöntem ve cari özeti."
  },
  {
    id: "tpl-return-v1",
    name: "İade Notu",
    type: "İade notu",
    lastUsedAt: "2026-05-12T16:22:00.000Z",
    active: false,
    previewNote: "İade sebebi ve satır özeti; pasif şablon."
  }
];

export const ARCHIVED_DOCUMENT_DEMO_ROWS: ArchivedDocumentRow[] = [
  {
    id: "doc-arch-001",
    documentNo: "BLG-2025-0412",
    title: "Teklif PDF",
    type: "Teklif PDF",
    customerName: "ABC İnşaat A.Ş.",
    archivedAt: "2026-04-18T11:00:00.000Z",
    entityNo: "TKL-2025-0088"
  },
  {
    id: "doc-arch-002",
    documentNo: "BLG-2025-0398",
    title: "Teslim Fişi",
    type: "Teslim fişi",
    customerName: "Yıldız Yapı Ltd.",
    archivedAt: "2026-04-10T08:30:00.000Z",
    entityNo: "TSL-2025-0142"
  },
  {
    id: "doc-arch-003",
    documentNo: "BLG-2025-0371",
    title: "Tahsilat Makbuzu",
    type: "Tahsilat makbuzu",
    customerName: "Mavi Dekor",
    archivedAt: "2026-03-28T15:45:00.000Z",
    entityNo: "THS-2025-0201"
  }
];
