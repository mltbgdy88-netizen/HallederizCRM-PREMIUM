"use client";

import { EmptyState, EntityDetailLayout, LoadingState, PageHeader } from "@hallederiz/ui";
import type { Customer, Invoice } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { money } from "../utils";
import { getInvoiceDetail } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";
import { useToast } from "../../../providers/toast-provider";

export function InvoiceHeaderInfo({ invoice, customer }: { invoice: Invoice; customer: Customer | null }) {
  return (
    <section className="hz-content-card hz-invoices-detail-summary">
      <p className="drawer-eyebrow">Fatura</p>
      <h2>{invoice.invoiceNo}</h2>
      <p className="muted">
        {customer?.name ?? "—"} · {invoice.orderNo ?? "Sipariş bağlantısı yok"}
      </p>
      <div className="hz-inline-actions">
        <span className="hz-badge hz-badge-info">{getInvoiceStatusLabel(invoice.status)}</span>
        <span className="hz-badge hz-badge-warning">{invoice.paymentStatus}</span>
      </div>
    </section>
  );
}

export function InvoiceActionsBar({ onIssue }: { onIssue: () => void }) {
  const { pushToast } = useToast();
  const [created, setCreated] = useState(false);
  const [sent, setSent] = useState(false);

  function handleCreate() {
    setCreated(true);
    pushToast("Taslak hazırlandı: fatura oluşturma onay akışına iletildi.");
  }

  function handleSend() {
    setSent(true);
    pushToast("Taslak hazırlandı: gönderim belge servisine yönlendirildi.");
  }

  return (
    <section className="hz-content-card hz-invoices-detail-actions">
      <h3>İşlemler</h3>
      <p className="muted">Fatura kesim ve belge adımları mevcut iş akışıyla ilerler.</p>
      <div className="hz-inline-actions">
        <button
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          type="button"
          onClick={handleCreate}
          disabled={created}
        >
          {created ? "Oluşturuldu" : "Faturayı oluştur"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={onIssue}
        >
          Kes
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazırlandı: iptal işlemi onay akışına iletildi.")}
        >
          İptal et
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          disabled
          title="Canlı belge servisi bekleniyor"
        >
          PDF önizle
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={handleSend}
          disabled={sent}
        >
          {sent ? "Gönderildi" : "Gönder"}
        </button>
      </div>
    </section>
  );
}

export function InvoiceLineTable({ invoice }: { invoice: Invoice }) {
  return (
    <section className="hz-content-card">
      <h3>Fatura satırları</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Ürün kodu</th>
              <th>Ürün adı</th>
              <th>Adet</th>
              <th>Birim</th>
              <th>KDV</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>{money(line.unitPrice, line.currency)}</td>
                <td>{money(line.taxTotal, line.currency)}</td>
                <td>{money(line.lineTotal, line.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function InvoiceSummaryPanel({ invoice }: { invoice: Invoice }) {
  return (
    <section className="hz-content-card">
      <h3>Fatura özeti</h3>
      <ul className="hz-side-list">
        <li>Ara toplam: {money(invoice.subtotal, invoice.currency)}</li>
        <li>KDV: {money(invoice.taxTotal, invoice.currency)}</li>
        <li>Genel toplam: {money(invoice.grandTotal, invoice.currency)}</li>
        <li>Sipariş: {invoice.orderNo ?? "—"}</li>
      </ul>
      <p className="muted hz-margin-top-sm">PDF önizleme ve gönderim canlı belge servisi bekleniyor.</p>
    </section>
  );
}

export function InvoiceIssueDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    pushToast("Taslak hazırlandı: fatura kesim işlemi onay akışına iletildi.");
    setTimeout(onClose, 800);
  }

  if (!open) return null;
  return (
    <div className="hz-modal-overlay" onClick={onClose}>
      <section className="hz-modal offer-small-modal" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Fatura kes</p>
            <h3>Kesim onayı</h3>
            <p className="muted">E-fatura ve ERP bağlantısı entegrasyon adımında bağlanacak.</p>
          </div>
          <button className="hz-btn hz-btn-secondary" type="button" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="hz-modal-content">
          <button
            className="hz-btn hz-btn-primary hz-toolbar-btn"
            type="button"
            onClick={handleConfirm}
            disabled={confirmed}
          >
            {confirmed ? "İletildi" : "Onayla"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId?: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);

  useEffect(() => {
    getInvoiceDetail(invoiceId)
      .then((result) => {
        setInvoice(result.invoice);
        setCustomers(result.customers);
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === invoice?.customerId) ?? null,
    [customers, invoice?.customerId]
  );

  if (loading) {
    return <LoadingState title="Fatura yükleniyor" message="Satırlar ve belge işlemleri hazırlanıyor." />;
  }
  if (!invoice) {
    return <EmptyState title="Fatura bulunamadı" message="Seçilen fatura bulunamadı." />;
  }

  return (
    <EntityDetailLayout
      className="hz-commercial-entity-detail-page hz-invoices-detail-page"
      header={
        <PageHeader
          title={invoiceId ? "Fatura detayı" : "Yeni fatura"}
          description="Fatura özeti, satırlar, sipariş bağlantısı ve belge işlemleri."
          breadcrumb={invoice.invoiceNo}
        />
      }
      summary={<InvoiceHeaderInfo invoice={invoice} customer={customer} />}
      sections={
        <>
          <InvoiceActionsBar onIssue={() => setIssueOpen(true)} />
          <InvoiceLineTable invoice={invoice} />
        </>
      }
      sidebar={<InvoiceSummaryPanel invoice={invoice} />}
      footer={<InvoiceIssueDialog open={issueOpen} onClose={() => setIssueOpen(false)} />}
    />
  );
}
