"use client";

import { LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Document } from "@hallederiz/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getDocumentTypeLabel } from "../queries/document-mock-data";
import { getDocumentDetail } from "../queries/get-documents";
import { dateLabel } from "../utils";

function DocumentActions({ document, onReload }: { document: Document | null; onReload: () => Promise<void> }) {
  const router = useRouter();

  const run = async (action: "queueSave" | "queuePrint" | "regenerate" | "sendWhatsApp" | "sendEmail") => {
    if (!document || dataSourceConfig.useDemoData) return;
    if (action === "queueSave") await sdk.documents.queueSave(document.id);
    if (action === "queuePrint") await sdk.documents.queuePrint(document.id);
    if (action === "regenerate") await sdk.documents.regenerate(document.id);
    if (action === "sendWhatsApp") await sdk.documents.sendWhatsApp(document.id);
    if (action === "sendEmail") await sdk.documents.sendEmail(document.id);
    await onReload();
  };

  return (
    <section className="hz-action-toolbar">
      <button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={() => run("regenerate")}>
        Yeniden Olustur
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => run("queueSave")}>
        Queue Save
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => run("queuePrint")}>
        Queue Print
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => run("sendWhatsApp")}>
        WhatsApp Gonder
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => run("sendEmail")}>
        E-posta Gonder
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => router.push("/belgeler")}>
        Listeye Don
      </button>
    </section>
  );
}

function DocumentSummary({ document, customer }: { document: Document; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Belge Ozet</h3>
      <ul className="hz-side-list">
        <li>Belge No: {document.documentNo}</li>
        <li>Belge Tipi: {getDocumentTypeLabel(document.type)}</li>
        <li>Bagli Kayit: {document.entityNo}</li>
        <li>Musteri: {customer?.name ?? "-"}</li>
        <li>Olusturma: {dateLabel(document.createdAt)}</li>
      </ul>
    </section>
  );
}

function DocumentPreview({ document }: { document: Document }) {
  return (
    <section className="hz-content-card">
      <h3>Preview</h3>
      <p className="hz-content-card-description">{document.previewText}</p>
      <div className="hz-inline-note">
        <span className="hz-inline-note-label">Entity</span>
        <Link href="/belgeler" className="hz-inline-note-value">
          {document.entityType} / {document.entityNo}
        </Link>
      </div>
    </section>
  );
}

function DocumentDeliveryHistory({ document }: { document: Document }) {
  return (
    <section className="hz-content-card">
      <h3>Gonderim Gecmisi</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Kanal</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Alici</th>
            </tr>
          </thead>
          <tbody>
            {document.deliveries.length === 0 ? (
              <tr>
                <td colSpan={4}>Henüz gonderim kaydi yok.</td>
              </tr>
            ) : (
              document.deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.channel}</td>
                  <td>{delivery.status}</td>
                  <td>{dateLabel(delivery.requestedAt)}</td>
                  <td>{delivery.recipient ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params?.documentId;
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const load = async () => {
    setLoading(true);
    const result = await getDocumentDetail(documentId);
    setDocument(result.document);
    setCustomers(result.customers);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [documentId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === document?.customerId) ?? null,
    [customers, document?.customerId]
  );

  if (loading) {
    return <LoadingState title="Belge yukleniyor" message="Belge detayi ve gonderim gecmisi getiriliyor." />;
  }

  if (!document) {
    return (
      <div className="hz-page-stack">
        <PageHeader title="Belge Bulunamadi" description="Istenen belge kaydi bulunamadi." />
        <section className="hz-content-card">
          <Link href="/belgeler">Belge listesine don</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="hz-page-stack">
      <PageHeader title={`Belge ${document.documentNo}`} description="Belge preview, queue ve gonderim operasyonlarini bu ekrandan yonetin." />
      <DocumentActions document={document} onReload={load} />
      <SplitContentLayout
        main={
          <>
            <DocumentPreview document={document} />
            <DocumentDeliveryHistory document={document} />
          </>
        }
        side={<DocumentSummary document={document} customer={customer} />}
      />
    </div>
  );
}
