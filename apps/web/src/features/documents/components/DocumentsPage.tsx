"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Document } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { dateLabel } from "../utils";
import { getDocuments } from "../queries/get-documents";
import { getDocumentDeliveryStatusLabel, getDocumentTypeLabel } from "../queries/document-mock-data";

export function DocumentFilterBar() {
  return <section className="hz-filter-card"><div className="hz-filter-grid"><label>Belge Tipi<select defaultValue=""><option value="">Tum tipler</option><option>Fatura PDF</option><option>Teslim Fisi</option><option>Iade Notu</option></select></label><label>Entity Tipi<select defaultValue=""><option value="">Tum entityler</option><option>order</option><option>delivery</option><option>invoice</option><option>return</option></select></label><label>Musteri<input placeholder="Cari adi" /></label><label>Gonderim Durumu<select defaultValue=""><option value="">Tum durumlar</option><option>Gonderildi</option><option>Kuyrukta</option><option>Basarisiz</option></select></label><label>Tarih<select defaultValue="month"><option>Bugun</option><option>Bu hafta</option><option>Bu ay</option></select></label></div></section>;
}

export function DocumentTable({ documents, customers, selectedId, onSelect }: { documents: Document[]; customers: Customer[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const router = useRouter();
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Belge Tipi</th><th>Bagli Kayit</th><th>Musteri</th><th>Olusturma</th><th>Gonderim</th></tr></thead><tbody>{documents.map((document) => { const latestDelivery = document.deliveries[0]; return <tr key={document.id} className={`stock-table-row ${selectedId === document.id ? "is-selected-row" : ""}`} onClick={() => onSelect(document.id)} onDoubleClick={() => router.push(`/belgeler/${document.id}`)}><td>{getDocumentTypeLabel(document.type)}</td><td>{document.entityNo}</td><td>{customers.find((customer) => customer.id === document.customerId)?.name ?? document.customerId ?? "-"}</td><td>{dateLabel(document.createdAt)}</td><td><span className={`hz-badge hz-badge-${latestDelivery?.status === "sent" || latestDelivery?.status === "delivered" ? "success" : latestDelivery?.status === "failed" ? "danger" : "warning"}`}>{getDocumentDeliveryStatusLabel(latestDelivery?.status)}</span></td></tr>; })}</tbody></table></div></section>;
}

export function DocumentPreviewPanel({ document }: { document: Document | null }) {
  return <section className="hz-content-card"><h3>Belge Preview</h3>{document ? <ul className="hz-side-list"><li>Belge No: {document.documentNo}</li><li>Tip: {getDocumentTypeLabel(document.type)}</li><li>Bagli entity: {document.entityType} / {document.entityNo}</li><li>Onizleme: {document.previewText}</li></ul> : <p className="hz-content-card-description">Bir belge secin.</p>}</section>;
}

function resolveDocumentEntityHref(document: Document | null): string {
  if (!document) return "/belgeler";
  const hrefByEntity: Record<Document["entityType"], string> = {
    offer: `/teklifler/${document.entityId}`,
    order: `/siparisler/${document.entityId}`,
    payment: `/tahsilatlar/${document.entityId}`,
    warehouse_order: `/depo/emirler/${document.entityId}`,
    delivery: `/teslimatlar/${document.entityId}`,
    dispatch: "/teslimatlar",
    invoice: `/faturalar/${document.entityId}`,
    return: `/iadeler/${document.entityId}`,
    statement: document.customerId ? `/cariler/${document.customerId}` : "/cariler"
  };
  return hrefByEntity[document.entityType];
}

export function DocumentActionsBar({ document }: { document: Document | null }) {
  const router = useRouter();
  const runDocumentAction = async (action: "sendWhatsApp" | "sendEmail" | "queueSave" | "queuePrint" | "regenerate") => {
    if (!document || dataSourceConfig.useDemoData) return;
    if (action === "sendWhatsApp") await sdk.documents.sendWhatsApp(document.id);
    if (action === "sendEmail") await sdk.documents.sendEmail(document.id);
    if (action === "queueSave") await sdk.documents.queueSave(document.id);
    if (action === "queuePrint") await sdk.documents.queuePrint(document.id);
    if (action === "regenerate") await sdk.documents.regenerate(document.id);
  };
  return <section className="hz-action-toolbar"><button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={() => document && router.push(`/belgeler/${document.id}`)}>Onizle</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => runDocumentAction("sendWhatsApp")}>WhatsApp'tan Gonder</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => runDocumentAction("sendEmail")}>E-posta</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => document && router.push(`/belgeler/${document.id}`)}>Indir</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => runDocumentAction("queueSave")}>Queue Save</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => runDocumentAction("queuePrint")}>Queue Print</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => runDocumentAction("regenerate")}>Yeniden Olustur</button><button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => router.push(resolveDocumentEntityHref(document))}>Ilgili Kayda Git</button></section>;
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => {
    getDocuments()
      .then((result) => {
        setDocuments(result.documents);
        setCustomers(result.customers);
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const requestedDocument = params.get("document");
        const requestedCustomer = params.get("customer");
        const initialDocument = result.documents.find((document) => document.id === requestedDocument || document.customerId === requestedCustomer) ?? result.documents[0] ?? null;
        setSelectedId(initialDocument?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);
  const selected = useMemo(() => documents.find((document) => document.id === selectedId) ?? documents[0] ?? null, [documents, selectedId]);
  const pagedDocuments = useMemo(() => documents.slice((page - 1) * pageSize, page * pageSize), [documents, page]);
  return <div className="hz-page-stack"><PageHeader title="Belgeler" description="Teklif, siparis, tahsilat, depo, teslim, fatura ve iade belgelerini entity baglamiyla yonetin." /><section className="hz-metric-grid"><MetricCard title="Belge" value={String(documents.length)} detail="Foundation record" tone="info" /><MetricCard title="Gonderildi" value={String(documents.filter((item) => item.deliveries.some((delivery) => delivery.status === "sent")).length)} detail="WhatsApp/e-posta" tone="success" /><MetricCard title="Kuyruk" value={String(documents.filter((item) => item.deliveries.length === 0).length)} detail="Queue save/print bekliyor" tone="warning" /><MetricCard title="Tip" value={String(new Set(documents.map((item) => item.type)).size)} detail="Belge turu" tone="neutral" /></section><DocumentActionsBar document={selected} /><DocumentFilterBar /><SplitContentLayout main={loading ? <LoadingState title="Belgeler yukleniyor" message="Entity baglantilari ve gonderim durumlari hazirlaniyor." /> : <><DocumentTable documents={pagedDocuments} customers={customers} selectedId={selected?.id ?? null} onSelect={setSelectedId} /><Pagination totalItems={documents.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<DocumentPreviewPanel document={selected} />} /></div>;
}
