"use client";

import Link from "next/link";
import type { Customer, Invoice } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { money } from "../utils";
import { getInvoiceDetail } from "../queries/get-invoices";
import { getInvoiceStatusLabel } from "../queries/invoice-mock-data";
import { useToast } from "../../../providers/toast-provider";
import {
  buildInvoiceHeaderMeta,
  buildInvoiceInfoFields,
  buildInvoiceReferenceKpis,
  deliveryStatusLabel,
  paymentStatusLabel
} from "../utils/map-invoice-detail-to-reference";

export function InvoiceHeaderInfo({
  invoice,
  customer,
  variant = "legacy"
}: {
  invoice: Invoice;
  customer: Customer | null;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    const fields = buildInvoiceInfoFields(invoice, customer);
    return (
      <section className="invf-section" aria-label="Fatura bilgileri">
        <header className="invf-section__head">
          <h2>Fatura bilgileri</h2>
          <span className="invf-badge invf-badge--info">{getInvoiceStatusLabel(invoice.status)}</span>
        </header>
        <div className="invf-field-grid">
          {fields.map((field) => (
            <label key={field.label} className={`invf-field${field.full ? " invf-field--full" : ""}`}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </label>
          ))}
        </div>
      </section>
    );
  }

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

export function InvoiceActionsBar({
  onIssue,
  variant = "legacy"
}: {
  onIssue: () => void;
  variant?: "legacy" | "reference";
}) {
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

  if (variant === "reference") {
    return (
      <section className="invf-actions" aria-label="Fatura işlemleri">
        <h3 className="invf-actions__title">İşlemler</h3>
        <div className="invf-actions__grid">
          <button type="button" className="invf-actions__btn invf-actions__btn--primary" onClick={handleCreate} disabled={created}>
            {created ? "Oluşturuldu" : "Faturayı oluştur"}
          </button>
          <button type="button" className="invf-actions__btn" onClick={onIssue}>
            Kes
          </button>
          <button type="button" className="invf-actions__btn" onClick={() => pushToast("Taslak hazırlandı: iptal işlemi onay akışına iletildi.")}>
            İptal et
          </button>
          <button type="button" className="invf-actions__btn" disabled title="Canlı belge servisi bekleniyor">
            PDF önizle
          </button>
          <button type="button" className="invf-actions__btn" onClick={handleSend} disabled={sent}>
            {sent ? "Gönderildi" : "Gönder"}
          </button>
        </div>
        <p className="invf-actions__note">Aksiyonlar demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
      </section>
    );
  }

  return (
    <section className="hz-content-card hz-invoices-detail-actions">
      <h3>İşlemler</h3>
      <p className="muted">Fatura kesim ve belge adımları mevcut iş akışıyla ilerler.</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={handleCreate} disabled={created}>
          {created ? "Oluşturuldu" : "Faturayı oluştur"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={onIssue}>
          Kes
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazırlandı: iptal işlemi onay akışına iletildi.")}
        >
          İptal et
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" disabled title="Canlı belge servisi bekleniyor">
          PDF önizle
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={handleSend} disabled={sent}>
          {sent ? "Gönderildi" : "Gönder"}
        </button>
      </div>
    </section>
  );
}

export function InvoiceLineTable({
  invoice,
  variant = "legacy"
}: {
  invoice: Invoice;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="invf-section" aria-label="Fatura satırları">
        <header className="invf-section__head">
          <h2>Fatura satırları</h2>
        </header>
        <div className="invf-table-wrap">
          <table className="invf-table">
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

export function InvoiceSummaryPanel({
  invoice,
  variant = "legacy"
}: {
  invoice: Invoice;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="invf-section" aria-label="Fatura özeti">
        <header className="invf-section__head">
          <h2>Özet / toplam</h2>
        </header>
        <ul className="invf-total-list">
          <li>
            <span>Ara toplam</span>
            <strong>{money(invoice.subtotal, invoice.currency)}</strong>
          </li>
          <li>
            <span>KDV</span>
            <strong>{money(invoice.taxTotal, invoice.currency)}</strong>
          </li>
          <li className="invf-total-list__grand">
            <span>Genel toplam</span>
            <strong>{money(invoice.grandTotal, invoice.currency)}</strong>
          </li>
        </ul>
      </section>
    );
  }

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

export function InvoiceDeliveryStatusCard({ invoice }: { invoice: Invoice }) {
  return (
    <section className="invf-section" aria-label="Belge ve gönderim durumu">
      <header className="invf-section__head">
        <h2>Belge / gönderim</h2>
      </header>
      <ul className="invf-check-list">
        <li>Gönderim durumu: {deliveryStatusLabel(invoice.deliveryStatus)}</li>
        <li>Belge kaydı: {invoice.documentId ?? "—"}</li>
        <li>PDF önizleme: Canlı belge servisi bekleniyor</li>
      </ul>
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
    <div className="invf-modal-overlay" onClick={onClose}>
      <section className="invf-modal" onClick={(event) => event.stopPropagation()}>
        <header className="invf-modal__head">
          <div>
            <p className="invf-modal__eyebrow">Fatura kes</p>
            <h3>Kesim onayı</h3>
            <p className="invf-modal__desc">E-fatura ve ERP bağlantısı entegrasyon adımında bağlanacak.</p>
          </div>
          <button className="invf-actions__btn" type="button" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="invf-modal__body">
          <button type="button" className="invf-actions__btn invf-actions__btn--primary" onClick={handleConfirm} disabled={confirmed}>
            {confirmed ? "İletildi" : "Onayla"}
          </button>
        </div>
      </section>
    </div>
  );
}

function InvoiceReferenceKpiStrip({ kpis }: { kpis: ReturnType<typeof buildInvoiceReferenceKpis> }) {
  return (
    <section className="invf-kpi-strip" aria-label="Fatura özeti">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`invf-kpi${kpi.tone === "success" ? " invf-kpi--success" : kpi.tone === "warning" ? " invf-kpi--warning" : ""}`}
        >
          <span className="invf-kpi__label">{kpi.label}</span>
          <span className="invf-kpi__value">{kpi.value}</span>
          {kpi.hint ? <span className="invf-kpi__hint">{kpi.hint}</span> : null}
        </div>
      ))}
    </section>
  );
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getInvoiceDetail(invoiceId)
      .then((result) => {
        if (!mounted) return;
        setInvoice(result.invoice);
        setCustomers(result.customers);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === invoice?.customerId) ?? null,
    [customers, invoice?.customerId]
  );

  const kpis = useMemo(() => (invoice ? buildInvoiceReferenceKpis(invoice) : []), [invoice]);

  if (loading) {
    return (
      <section className="invf-page hz-invoices-detail-page">
        <div className="invf-state" role="status" aria-live="polite">
          <div className="invf-state__spinner" aria-hidden />
          <h2>Fatura yükleniyor</h2>
          <p>Satırlar ve belge işlemleri hazırlanıyor.</p>
        </div>
      </section>
    );
  }

  if (!invoice) {
    return (
      <section className="invf-page hz-invoices-detail-page">
        <div className="invf-state" role="alert">
          <h2>Fatura bulunamadı</h2>
          <p>Seçilen fatura bulunamadı veya erişim kapsamında değil.</p>
          <Link href="/faturalar" className="invf-state__link">
            Faturalar listesine dön
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="invf-page hz-invoices-detail-page">
        <div className="invf-shell">
          <header className="invf-header">
            <div className="invf-header__main">
              <p className="invf-header__eyebrow">Faturalar</p>
              <h1>Fatura Detayı</h1>
              <p className="invf-header__meta">{buildInvoiceHeaderMeta(invoice, customer)}</p>
            </div>
            <Link href="/faturalar" className="invf-header__back">
              ← Listeye dön
            </Link>
          </header>

          {dataSourceConfig.useDemoData ? (
            <p className="invf-demo-band" role="status">
              Örnek veri modu: bu kayıt demo amaçlıdır; kes, gönder veya iptal canlıda bağlı değildir.
            </p>
          ) : null}

          <InvoiceReferenceKpiStrip kpis={kpis} />

          <main className="invf-layout">
            <section className="invf-main">
              <InvoiceHeaderInfo invoice={invoice} customer={customer} variant="reference" />
              <InvoiceLineTable invoice={invoice} variant="reference" />
              <InvoiceSummaryPanel invoice={invoice} variant="reference" />
              <InvoiceDeliveryStatusCard invoice={invoice} />
            </section>
            <aside className="invf-side">
              <section className="invf-side-card" aria-label="Durum paneli">
                <header className="invf-side-card__head">
                  <h3>Durum</h3>
                  <span className="invf-badge invf-badge--info">{getInvoiceStatusLabel(invoice.status)}</span>
                </header>
                <ul className="invf-side-list">
                  <li>
                    <span>Fatura durumu</span>
                    <strong>{getInvoiceStatusLabel(invoice.status)}</strong>
                  </li>
                  <li>
                    <span>Tahsilat</span>
                    <strong>{paymentStatusLabel(invoice.paymentStatus)}</strong>
                  </li>
                  <li>
                    <span>Gönderim</span>
                    <strong>{deliveryStatusLabel(invoice.deliveryStatus)}</strong>
                  </li>
                </ul>
              </section>

              <section className="invf-side-card" aria-label="Cari paneli">
                <header className="invf-side-card__head">
                  <h3>Cari</h3>
                </header>
                <ul className="invf-side-list">
                  <li>
                    <span>Ad</span>
                    <strong>{customer?.name ?? "—"}</strong>
                  </li>
                  <li>
                    <span>Sipariş</span>
                    <strong>{invoice.orderNo ?? "—"}</strong>
                  </li>
                </ul>
                {invoice.orderId ? (
                  <Link href={`/siparisler/${invoice.orderId}`} className="invf-side-link">
                    Sipariş detayına git
                  </Link>
                ) : null}
              </section>

              <section className="invf-side-card" aria-label="Tahsilat bağlantısı">
                <header className="invf-side-card__head">
                  <h3>Tahsilat</h3>
                </header>
                <ul className="invf-side-list">
                  <li>
                    <span>Ödeme durumu</span>
                    <strong>{paymentStatusLabel(invoice.paymentStatus)}</strong>
                  </li>
                </ul>
                {invoice.orderId && invoice.paymentStatus !== "paid" ? (
                  <Link href={`/tahsilatlar/yeni?order=${invoice.orderId}`} className="invf-side-link">
                    Tahsilat girişi (sipariş bağlamı)
                  </Link>
                ) : null}
              </section>

              <section className="invf-side-card" aria-label="Belge paneli">
                <header className="invf-side-card__head">
                  <h3>Belge / PDF</h3>
                </header>
                <ul className="invf-side-list">
                  <li>
                    <span>Belge kaydı</span>
                    <strong>{invoice.documentId ?? "—"}</strong>
                  </li>
                  <li>
                    <span>PDF</span>
                    <strong>Canlı servis bekleniyor</strong>
                  </li>
                </ul>
              </section>

              <InvoiceActionsBar onIssue={() => setIssueOpen(true)} variant="reference" />
            </aside>
          </main>
        </div>
      </section>

      <InvoiceIssueDialog open={issueOpen} onClose={() => setIssueOpen(false)} />
    </>
  );
}
