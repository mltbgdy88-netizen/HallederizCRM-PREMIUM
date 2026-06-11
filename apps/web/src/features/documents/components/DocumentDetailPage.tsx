"use client";

import { EmptyState, LoadingState } from "@hallederiz/ui";
import type { Customer, Document } from "@hallederiz/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import type { DocumentOutputJobRow, LocalAgentHealthSnapshot } from "../../../services/api/documents.service";
import { useToast } from "../../../providers/toast-provider";
import { getDocumentTypeLabel, getDocumentDeliveryStatusLabel } from "../queries/document-mock-data";
import { getDocumentDetail } from "../queries/get-documents";
import { formatDocumentDeliveryChannel, formatDocumentEntityType } from "../utils/document-faz-f";
import { MSG_DOC_DOWNLOAD_PENDING } from "../data/document-action-messages";
import {
  extractDownloadUrlFromDocument,
  hasDownloadablePdf,
  fetchDocumentDownloadLink,
  runDocumentLiveAction,
  sanitizeDocumentUserText
} from "../utils/document-action-feedback";
import { dateLabel } from "../utils";
import { EntityTimelinePanel } from "../../shared/components/EntityTimelinePanel";
import {
  buildDocumentHeaderMeta,
  buildDocumentInfoFields,
  buildDocumentReferenceKpis
} from "../utils/map-document-detail-to-reference";

function DocumentActions({ document, onReload }: { document: Document | null; onReload: () => Promise<void> }) {
  const router = useRouter();
  const { pushToast } = useToast();

  const run = async (action: "queueSave" | "queuePrint" | "regenerate" | "sendWhatsApp" | "sendEmail") => {
    if (!document) {
      return;
    }
    const outcome = await runDocumentLiveAction(action, document.id, {
      useDemoData: dataSourceConfig.useDemoData
    });
    for (const toast of outcome.toasts) {
      pushToast(toast);
    }
    if (outcome.ok) {
      await onReload();
    }
  };

  const downloadUrl = document ? extractDownloadUrlFromDocument(document) : null;
  const canDownload = hasDownloadablePdf(document, { extraUrl: downloadUrl });

  const runDownload = () => {
    if (!document) {
      return;
    }
    if (canDownload && downloadUrl) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    pushToast(MSG_DOC_DOWNLOAD_PENDING);
  };

  return (
    <section className="hz-action-toolbar">
      <button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={() => void run("regenerate")}>
        PDF yenile
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void run("queueSave")}>
        Arşive al
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void run("queuePrint")}>
        Yazdırma kuyruğu
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void run("sendWhatsApp")}>
        WhatsApp gönder
      </button>
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => void run("sendEmail")}>
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
      <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => router.push("/belgeler")}>
        Listeye dön
      </button>
    </section>
  );
}

function DocumentSummary({ document, customer }: { document: Document; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Belge özeti</h3>
      <ul className="hz-side-list">
        <li>Belge no: {document.documentNo}</li>
        <li>Belge tipi: {getDocumentTypeLabel(document.type)}</li>
        <li>Bağlı kayıt: {document.entityNo}</li>
        <li>Müşteri: {customer?.name ?? "—"}</li>
        <li>Oluşturma: {dateLabel(document.createdAt)}</li>
      </ul>
    </section>
  );
}

function DocumentPreview({ document }: { document: Document }) {
  const canPreview = hasDownloadablePdf(document);
  return (
    <section className="hz-content-card">
      <h3>Önizleme</h3>
      {canPreview ? (
        <p className="hz-content-card-description">
          Belge dosyası hazır. İndir veya yazdırma kuyruğuna ekleyebilirsiniz.
        </p>
      ) : (
        <div className="hz-print-export-panel" role="status">
          <p className="hz-print-export-panel-title">Önizleme kullanılamıyor</p>
          <p className="hz-print-export-panel-desc">
            {dataSourceConfig.useDemoData
              ? "Örnek veri modunda PDF önizlemesi gösterilmez."
              : "Canlı belge servisi bağlandığında önizleme açılır."}
          </p>
        </div>
      )}
      {document.previewText && canPreview ? (
        <p className="muted hz-margin-top-sm">{sanitizeDocumentUserText(document.previewText)}</p>
      ) : null}
      <div className="hz-inline-note hz-margin-top-sm">
        <span className="hz-inline-note-label">Kayıt</span>
        <Link href="/belgeler" className="hz-inline-note-value">
          {formatDocumentEntityType(document.entityType)} / {document.entityNo}
        </Link>
      </div>
    </section>
  );
}

function DocumentDeliveryHistory({ document }: { document: Document }) {
  return (
    <section className="hz-content-card">
      <h3>İletim geçmişi</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Kanal</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Alıcı</th>
            </tr>
          </thead>
          <tbody>
            {document.deliveries.length === 0 ? (
              <tr>
                <td colSpan={4}>Henüz iletim kaydı yok.</td>
              </tr>
            ) : (
              document.deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{formatDocumentDeliveryChannel(delivery.channel)}</td>
                  <td>{getDocumentDeliveryStatusLabel(delivery.status)}</td>
                  <td>{dateLabel(delivery.requestedAt)}</td>
                  <td>{delivery.recipient ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatOutputJobStatus(status: string): string {
  if (status === "queued") return "Kuyrukta";
  if (status === "completed") return "Tamamlandı";
  if (status === "failed") return "Başarısız";
  return status;
}

function DocumentOutputJobs({
  printJobs,
  fileSaveJobs,
  localAgentHealth
}: {
  printJobs: DocumentOutputJobRow[];
  fileSaveJobs: DocumentOutputJobRow[];
  localAgentHealth: LocalAgentHealthSnapshot | null;
}) {
  return (
    <section className="hz-content-card">
      <h3>Yazdırma ve kayıt kuyruğu</h3>
      <div className="detail-list">
        <span>Yerel aracı durumu</span>
        <strong>{localAgentHealth?.status ?? "Bağlı değil"}</strong>
        <span>Çalışma modu</span>
        <strong>{localAgentHealth?.mode ?? "—"}</strong>
        <span>Son kontrol</span>
        <strong>{localAgentHealth?.lastCheckedAt ? dateLabel(localAgentHealth.lastCheckedAt) : "—"}</strong>
      </div>
      <div className="table-wrap hz-table-wrap" style={{ marginTop: "12px" }}>
        <table className="table hz-table">
          <thead>
            <tr>
              <th>İş tipi</th>
              <th>İş no</th>
              <th>Durum</th>
              <th>Kuyruğa alınma</th>
              <th>Bitiş</th>
            </tr>
          </thead>
          <tbody>
            {[...fileSaveJobs.map((job) => ({ ...job, kind: "Arşiv kaydı" })), ...printJobs.map((job) => ({ ...job, kind: "Yazdırma" }))]
              .slice(0, 8)
              .map((job) => (
                <tr key={job.id}>
                  <td>{job.kind}</td>
                  <td>{job.id}</td>
                  <td>{formatOutputJobStatus(job.status)}</td>
                  <td>{dateLabel(job.queuedAt)}</td>
                  <td>{job.completedAt ? dateLabel(job.completedAt) : "—"}</td>
                </tr>
              ))}
            {printJobs.length + fileSaveJobs.length === 0 ? (
              <tr>
                <td colSpan={5}>Bu belgeye bağlı kuyruk işi henüz oluşmadı.</td>
              </tr>
            ) : null}
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
  const [printJobs, setPrintJobs] = useState<DocumentOutputJobRow[]>([]);
  const [fileSaveJobs, setFileSaveJobs] = useState<DocumentOutputJobRow[]>([]);
  const [localAgentHealth, setLocalAgentHealth] = useState<LocalAgentHealthSnapshot | null>(null);

  const load = async () => {
    setLoading(true);
    const result = await getDocumentDetail(documentId);
    setDocument(result.document);
    setCustomers(result.customers);
    setPrintJobs(result.printJobs);
    setFileSaveJobs(result.fileSaveJobs);
    setLocalAgentHealth(result.localAgentHealth);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [documentId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === document?.customerId) ?? null,
    [customers, document?.customerId]
  );

  const kpis = useMemo(() => (document ? buildDocumentReferenceKpis(document) : []), [document]);
  const infoFields = useMemo(
    () => (document ? buildDocumentInfoFields(document, customer) : []),
    [document, customer]
  );

  if (loading) {
    return (
      <section className="docf-page hz-documents-detail-page">
        <div className="docf-state" role="status" aria-live="polite">
          <div className="docf-state__spinner" aria-hidden />
          <h2>Belge yükleniyor</h2>
          <p>Belge detayı ve iletim geçmişi getiriliyor.</p>
        </div>
      </section>
    );
  }

  if (!document) {
    return (
      <section className="docf-page hz-documents-detail-page">
        <div className="docf-state" role="alert">
          <h2>Belge bulunamadı</h2>
          <p>İstenen belge kaydı bulunamadı veya erişim kapsamında değil.</p>
          <Link href="/belgeler" className="docf-state__link">
            Belge listesine dön
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="docf-page hz-documents-detail-page">
      <div className="docf-shell">
        <header className="docf-header">
          <div className="docf-header__main">
            <p className="docf-header__eyebrow">Belgeler</p>
            <h1>Belge Detayı</h1>
            <p className="docf-header__meta">{buildDocumentHeaderMeta(document, customer)}</p>
          </div>
          <Link href="/belgeler" className="docf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="docf-demo-band" role="status">
            Örnek veri modu: bu belge demo amaçlıdır; PDF üretimi ve gönderim canlıda bağlı değildir.
          </p>
        ) : null}

        <section className="docf-kpi-strip" aria-label="Belge özeti">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`docf-kpi${kpi.tone === "success" ? " docf-kpi--success" : kpi.tone === "warning" ? " docf-kpi--warning" : ""}`}
            >
              <span className="docf-kpi__label">{kpi.label}</span>
              <span className="docf-kpi__value">{kpi.value}</span>
            </div>
          ))}
        </section>

        <main className="docf-layout">
          <section className="docf-main">
            <section className="docf-section" aria-label="Belge bilgileri">
              <header className="docf-section__head">
                <h2>Belge bilgileri</h2>
              </header>
              <div className="docf-field-grid">
                {infoFields.map((field) => (
                  <label key={field.label} className={`docf-field${field.full ? " docf-field--full" : ""}`}>
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </label>
                ))}
              </div>
            </section>
            <DocumentActions document={document} onReload={load} />
            <DocumentPreview document={document} />
            <DocumentDeliveryHistory document={document} />
            <DocumentOutputJobs printJobs={printJobs} fileSaveJobs={fileSaveJobs} localAgentHealth={localAgentHealth} />
          </section>
          <aside className="docf-side">
            <DocumentSummary document={document} customer={customer} />
            <section className="docf-side-card" aria-label="Paylaşım ve gönderim">
              <header className="docf-side-card__head">
                <h3>Paylaşım</h3>
              </header>
              <p className="docf-section__desc">WhatsApp ve e-posta gönderimi onay zincirinden geçer; bu ekranda toast-only çalışır.</p>
            </section>
            <EntityTimelinePanel entityType="document" entityId={document.id} />
          </aside>
        </main>
      </div>
    </section>
  );
}
