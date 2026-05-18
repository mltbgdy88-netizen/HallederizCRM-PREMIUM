"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, Document, DocumentType } from "@hallederiz/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { dateLabel } from "../utils";
import {
  describeArchivePolicy,
  formatDocumentDeliveryChannel,
  formatDocumentEntityType,
  formatDocumentTemplateVersion,
  summarizeDocumentDeliveries
} from "../utils/document-faz-f";
import { MSG_DOC_DOWNLOAD_NOT_LIVE, MSG_DOC_PREVIEW_ONLY } from "../data/document-action-messages";
import {
  hasDownloadablePdf,
  resolveDocumentsEmptyMessage,
  resolveDemoActionToasts,
  runDocumentLiveAction,
  sanitizeDocumentUserText
} from "../utils/document-action-feedback";
import { getDocuments } from "../queries/get-documents";
import { getDocumentDeliveryStatusLabel, getDocumentTypeLabel } from "../queries/document-mock-data";

export function DocumentFilterBar() {
  return (
    <section className="hz-filter-card">
      <div className="hz-filter-grid">
        <label>
          Belge tipi
          <select defaultValue="">
            <option value="">Tüm tipler</option>
            <option>Teklif PDF</option>
            <option>Teslim fişi</option>
            <option>İade notu</option>
          </select>
        </label>
        <label>
          Kayıt türü
          <select defaultValue="">
            <option value="">Tüm kayıtlar</option>
            <option>Sipariş</option>
            <option>Teslimat</option>
            <option>Fatura</option>
            <option>İade</option>
          </select>
        </label>
        <label>
          Müşteri
          <input placeholder="Cari adı" />
        </label>
        <label>
          İletim durumu
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option>Kuyrukta</option>
            <option>İletim kaydı</option>
            <option>Başarısız</option>
          </select>
        </label>
        <label>
          Tarih
          <select defaultValue="month">
            <option>Bugün</option>
            <option>Bu hafta</option>
            <option>Bu ay</option>
          </select>
        </label>
      </div>
      <p className="muted">Filtreler önizleme amaçlıdır; canlı gönderim ve arşiv bağlantısı henüz tamamlanmadı.</p>
    </section>
  );
}

export function DocumentTable({
  documents,
  customers,
  selectedId,
  onSelect,
  emptyMessage
}: {
  documents: Document[];
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage: string;
}) {
  const router = useRouter();
  return (
    <section className="hz-content-card hz-doc-table-wrap">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Belge tipi</th>
              <th>Şablon</th>
              <th>Bağlı kayıt</th>
              <th>Müşteri</th>
              <th>Oluşturma</th>
              <th>İletim</th>
              <th>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => {
              const latestDelivery = document.deliveries[0];
              return (
                <tr
                  key={document.id}
                  className={`stock-table-row hz-doc-table-row ${selectedId === document.id ? "is-selected-row" : ""}`}
                  onClick={() => onSelect(document.id)}
                  onDoubleClick={() => router.push(`/belgeler/${document.id}`)}
                >
                  <td>{getDocumentTypeLabel(document.type)}</td>
                  <td className="hz-doc-table-cell-muted">{formatDocumentTemplateVersion(document)}</td>
                  <td>{document.entityNo}</td>
                  <td>{customers.find((customer) => customer.id === document.customerId)?.name ?? document.customerId ?? "—"}</td>
                  <td>{dateLabel(document.createdAt)}</td>
                  <td>
                    <span
                      className={`hz-badge hz-badge-${latestDelivery?.status === "sent" || latestDelivery?.status === "delivered" ? "success" : latestDelivery?.status === "failed" ? "danger" : "warning"}`}
                    >
                      {getDocumentDeliveryStatusLabel(latestDelivery?.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="hz-btn hz-btn-secondary"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/belgeler/${document.id}`);
                      }}
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              );
            })}
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="table-empty">{emptyMessage}</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DocumentPreviewPanel({ document }: { document: Document | null }) {
  if (!document) {
    return (
      <section className="hz-content-card hz-doc-preview-panel">
        <h3>Belge önizleme</h3>
        <p className="hz-content-card-description">Bir belge seçin.</p>
      </section>
    );
  }
  const deliveries = document.deliveries;
  return (
    <section className="hz-content-card hz-doc-preview-panel">
      <h3>Belge önizleme</h3>
      <ul className="hz-side-list hz-doc-preview-list">
        <li>Belge no: {document.documentNo}</li>
        <li>Tip: {getDocumentTypeLabel(document.type)}</li>
        <li>Şablon sürümü: {formatDocumentTemplateVersion(document)}</li>
        <li>
          Bağlı kayıt: {formatDocumentEntityType(document.entityType)} / {document.entityNo}
        </li>
        <li>Teslim özeti: {summarizeDocumentDeliveries(deliveries)}</li>
        <li>Arşiv: {describeArchivePolicy()}</li>
        <li>
          Önizleme:{" "}
          {dataSourceConfig.useDemoData
            ? "Şablon önizlemesi gösterilir; canlı PDF üretimi henüz bağlı değildir."
            : sanitizeDocumentUserText(document.previewText)}
        </li>
      </ul>
      {deliveries.length > 0 ? (
        <div className="hz-doc-delivery-table-wrap">
          <p className="hz-doc-preview-subcap">İletim satırları (önizleme)</p>
          <div className="table-wrap hz-table-wrap">
            <table className="table hz-table hz-doc-delivery-table">
              <thead>
                <tr>
                  <th>Kanal</th>
                  <th>Durum</th>
                  <th>İstenen</th>
                  <th>İletim zamanı</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td>{formatDocumentDeliveryChannel(d.channel)}</td>
                    <td>{getDocumentDeliveryStatusLabel(d.status)}</td>
                    <td>{dateLabel(d.requestedAt)}</td>
                    <td>{d.sentAt ? dateLabel(d.sentAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function resolveDocumentEntityHref(document: Document | null): string {
  if (!document) {
    return "/belgeler";
  }
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
  const { pushToast } = useToast();

  const runAction = async (action: "sendWhatsApp" | "sendEmail" | "queueSave" | "queuePrint" | "regenerate") => {
    if (!document) {
      return;
    }
    const outcome = await runDocumentLiveAction(action, document.id, {
      useDemoData: dataSourceConfig.useDemoData
    });
    for (const toast of outcome.toasts) {
      pushToast(toast);
    }
  };

  const runDownload = () => {
    if (!document) {
      return;
    }
    if (hasDownloadablePdf(document)) {
      return;
    }
    if (dataSourceConfig.useDemoData) {
      for (const toast of resolveDemoActionToasts("download")) {
        pushToast(toast);
      }
      return;
    }
    pushToast(MSG_DOC_DOWNLOAD_NOT_LIVE);
    pushToast(MSG_DOC_PREVIEW_ONLY);
  };

  return (
    <section className="hz-action-toolbar">
      <button
        className="hz-btn hz-btn-primary hz-toolbar-btn"
        type="button"
        onClick={() => document && router.push(`/belgeler/${document.id}`)}
      >
        Önizle
      </button>
      <button
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        type="button"
        onClick={() => void runAction("sendWhatsApp")}
      >
        WhatsApp&apos;tan gönder
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void runAction("sendEmail")}>
        E-posta
      </button>
      <button
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        type="button"
        onClick={() => runDownload()}
      >
        İndir
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void runAction("queueSave")}>
        Arşive al
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void runAction("queuePrint")}>
        Yazdırma kuyruğu
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void runAction("regenerate")}>
        PDF yenile
      </button>
      <button
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        type="button"
        onClick={() => router.push("/archive")}
      >
        Arşivde gör
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => router.push(resolveDocumentEntityHref(document))}>
        İlgili kayda git
      </button>
    </section>
  );
}

function resolveContextBanner(
  customerId: string | null,
  typeFilter: string | null,
  customerName: string | null
): string | null {
  if (!customerId && !typeFilter) {
    return null;
  }
  const parts: string[] = [];
  if (customerId) {
    parts.push(`Cari bağlamı: ${customerName ?? customerId}`);
  }
  if (typeFilter === "statement_pdf") {
    parts.push("Ekstre taslağı — cari ekstresi önizleme bağlamı");
  } else if (typeFilter) {
    parts.push(`Belge tipi: ${getDocumentTypeLabel(typeFilter as DocumentType)}`);
  }
  return parts.join(" · ");
}

export function DocumentsPage() {
  const searchParams = useSearchParams();
  const customerParam = searchParams.get("customer");
  const typeParam = searchParams.get("type");
  const documentParam = searchParams.get("document");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    getDocuments()
      .then((result) => {
        if (!mounted) {
          return;
        }
        setDocuments(result.documents);
        setCustomers(result.customers);

        let scoped = result.documents;
        if (customerParam) {
          scoped = scoped.filter((document) => document.customerId === customerParam);
        }
        if (typeParam) {
          scoped = scoped.filter((document) => document.type === typeParam);
        }

        const initialDocument =
          (documentParam
            ? result.documents.find(
                (document) => document.id === documentParam || document.documentNo === documentParam
              )
            : null) ??
          scoped[0] ??
          result.documents[0] ??
          null;
        setSelectedId(initialDocument?.id ?? null);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [customerParam, typeParam, documentParam]);

  const filteredDocuments = useMemo(() => {
    let list = documents;
    if (customerParam) {
      list = list.filter((document) => document.customerId === customerParam);
    }
    if (typeParam) {
      list = list.filter((document) => document.type === typeParam);
    }
    return list;
  }, [documents, customerParam, typeParam]);

  useEffect(() => {
    setPage(1);
  }, [customerParam, typeParam, documentParam]);

  useEffect(() => {
    if (!filteredDocuments.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredDocuments.some((document) => document.id === selectedId)) {
      setSelectedId(filteredDocuments[0]?.id ?? null);
    }
  }, [filteredDocuments, selectedId]);

  const selected = useMemo(
    () => filteredDocuments.find((document) => document.id === selectedId) ?? filteredDocuments[0] ?? null,
    [filteredDocuments, selectedId]
  );
  const pagedDocuments = useMemo(() => filteredDocuments.slice((page - 1) * pageSize, page * pageSize), [filteredDocuments, page]);
  const contextCustomerName = useMemo(
    () => customers.find((customer) => customer.id === customerParam)?.name ?? null,
    [customers, customerParam]
  );
  const contextBanner = resolveContextBanner(customerParam, typeParam, contextCustomerName);
  const emptyMessage = resolveDocumentsEmptyMessage({
    useDemoData: dataSourceConfig.useDemoData,
    customerId: customerParam,
    typeFilter: typeParam
  });

  return (
    <div className="hz-page-stack hz-doc-page">
      {dataSourceConfig.useDemoData ? (
        <div className="hz-doc-preview-band" role="status">
          Örnek veri modu: belge listesi ve önizleme demo amaçlıdır; canlı PDF üretimi veya gönderim yapılmaz.
        </div>
      ) : null}
      {contextBanner ? (
        <p className="hz-doc-context-band" role="status">
          {contextBanner}
        </p>
      ) : null}
      <PageHeader
        title="Belgeler"
        description="Teklif, sipariş, tahsilat, depo, teslim, fatura ve iade belgelerini kayıt bağlamıyla yönetin."
      />
      <section className="hz-metric-grid">
        <MetricCard title="Belge" value={String(filteredDocuments.length)} detail="Görünen kayıt" tone="info" />
        <MetricCard
          title="İletim kaydı"
          value={String(filteredDocuments.filter((item) => item.deliveries.some((delivery) => delivery.status === "sent")).length)}
          detail="Önizleme kayıtları"
          tone="success"
        />
        <MetricCard
          title="Bekleyen"
          value={String(filteredDocuments.filter((item) => item.deliveries.length === 0).length)}
          detail="İletim veya arşiv bekliyor"
          tone="warning"
        />
        <MetricCard title="Belge tipi" value={String(new Set(filteredDocuments.map((item) => item.type)).size)} detail="Farklı tür" tone="neutral" />
      </section>
      <DocumentActionsBar document={selected} />
      <DocumentFilterBar />
      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Belgeler yükleniyor" message="Kayıt bağlantıları ve iletim durumları hazırlanıyor." />
          ) : (
            <>
              <DocumentTable
                documents={pagedDocuments}
                customers={customers}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                emptyMessage={emptyMessage}
              />
              <Pagination totalItems={filteredDocuments.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )
        }
        side={<DocumentPreviewPanel document={selected} />}
      />
    </div>
  );
}
