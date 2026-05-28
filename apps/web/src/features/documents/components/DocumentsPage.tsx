"use client";

import { EntityListPageTemplate, EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Document, DocumentType } from "@hallederiz/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { MSG_DATA_WHEN_RECONNECTED, MSG_REFRESH_RETRY } from "../../../lib/user-facing-data-error";
import { useToast } from "../../../providers/toast-provider";
import { dateLabel } from "../utils";
import {
  describeArchivePolicy,
  formatDocumentDeliveryChannel,
  formatDocumentEntityType,
  formatDocumentTemplateVersion,
  summarizeDocumentDeliveries
} from "../utils/document-faz-f";
import {
  MSG_DOC_DOWNLOAD_NOT_LIVE,
  MSG_DOC_DOWNLOAD_PENDING,
  MSG_DOC_LIST_UNAVAILABLE,
  MSG_DOC_PREVIEW_ONLY
} from "../data/document-action-messages";
import {
  extractDownloadUrlFromDocument,
  hasDownloadablePdf,
  resolveDocumentsEmptyMessage,
  fetchDocumentDownloadLink,
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
  onSelect
}: {
  documents: Document[];
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const router = useRouter();
  return (
    <>
      <div className="hz-documents-table-head" role="row">
        <span>Belge tipi</span>
        <span>Şablon</span>
        <span>Bağlı kayıt</span>
        <span>Müşteri</span>
        <span>Oluşturma</span>
        <span>İletim</span>
        <span>AKSİYON</span>
      </div>
      <div className="hz-documents-table-body">
        {documents.map((document) => {
          const latestDelivery = document.deliveries[0];
          const deliveryClass =
            latestDelivery?.status === "sent" || latestDelivery?.status === "delivered"
              ? "hz-badge hz-badge-success"
              : latestDelivery?.status === "failed"
                ? "hz-badge hz-badge-danger"
                : "hz-badge hz-badge-warning";
          return (
            <div
              key={document.id}
              role="row"
              className={`hz-documents-table-row${selectedId === document.id ? " is-selected" : ""}`}
              onClick={() => onSelect(document.id)}
              onDoubleClick={() => router.push(`/belgeler/${document.id}`)}
              tabIndex={0}
            >
              <span>{getDocumentTypeLabel(document.type)}</span>
              <span>{formatDocumentTemplateVersion(document)}</span>
              <span>{document.entityNo}</span>
              <span>{customers.find((customer) => customer.id === document.customerId)?.name ?? "—"}</span>
              <span>{dateLabel(document.createdAt)}</span>
              <span>
                <span className={deliveryClass}>{getDocumentDeliveryStatusLabel(latestDelivery?.status)}</span>
              </span>
              <span>
                <button
                  type="button"
                  className="hz-documents-action-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/belgeler/${document.id}`);
                  }}
                >
                  İncele
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function DocumentPreviewPanel({ document }: { document: Document | null }) {
  if (!document) {
    return (
      <aside className="hz-documents-side">
        <p className="hz-documents-side-empty">Listeden bir belge seçin.</p>
      </aside>
    );
  }
  const deliveries = document.deliveries;
  return (
    <aside className="hz-documents-side">
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
          {hasDownloadablePdf(document)
            ? "Belge dosyası indirilebilir."
            : "Önizleme kullanılamıyor; canlı belge servisi bekleniyor."}
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
    </aside>
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

  const downloadUrl = document ? extractDownloadUrlFromDocument(document) : null;
  const canDownload = hasDownloadablePdf(document, { extraUrl: downloadUrl });

  const runDownload = async () => {
    if (!document) {
      return;
    }
    if (canDownload && downloadUrl) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (dataSourceConfig.useDemoData) {
      for (const toast of resolveDemoActionToasts("download")) {
        pushToast(toast);
      }
      return;
    }
    const outcome = await fetchDocumentDownloadLink(document.id, { useDemoData: false });
    if (outcome.ok && outcome.downloadUrl) {
      window.open(outcome.downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    pushToast(outcome.message || MSG_DOC_DOWNLOAD_PENDING);
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
        onClick={() => void runDownload()}
        title={canDownload ? "Belge dosyasını indir" : MSG_DOC_DOWNLOAD_PENDING}
      >
        {canDownload ? "İndir" : "İndirme bekleniyor"}
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    setLoadError(null);
    getDocuments()
      .then((result) => {
        if (!mounted) {
          return;
        }
        setLoadError(null);
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
  const emptyMessage = loadError
    ? "Kayıt bulunamadı veya veri kaynağına ulaşılamıyor."
    : resolveDocumentsEmptyMessage({
        useDemoData: dataSourceConfig.useDemoData,
        customerId: customerParam,
        typeFilter: typeParam
      });

  const sentCount = filteredDocuments.filter((item) =>
    item.deliveries.some((delivery) => delivery.status === "sent" || delivery.status === "delivered")
  ).length;

  return (
    <EntityListPageTemplate
      className="hz-documents-page"
      header={
        <>
          <header className="hz-documents-topbar">
            <div>
              <h1 className="hz-documents-topbar-title">Belgeler</h1>
              <p className="hz-documents-topbar-sub">
                Teklif, sipariş, tahsilat, depo, teslim, fatura ve iade belgelerini kayıt bağlamıyla yönetin.
              </p>
            </div>
          </header>
          <div className="hz-documents-kpi-strip" aria-label="Belge özeti">
            <div className="hz-documents-kpi">
              <span className="hz-documents-kpi-label">Belge</span>
              <span className="hz-documents-kpi-value">{filteredDocuments.length}</span>
            </div>
            <div className="hz-documents-kpi">
              <span className="hz-documents-kpi-label">İletim kaydı</span>
              <span className="hz-documents-kpi-value">{sentCount}</span>
            </div>
            <div className="hz-documents-kpi">
              <span className="hz-documents-kpi-label">Bekleyen</span>
              <span className="hz-documents-kpi-value">
                {filteredDocuments.filter((item) => item.deliveries.length === 0).length}
              </span>
            </div>
            <div className="hz-documents-kpi">
              <span className="hz-documents-kpi-label">Belge tipi</span>
              <span className="hz-documents-kpi-value">
                {new Set(filteredDocuments.map((item) => item.type)).size}
              </span>
            </div>
          </div>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-documents-preview-band" role="status">
              Örnek veri modu: belge listesi demo amaçlıdır; canlı PDF üretimi veya gönderim yapılmaz.
            </p>
          ) : null}
          {contextBanner ? (
            <p className="hz-documents-context-band hz-doc-context-band" role="status">
              {contextBanner}
            </p>
          ) : null}
          {loadError ? (
            <p className="hz-documents-context-band hz-doc-context-band" role="alert">
              {loadError} {MSG_DATA_WHEN_RECONNECTED} {MSG_REFRESH_RETRY}
            </p>
          ) : null}
          <div className="hz-documents-toolbar">
            <DocumentActionsBar document={selected} />
          </div>
        </>
      }
      filters={<DocumentFilterBar />}
      list={
        <div className="hz-documents-list-wrap">
          {loading ? (
            <LoadingState title="Belgeler yükleniyor" message="Kayıt bağlantıları ve iletim durumları hazırlanıyor." />
          ) : loadError || filteredDocuments.length === 0 ? (
            <EmptyState
              title={loadError ? "Belge listesi alınamadı" : "Belge bulunamadı"}
              message={emptyMessage}
            />
          ) : (
            <>
              <DocumentTable
                documents={pagedDocuments}
                customers={customers}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
              />
              <Pagination
                totalItems={filteredDocuments.length}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      }
      preview={<DocumentPreviewPanel document={selected} />}
    />
  );
}
