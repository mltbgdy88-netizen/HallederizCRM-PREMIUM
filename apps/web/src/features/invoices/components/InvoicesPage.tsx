"use client";

import { EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Invoice } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { ENTERPRISE_DESK_PAGE_SIZE } from "../../../lib/enterprise-desk-constants";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { dateLabel, money } from "../utils";
import { getInvoices } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";

type InvoiceFilters = {
  query: string;
  status: string;
  period: string;
  orderLinked: boolean;
  payment: string;
};

function InvoiceFilterBar({
  filters,
  onChange,
  onReset
}: {
  filters: InvoiceFilters;
  onChange: (patch: Partial<InvoiceFilters>) => void;
  onReset: () => void;
}) {
  return (
    <section className="hz-filter-card hz-invoices-filter" aria-label="Fatura filtreleri">
      <div className="hz-filter-grid">
        <label>
          Müşteri / fatura
          <input
            placeholder="Fatura veya cari ara"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
          />
        </label>
        <label>
          Durum
          <select value={filters.status} onChange={(event) => onChange({ status: event.target.value })}>
            <option value="">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="issued">Kesildi</option>
            <option value="cancelled">İptal</option>
          </select>
        </label>
        <label>
          Tarih
          <select value={filters.period} onChange={(event) => onChange({ period: event.target.value })}>
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
            <option value="all">Tümü</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input
            type="checkbox"
            checked={filters.orderLinked}
            onChange={(event) => onChange({ orderLinked: event.target.checked })}
          />
          Sipariş bağlantılı
        </label>
        <label>
          Ödeme
          <select value={filters.payment} onChange={(event) => onChange({ payment: event.target.value })}>
            <option value="">Tüm ödemeler</option>
            <option value="unpaid">Ödenmedi</option>
            <option value="partial">Kısmi</option>
            <option value="paid">Ödendi</option>
          </select>
        </label>
      </div>
      <p className="hz-invoices-filter-hint">Filtreler liste görünümünü daraltır; canlı kesim ve gönderim onay zincirinden geçer.</p>
      <button type="button" className="hz-commercial-desk-btn hz-commercial-desk-btn--ghost" onClick={onReset}>
        Sıfırla
      </button>
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
      <aside className="hz-commercial-desk-side hz-invoices-side">
        <EmptyState title="Kayıt seçilmedi" message="Listeden bir fatura seçin veya yeni kayıt oluşturun." />
      </aside>
    );
  }

  return (
    <aside className="hz-commercial-desk-side hz-invoices-side hz-commercial-desk-card">
      <h3>Fatura özeti</h3>
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
      <div className="hz-invoices-side-actions">
        <button type="button" className="hz-commercial-desk-btn hz-commercial-desk-btn--primary" onClick={() => onNavigate(invoice.id)}>
          Detay
        </button>
        <button
          type="button"
          className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
          onClick={() => pushToast("Gönderim belge servisi ve onay zinciri bağlandığında etkinleşir.")}
        >
          Gönder
        </button>
      </div>
    </aside>
  );
}

function matchesInvoiceFilters(invoice: Invoice, filters: InvoiceFilters, customerName: string): boolean {
  const q = filters.query.trim().toLowerCase();
  if (q && !invoice.invoiceNo.toLowerCase().includes(q) && !customerName.toLowerCase().includes(q)) {
    return false;
  }
  if (filters.status && invoice.status !== filters.status) {
    return false;
  }
  if (filters.orderLinked && !invoice.orderNo) {
    return false;
  }
  if (filters.payment === "unpaid" && invoice.paymentStatus !== "unpaid") return false;
  if (filters.payment === "partial" && invoice.paymentStatus !== "partial") return false;
  if (filters.payment === "paid" && invoice.paymentStatus !== "paid") return false;
  return true;
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
  const [filters, setFilters] = useState<InvoiceFilters>({
    query: "",
    status: "",
    period: "month",
    orderLinked: false,
    payment: ""
  });

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

  const customerNameById = useMemo(() => new Map(customers.map((c) => [c.id, c.name])), [customers]);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        matchesInvoiceFilters(invoice, filters, customerNameById.get(invoice.customerId) ?? "")
      ),
    [invoices, filters, customerNameById]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (loading || filteredInvoices.length === 0) {
      if (!loading && filteredInvoices.length === 0) setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredInvoices.some((i) => i.id === selectedId)) {
      setSelectedId(filteredInvoices[0]?.id ?? null);
    }
  }, [loading, filteredInvoices, selectedId]);

  const selected = useMemo(
    () => filteredInvoices.find((i) => i.id === selectedId) ?? null,
    [filteredInvoices, selectedId]
  );
  const selectedCustomerName = useMemo(
    () => (selected ? customerNameById.get(selected.customerId) ?? null : null),
    [selected, customerNameById]
  );
  const pagedInvoices = useMemo(
    () => filteredInvoices.slice((page - 1) * ENTERPRISE_DESK_PAGE_SIZE, page * ENTERPRISE_DESK_PAGE_SIZE),
    [filteredInvoices, page]
  );

  const statusBadgeClass = (status: Invoice["status"]) => {
    if (status === "issued") return "hz-badge hz-badge-success";
    if (status === "cancelled") return "hz-badge hz-badge-danger";
    return "hz-badge hz-badge-warning";
  };

  return (
    <main className="hz-invoices-page hz-commercial-desk-standard">
      <div className="hz-commercial-desk-shell">
        <header className="hz-commercial-desk-header">
          <div>
            <h1>Fatura Operasyon Masası</h1>
            <p>Fatura taslakları, kesim ve belge dağıtım akışlarını tek ekranda yönetin.</p>
          </div>
          <div className="hz-commercial-desk-header__actions">
            <Link href="/faturalar/yeni" className="hz-commercial-desk-btn hz-commercial-desk-btn--primary">
              <LucideIcon name="plus" size={14} />
              Yeni Fatura
            </Link>
            <Link href="/hizli-islem/satis-masasi" className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary" title="Satış ve tahsilat için Hızlı İşlem">
              <LucideIcon name="zap" size={14} />
              Hızlı İşlem
            </Link>
            <button
              type="button"
              className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
              onClick={() => pushToast("Dışa aktarma onay ve denetim zincirine bağlıdır.")}
            >
              <LucideIcon name="download" size={14} />
              Dışa Aktar
            </button>
          </div>
        </header>

        <section className="hz-commercial-desk-kpis hz-commercial-entity-kpi-strip" aria-label="Fatura özeti">
          <div className="hz-commercial-entity-kpi">
            <span className="hz-commercial-entity-kpi-label">Kayıt</span>
            <span className="hz-commercial-entity-kpi-value">{filteredInvoices.length}</span>
          </div>
          <div className="hz-commercial-entity-kpi">
            <span className="hz-commercial-entity-kpi-label">Kesildi</span>
            <span className="hz-commercial-entity-kpi-value">
              {filteredInvoices.filter((item) => item.status === "issued").length}
            </span>
          </div>
          <div className="hz-commercial-entity-kpi">
            <span className="hz-commercial-entity-kpi-label">Taslak</span>
            <span className="hz-commercial-entity-kpi-value">
              {filteredInvoices.filter((item) => item.status === "draft").length}
            </span>
          </div>
          <div className="hz-commercial-entity-kpi">
            <span className="hz-commercial-entity-kpi-label">Belge bağlı</span>
            <span className="hz-commercial-entity-kpi-value">
              {filteredInvoices.filter((item) => item.documentId).length}
            </span>
          </div>
        </section>

        {dataSourceConfig.useDemoData ? (
          <p className="hz-commercial-desk-preview-band" role="status">
            Örnek veri modu: liste kayıtları demo amaçlıdır.
          </p>
        ) : null}

        <div className="hz-commercial-desk-body">
          <section className="hz-commercial-desk-main hz-commercial-desk-card">
            <InvoiceFilterBar
              filters={filters}
              onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              onReset={() =>
                setFilters({ query: "", status: "", period: "month", orderLinked: false, payment: "" })
              }
            />
            {loading ? (
              <LoadingState title="Faturalar yükleniyor" message="Sipariş bağlantıları ve belge durumları hazırlanıyor." />
            ) : loadError ? (
              <EmptyState title="Fatura listesi alınamadı" message="Bağlantı kurulamadı. Lütfen tekrar deneyin." />
            ) : filteredInvoices.length === 0 ? (
              <EmptyState title="Fatura bulunamadı" message="Kayıt yok veya filtre sonucu boş." />
            ) : (
              <>
                <div className="hz-commercial-entity-list-wrap hz-commercial-desk-scroll">
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
                      const customerName = customerNameById.get(invoice.customerId) ?? "—";
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
                </div>
                <Pagination
                  totalItems={filteredInvoices.length}
                  pageSize={ENTERPRISE_DESK_PAGE_SIZE}
                  currentPage={page}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
          <InvoicePreviewPanel
            invoice={selected}
            customerName={selectedCustomerName}
            onNavigate={(id) => router.push(`/faturalar/${id}`)}
          />
        </div>
      </div>
    </main>
  );
}
