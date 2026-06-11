"use client";

import { EntityListPageTemplate, EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Invoice } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { CommercialOperasyonDeskIntro } from "../../ui-inventory/components/CommercialOperasyonDeskIntro";
import { dateLabel, money } from "../utils";
import { getInvoices } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";

function InvoiceFilterBar() {
  return (
    <section className="hz-filter-card hz-invoices-filter">
      <div className="hz-filter-grid">
        <label>
          Müşteri / fatura
          <input placeholder="Fatura veya cari ara" />
        </label>
        <label>
          Durum
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option>Taslak</option>
            <option>Kesildi</option>
            <option>İptal</option>
          </select>
        </label>
        <label>
          Tarih
          <select defaultValue="month">
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input type="checkbox" />
          Sipariş bağlantılı
        </label>
        <label>
          Ödeme
          <select defaultValue="">
            <option value="">Tüm ödemeler</option>
            <option>Ödenmedi</option>
            <option>Kısmi</option>
            <option>Ödendi</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function InvoicePreviewPanel({
  invoice,
  customerName,
  onNavigate
}: {
  invoice: Invoice | null;
  customerName: string | null;
  onNavigate: (id: string) => void;
}) {
  const { pushToast } = useToast();

  if (!invoice) {
    return (
      <aside className="hz-commercial-entity-side hz-invoices-side">
        <p className="hz-commercial-entity-side-empty">Kayıt seçilmedi.</p>
      </aside>
    );
  }

  return (
    <aside className="hz-commercial-entity-side hz-invoices-side">
      <h3>Fatura önizleme</h3>
      <ul className="hz-commercial-entity-side-list">
        <li>
          <strong>Fatura:</strong> {invoice.invoiceNo}
        </li>
        <li>
          <strong>Cari:</strong> {customerName ?? "—"}
        </li>
        <li>
          <strong>Toplam:</strong> {money(invoice.grandTotal, invoice.currency)}
        </li>
        <li>
          <strong>Durum:</strong> {getInvoiceStatusLabel(invoice.status)}
        </li>
        <li>
          <strong>Ödeme:</strong> {invoice.paymentStatus}
        </li>
        <li>
          <strong>Belge:</strong> {invoice.documentId ? "Bağlı" : "Üretilecek"}
        </li>
      </ul>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => onNavigate(invoice.id)}
        >
          Detay
        </button>
        <button
          type="button"
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => pushToast("Taslak hazırlandı: fatura gönderim belge servisine yönlendirildi.")}
        >
          Gönder
        </button>
      </div>
    </aside>
  );
}

export function InvoicesPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setLoadError(false);
    getInvoices()
      .then((result) => {
        setInvoices(result.invoices);
        setCustomers(result.customers);
      })
      .catch(() => {
        setInvoices([]);
        setCustomers([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || invoices.length === 0) {
      if (!loading && invoices.length === 0) setSelectedId(null);
      return;
    }
    if (!selectedId || !invoices.some((i) => i.id === selectedId)) {
      setSelectedId(invoices[0]?.id ?? null);
    }
  }, [loading, invoices, selectedId]);

  const selected = useMemo(() => invoices.find((i) => i.id === selectedId) ?? null, [invoices, selectedId]);
  const selectedCustomerName = useMemo(
    () => (selected ? customers.find((c) => c.id === selected.customerId)?.name ?? null : null),
    [customers, selected]
  );
  const pagedInvoices = useMemo(() => invoices.slice((page - 1) * pageSize, page * pageSize), [invoices, page]);

  const statusBadgeClass = (status: Invoice["status"]) => {
    if (status === "issued") return "hz-badge hz-badge-success";
    if (status === "cancelled") return "hz-badge hz-badge-danger";
    return "hz-badge hz-badge-warning";
  };

  return (
    <EntityListPageTemplate
      className="hz-commercial-entity-page hz-invoices-page hz-faturalar-desk"
      previewSideWidth="detail"
      header={
        <>
          <CommercialOperasyonDeskIntro
            title="Fatura Operasyon Masası"
            subtitle="Fatura taslakları, kesim ve belge dağıtım akışlarını tek ekranda yönetin."
            icon="file-text"
            actions={
              <>
                <Link href="/faturalar/yeni" className="hz-commercial-desk-btn hz-commercial-desk-btn--primary">
                  <LucideIcon name="plus" size={14} />
                  Yeni Fatura
                </Link>
                <Link
                  href="/hizli-islem/satis-masasi"
                  className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
                  title="Yeni satış veya tahsilat için Hızlı İşlem"
                >
                  <LucideIcon name="zap" size={14} />
                  Satış için Hızlı İşlem
                </Link>
                <button
                  type="button"
                  className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
                  onClick={() => pushToast("Dışa aktarma backend onay akışına bağlıdır; demo modunda simüle edildi.")}
                >
                  <LucideIcon name="download" size={14} />
                  Dışa Aktar
                </button>
              </>
            }
          />
          <div className="hz-commercial-entity-kpi-strip" aria-label="Fatura özeti">
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Kayıt</span>
              <span className="hz-commercial-entity-kpi-value">{invoices.length}</span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Kesildi</span>
              <span className="hz-commercial-entity-kpi-value">
                {invoices.filter((item) => item.status === "issued").length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Taslak</span>
              <span className="hz-commercial-entity-kpi-value">
                {invoices.filter((item) => item.status === "draft").length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Belge bağlı</span>
              <span className="hz-commercial-entity-kpi-value">
                {invoices.filter((item) => item.documentId).length}
              </span>
            </div>
          </div>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-commercial-entity-preview-band" role="status">
              Örnek veri modu: liste kayıtları demo amaçlıdır; canlı operasyon sonucu değildir.
            </p>
          ) : null}
        </>
      }
      filters={<InvoiceFilterBar />}
      list={
        <div className="hz-commercial-entity-list-wrap">
          {loading ? (
            <LoadingState title="Faturalar yükleniyor" message="Sipariş bağlantıları ve belge durumları hazırlanıyor." />
          ) : loadError ? (
            <EmptyState title="Fatura listesi alınamadı" message="Bağlantı kurulamadı. Lütfen tekrar deneyin." />
          ) : invoices.length === 0 ? (
            <EmptyState title="Fatura bulunamadı" message="Kayıt yok veya filtre sonucu boş." />
          ) : (
            <>
              <div className="hz-commercial-entity-table-head hz-invoices-table-head" role="row">
                <span>Fatura no</span>
                <span>Cari</span>
                <span>Toplam</span>
                <span>Durum</span>
                <span>Tarih</span>
                <span>Sipariş</span>
                <span>AKSİYON</span>
              </div>
              <div className="hz-commercial-entity-table-body">
                {pagedInvoices.map((invoice) => {
                  const customerName = customers.find((c) => c.id === invoice.customerId)?.name ?? "—";
                  return (
                    <div
                      key={invoice.id}
                      role="row"
                      className={`hz-commercial-entity-table-row hz-invoices-table-row${selectedId === invoice.id ? " is-selected" : ""}`}
                      onClick={() => setSelectedId(invoice.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedId(invoice.id);
                      }}
                      tabIndex={0}
                    >
                      <span>{invoice.invoiceNo}</span>
                      <span>{customerName}</span>
                      <span>{money(invoice.grandTotal, invoice.currency)}</span>
                      <span>
                        <span className={statusBadgeClass(invoice.status)}>{getInvoiceStatusLabel(invoice.status)}</span>
                      </span>
                      <span>{dateLabel(invoice.issueDate ?? invoice.createdAt)}</span>
                      <span>{invoice.orderNo ?? "—"}</span>
                      <span>
                        <button
                          type="button"
                          className="hz-commercial-entity-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/faturalar/${invoice.id}`);
                          }}
                        >
                          İncele
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
              <Pagination totalItems={invoices.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )}
        </div>
      }
      preview={
        <InvoicePreviewPanel
          invoice={selected}
          customerName={selectedCustomerName}
          onNavigate={(id) => router.push(`/faturalar/${id}`)}
        />
      }
    />
  );
}
