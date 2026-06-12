"use client";

import { EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Document, DocumentType } from "@hallederiz/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { ENTERPRISE_DESK_PAGE_SIZE } from "../../../lib/enterprise-desk-constants";
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
import { MSG_DOC_DOWNLOAD_PENDING, MSG_DOC_LIST_UNAVAILABLE } from "../data/document-action-messages";
import {
  extractDownloadUrlFromDocument,
  hasDownloadablePdf,
  resolveDocumentsEmptyMessage,
  fetchDocumentDownloadLink,
  resolveDemoActionToasts,
  runDocumentLiveAction
} from "../utils/document-action-feedback";
import { getDocuments } from "../queries/get-documents";
import { getDocumentDeliveryStatusLabel, getDocumentTypeLabel } from "../queries/document-mock-data";

export function DocumentFilterBar({
  docType,
  entityType,
  customerQuery,
  deliveryStatus,
  period,
  onChange
}: {
  docType: string;
  entityType: string;
  customerQuery: string;
  deliveryStatus: string;
  period: string;
  onChange: (patch: {
    docType?: string;
    entityType?: string;
    customerQuery?: string;
    deliveryStatus?: string;
    period?: string;
  }) => void;
}) {
  return (
    <div className="docf-desk-filters" aria-label="Belge filtreleri">
      <label className="docf-desk-filter">
        Belge tipi
        <select value={docType} onChange={(event) => onChange({ docType: event.target.value })}>
          <option value="">Tüm tipler</option>
          <option value="offer_pdf">Teklif PDF</option>
          <option value="delivery_slip">Teslim fişi</option>
          <option value="return_note">İade notu</option>
        </select>
      </label>
      <label className="docf-desk-filter">
        Kayıt türü
        <select value={entityType} onChange={(event) => onChange({ entityType: event.target.value })}>
          <option value="">Tüm kayıtlar</option>
          <option value="order">Sipariş</option>
          <option value="delivery">Teslimat</option>
          <option value="invoice">Fatura</option>
          <option value="return">İade</option>
        </select>
      </label>
      <label className="docf-desk-filter">
        Müşteri
        <input placeholder="Cari adı" value={customerQuery} onChange={(event) => onChange({ customerQuery: event.target.value })} />
      </label>
      <label className="docf-desk-filter">
        İletim durumu
        <select value={deliveryStatus} onChange={(event) => onChange({ deliveryStatus: event.target.value })}>
          <option value="">Tüm durumlar</option>
          <option value="queued">Kuyrukta</option>
          <option value="sent">İletim kaydı</option>
          <option value="failed">Başarısız</option>
        </select>
      </label>
      <label className="docf-desk-filter">
        Tarih
        <select value={period} onChange={(event) => onChange({ period: event.target.value })}>
          <option value="today">Bugün</option>
          <option value="week">Bu hafta</option>
          <option value="month">Bu ay</option>
          <option value="all">Tümü</option>
        </select>
      </label>
      <p className="docf-desk-filter-hint">Filtreler liste görünümünü daraltır; canlı gönderim onay zincirinden geçer.</p>
    </div>
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
    <div className="docf-desk-list-wrap">
      <div className="docf-desk-list-head" role="row">
        <span>Belge tipi</span>
        <span>Şablon</span>
        <span>Bağlı kayıt</span>
        <span>Müşteri</span>
        <span>Oluşturma</span>
        <span>İletim</span>
        <span>AKSİYON</span>
      </div>
      <div className="docf-desk-list-body">
        {documents.map((document) => {
          const latestDelivery = document.deliveries[0];
          const deliveryClass =
            latestDelivery?.status === "sent" || latestDelivery?.status === "delivered"
              ? "docf-desk-badge docf-desk-badge--ok"
              : latestDelivery?.status === "failed"
                ? "docf-desk-badge docf-desk-badge--danger"
                : "docf-desk-badge docf-desk-badge--warn";
          return (
            <div
              key={document.id}
              role="row"
              className={`docf-desk-list-row${selectedId === document.id ? " docf-desk-list-row--selected" : ""}`}
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
                  className="docf-desk-act-btn"
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
    </div>
  );
}

export function DocumentPreviewPanel({ document }: { document: Document | null }) {
  if (!document) {
    return (
      <div className="docf-desk-side-card">
        <p className="docf-desk-side-empty">Liste yüklendiğinde ilk belge seçilir.</p>
      </div>
    );
  }
  const deliveries = document.deliveries;
  return (
    <div className="docf-desk-side-card">
      <h3>Belge önizleme</h3>
      <ul className="docf-desk-side-list">
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
        <div className="docf-table-wrap" style={{ marginTop: 8 }}>
          <p className="docf-desk-filter-hint">İletim satırları (önizleme)</p>
          <table className="docf-table">
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
      ) : null}
    </div>
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
    <div className="docf-desk-actions" aria-label="Belge işlemleri">
      <button
        className="docf-desk-btn docf-desk-btn--primary"
        type="button"
        disabled={!document}
        onClick={() => document && router.push(`/belgeler/${document.id}`)}
      >
        Önizle
      </button>
      <button className="docf-desk-btn" type="button" disabled={!document} onClick={() => void runAction("sendWhatsApp")}>
        WhatsApp
      </button>
      <button className="docf-desk-btn" type="button" disabled={!document} onClick={() => void runAction("sendEmail")}>
        E-posta
      </button>
      <button
        className="docf-desk-btn"
        type="button"
        disabled={!document}
        onClick={() => void runDownload()}
        title={canDownload ? "Belge dosyasını indir" : MSG_DOC_DOWNLOAD_PENDING}
      >
        {canDownload ? "İndir" : "İndirme bekleniyor"}
      </button>
      <button className="docf-desk-btn" type="button" disabled={!document} onClick={() => void runAction("queueSave")}>
        Arşive al
      </button>
      <button className="docf-desk-btn" type="button" disabled={!document} onClick={() => void runAction("queuePrint")}>
        Yazdırma kuyruğu
      </button>
      <button className="docf-desk-btn" type="button" disabled={!document} onClick={() => void runAction("regenerate")}>
        PDF yenile
      </button>
      <button className="docf-desk-btn" type="button" onClick={() => router.push("/archive")}>
        Arşivde gör
      </button>
      <button
        className="docf-desk-btn"
        type="button"
        disabled={!document}
        onClick={() => router.push(resolveDocumentEntityHref(document))}
      >
        İlgili kayda git
      </button>
    </div>
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
  const pageSize = ENTERPRISE_DESK_PAGE_SIZE;
  const [deskFilters, setDeskFilters] = useState({
    docType: "",
    entityType: "",
    customerQuery: "",
    deliveryStatus: "",
    period: "month"
  });

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
      .catch(() => {
        if (mounted) {
          setLoadError(MSG_DOC_LIST_UNAVAILABLE);
        }
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
    if (deskFilters.docType) {
      list = list.filter((document) => document.type === deskFilters.docType);
    }
    if (deskFilters.entityType) {
      list = list.filter((document) => document.entityType === deskFilters.entityType);
    }
    if (deskFilters.customerQuery.trim()) {
      const q = deskFilters.customerQuery.trim().toLowerCase();
      list = list.filter((document) => {
        const name = customers.find((c) => c.id === document.customerId)?.name?.toLowerCase() ?? "";
        return name.includes(q);
      });
    }
    if (deskFilters.deliveryStatus) {
      list = list.filter((document) =>
        document.deliveries.some((delivery) => delivery.status === deskFilters.deliveryStatus)
      );
    }
    return list;
  }, [documents, customerParam, typeParam, deskFilters, customers]);

  useEffect(() => {
    setPage(1);
  }, [customerParam, typeParam, documentParam, deskFilters]);

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
    <section className="docf-page docf-page--desk hz-documents-page" data-page="belgeler-reference-desk">
      <div className="docf-shell docf-shell--desk">
        <header className="docf-desk-head">
          <div className="docf-header__main">
            <span className="docf-header__icon" aria-hidden>
              <LucideIcon name="file-text" size={20} />
            </span>
            <div>
              <p className="docf-header__eyebrow">Belgeler</p>
              <h1>Belge Operasyon Masası</h1>
              <p className="docf-header__meta">
                Teklif, sipariş, tahsilat, depo, teslim, fatura ve iade belgelerini kayıt bağlamıyla yönetin.
              </p>
            </div>
          </div>
          <div className="docf-desk-head__actions">
            <Link href="/belgeler/yeni" className="docf-desk-btn docf-desk-btn--primary">
              Yeni Belge
            </Link>
            <Link href="/belgeler/sablonlar" className="docf-desk-btn">
              Şablonlar
            </Link>
            <Link href="/belgeler/arsiv" className="docf-desk-btn">
              Arşiv
            </Link>
          </div>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="docf-demo-band" role="status">
            Örnek veri modu: belge listesi demo amaçlıdır; canlı PDF üretimi veya gönderim yapılmaz.
          </p>
        ) : null}
        {contextBanner ? (
          <p className="docf-order-band hz-doc-context-band" role="status">
            {contextBanner}
          </p>
        ) : null}
        {loadError ? (
          <p className="docf-demo-band docf-demo-band--info hz-doc-context-band" role="alert">
            {loadError} {MSG_DATA_WHEN_RECONNECTED} {MSG_REFRESH_RETRY}
          </p>
        ) : null}

        <section className="docf-kpi-strip" aria-label="Belge özeti">
          <div className="docf-kpi">
            <span className="docf-kpi__label">Belge</span>
            <span className="docf-kpi__value">{filteredDocuments.length}</span>
          </div>
          <div className="docf-kpi docf-kpi--success">
            <span className="docf-kpi__label">İletim kaydı</span>
            <span className="docf-kpi__value">{sentCount}</span>
          </div>
          <div className="docf-kpi docf-kpi--warning">
            <span className="docf-kpi__label">Bekleyen</span>
            <span className="docf-kpi__value">
              {filteredDocuments.filter((item) => item.deliveries.length === 0).length}
            </span>
          </div>
          <div className="docf-kpi">
            <span className="docf-kpi__label">Belge tipi</span>
            <span className="docf-kpi__value">{new Set(filteredDocuments.map((item) => item.type)).size}</span>
          </div>
        </section>

        <div className="docf-desk-body">
          <section className="docf-desk-main" aria-label="Belge listesi">
            <DocumentFilterBar
              docType={deskFilters.docType}
              entityType={deskFilters.entityType}
              customerQuery={deskFilters.customerQuery}
              deliveryStatus={deskFilters.deliveryStatus}
              period={deskFilters.period}
              onChange={(patch) => setDeskFilters((prev) => ({ ...prev, ...patch }))}
            />
            {loading ? (
              <div className="docf-desk-state" role="status">
                <LoadingState title="Belgeler yükleniyor" message="Kayıt bağlantıları ve iletim durumları hazırlanıyor." />
              </div>
            ) : loadError || filteredDocuments.length === 0 ? (
              <EmptyState title={loadError ? "Belge listesi alınamadı" : "Belge bulunamadı"} message={emptyMessage} />
            ) : (
              <>
                <DocumentTable
                  documents={pagedDocuments}
                  customers={customers}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelectedId}
                />
                <div className="docf-desk-pagination">
                  <Pagination
                    totalItems={filteredDocuments.length}
                    pageSize={pageSize}
                    currentPage={page}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </section>

          <aside className="docf-desk-side" aria-label="Belge bağlam paneli">
            <DocumentPreviewPanel document={selected} />
            <DocumentActionsBar document={selected} />
          </aside>
        </div>
      </div>
    </section>
  );
}
