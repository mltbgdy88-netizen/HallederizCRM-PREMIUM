"use client";

import Link from "next/link";
import type { Customer, Delivery, Invoice, PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import type { ReactNode } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { dateLabel, formatTryMoney, money } from "../utils/format";
import {
  buildQuickDeliveryHref,
  buildQuickOrderHref,
  buildQuickReturnHref,
  getOrderChannelLabel,
  getOrderStatusLabel,
  type OrderReferenceKpi,
  type OrderReferenceModel,
  type OrderScopedSideData,
  type OrderTimelineEvent
} from "../utils/map-order-detail-to-reference";
import { getDeliveryStatusLabel, getPaymentStatusLabel } from "../queries/order-mock-data";

export function OrderReferenceShell({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`spd-page hz-orders-detail-page ${className}`.trim()}>
      <div className="spd-shell">{children}</div>
    </section>
  );
}

export function OrderReferenceLoadingState() {
  return (
    <OrderReferenceShell>
      <div className="spd-state" role="status" aria-live="polite">
        <div className="spd-state__spinner" aria-hidden />
        <h2>Sipariş yükleniyor</h2>
        <p>Satırlar, tahsilat, teslimat ve depo bağlamları hazırlanıyor.</p>
      </div>
    </OrderReferenceShell>
  );
}

export function OrderReferenceNotFoundState() {
  return (
    <OrderReferenceShell>
      <div className="spd-state" role="alert">
        <h2>Sipariş bulunamadı</h2>
        <p>Seçilen sipariş bulunamadı veya erişim kapsamında değil.</p>
        <Link href="/siparisler" className="spd-state__link">
          Sipariş listesine dön
        </Link>
      </div>
    </OrderReferenceShell>
  );
}

export function OrderReferenceHeader({
  title,
  meta,
  backHref = "/siparisler",
  backLabel = "← Listeye dön",
  quickHref
}: {
  title: string;
  meta: string;
  backHref?: string;
  backLabel?: string;
  quickHref?: string;
}) {
  return (
    <header className="spd-header">
      <div className="spd-header__main">
        <p className="spd-header__eyebrow">Siparişler</p>
        <h1>{title}</h1>
        <p className="spd-header__meta">{meta}</p>
      </div>
      <div className="spd-header__actions">
        {quickHref ? (
          <Link href={quickHref} className="spd-header__btn spd-header__btn--primary">
            Hızlı İşlem
          </Link>
        ) : null}
        <Link href={backHref} className="spd-header__btn">
          {backLabel}
        </Link>
      </div>
    </header>
  );
}

export function OrderReferenceDemoBand() {
  if (!dataSourceConfig.useDemoData) {
    return null;
  }
  return (
    <p className="spd-demo-band" role="status">
      Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, onay ve operasyon aksiyonları canlıda bağlı değildir.
    </p>
  );
}

export function OrderReferenceKpiStrip({ kpis }: { kpis: OrderReferenceKpi[] }) {
  return (
    <section className="spd-kpi-strip" aria-label="Sipariş özeti">
      {kpis.map((kpi) => (
        <article key={kpi.label} className={`spd-kpi${kpi.tone ? ` spd-kpi--${kpi.tone}` : ""}`}>
          <span className="spd-kpi__label">{kpi.label}</span>
          <strong className="spd-kpi__value">{kpi.value}</strong>
          <span className="spd-kpi__hint">{kpi.hint}</span>
        </article>
      ))}
    </section>
  );
}

export function OrderReferenceFieldGrid({
  fields
}: {
  fields: Array<{ label: string; value: string; full?: boolean }>;
}) {
  return (
    <div className="spd-field-grid">
      {fields.map((field) => (
        <label key={field.label} className={`spd-field${field.full ? " spd-field--full" : ""}`}>
          <span>{field.label}</span>
          <strong>{field.value || "—"}</strong>
        </label>
      ))}
    </div>
  );
}

export function OrderReferenceSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="spd-section">
      <header className="spd-section__head">
        <h2>{title}</h2>
      </header>
      {description ? <p className="spd-section__desc">{description}</p> : null}
      {children}
    </section>
  );
}

export function OrderReferenceSideCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="spd-side-card">
      <header className="spd-side-card__head">
        <h3>{title}</h3>
      </header>
      {children}
    </section>
  );
}

export function OrderReferenceSideList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <ul className="spd-side-list">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value || "—"}</strong>
        </li>
      ))}
    </ul>
  );
}

export function OrderReferenceSidePanel({
  order,
  customer,
  scoped,
  model,
  relatedDelivery,
  relatedInvoice,
  actions
}: {
  order: SaleOrder;
  customer: Customer | null;
  scoped: OrderScopedSideData;
  model: OrderReferenceModel;
  relatedDelivery: Delivery | null;
  relatedInvoice: Invoice | null;
  actions?: ReactNode;
}) {
  const customerId = customer?.id ?? order.customerId;

  return (
    <>
      <OrderReferenceSideCard title="Operasyon özeti">
        <OrderReferenceSideList
          items={[
            { label: "Tahsilat", value: model.paymentStatusLabel },
            { label: "Teslimat", value: model.deliveryStatusLabel },
            { label: "Fatura", value: model.invoiceStatusLabel },
            { label: "Depo emri", value: scoped.warehouseOrders[0]?.warehouseOrderNo ?? "—" },
            { label: "Açık tutar", value: model.openBalance }
          ]}
        />
      </OrderReferenceSideCard>

      <OrderReferenceSideCard title="Cari">
        <OrderReferenceSideList
          items={[
            { label: "Cari adı", value: customer?.name ?? "—" },
            { label: "Telefon", value: customer?.phone ?? "—" },
            { label: "E-posta", value: customer?.email ?? "—" }
          ]}
        />
        {customer ? (
          <Link href={`/cariler/${customer.id}`} className="spd-side-link">
            Cari detayına git →
          </Link>
        ) : null}
      </OrderReferenceSideCard>

      <OrderReferenceSideCard title="Hızlı bağlantılar">
        <div className="spd-quick-links">
          <Link href={`/tahsilatlar/yeni?order=${encodeURIComponent(order.id)}`} className="spd-quick-links__item">
            Tahsilat ekle
          </Link>
          <Link href={buildQuickDeliveryHref(order.id, customerId)} className="spd-quick-links__item">
            Teslimat hazırla
          </Link>
          <Link
            href={relatedInvoice ? `/faturalar/${relatedInvoice.id}` : "/faturalar"}
            className="spd-quick-links__item"
          >
            Fatura görüntüle
          </Link>
          <Link href={buildQuickReturnHref(order.id, customerId)} className="spd-quick-links__item">
            İade başlat
          </Link>
          <Link href={buildQuickOrderHref(order.id, customerId)} className="spd-quick-links__item">
            Hızlı İşlem masası
          </Link>
          {relatedDelivery ? (
            <Link href={`/teslimatlar/${relatedDelivery.id}`} className="spd-quick-links__item">
              Teslim kaydı aç
            </Link>
          ) : null}
        </div>
      </OrderReferenceSideCard>

      {actions}
    </>
  );
}

export function OrderReferenceTimelineList({ events }: { events: OrderTimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="spd-empty">Bu sipariş için zaman akışı kaydı bulunmuyor.</p>;
  }

  return (
    <ul className="spd-timeline">
      {events.map((event) => (
        <li key={event.id} className="spd-timeline__item">
          <div className="spd-timeline__meta">
            <strong>{event.title}</strong>
            <span>{dateLabel(event.date)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OrderReferencePaymentsTable({ payments }: { payments: PaymentReceipt[] }) {
  if (payments.length === 0) {
    return <p className="spd-empty">Bu siparişe bağlı tahsilat kaydı henüz yok.</p>;
  }

  return (
    <div className="spd-table-wrap">
      <table className="spd-table">
        <thead>
          <tr>
            <th>Makbuz no</th>
            <th>Tarih</th>
            <th>Yöntem</th>
            <th>Tutar</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>
                <Link href={`/tahsilatlar/${payment.id}`} className="spd-table__link">
                  {payment.receiptNo}
                </Link>
              </td>
              <td>{dateLabel(payment.receivedAt)}</td>
              <td>{payment.method}</td>
              <td>{money(payment.amount, payment.currency)}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderReferenceDeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  if (deliveries.length === 0) {
    return <p className="spd-empty">Teslimat kaydı henüz oluşmadı.</p>;
  }

  return (
    <div className="spd-table-wrap">
      <table className="spd-table">
        <thead>
          <tr>
            <th>Teslimat no</th>
            <th>Plan</th>
            <th>Teslim</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => (
            <tr key={delivery.id}>
              <td>
                <Link href={`/teslimatlar/${delivery.id}`} className="spd-table__link">
                  {delivery.deliveryNo}
                </Link>
              </td>
              <td>{dateLabel(delivery.plannedAt)}</td>
              <td>{delivery.deliveredAt ? dateLabel(delivery.deliveredAt) : "—"}</td>
              <td>{delivery.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderReferenceInvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="spd-empty">Fatura kaydı henüz oluşmadı.</p>;
  }

  return (
    <div className="spd-table-wrap">
      <table className="spd-table">
        <thead>
          <tr>
            <th>Fatura no</th>
            <th>Tarih</th>
            <th>Tutar</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>
                <Link href={`/faturalar/${invoice.id}`} className="spd-table__link">
                  {invoice.invoiceNo}
                </Link>
              </td>
              <td>{invoice.issueDate ? dateLabel(invoice.issueDate) : dateLabel(invoice.createdAt)}</td>
              <td>{formatTryMoney(invoice.grandTotal, invoice.currency)}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderReferenceWarehouseTable({ warehouseOrders }: { warehouseOrders: WarehouseOrder[] }) {
  if (warehouseOrders.length === 0) {
    return <p className="spd-empty">Depo emri henüz oluşmadı.</p>;
  }

  return (
    <div className="spd-table-wrap">
      <table className="spd-table">
        <thead>
          <tr>
            <th>Emir no</th>
            <th>Depo</th>
            <th>Satır</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {warehouseOrders.map((warehouseOrder) => (
            <tr key={warehouseOrder.id}>
              <td>
                <Link href={`/depo/emirler/${warehouseOrder.id}`} className="spd-table__link">
                  {warehouseOrder.warehouseOrderNo}
                </Link>
              </td>
              <td>{warehouseOrder.warehouseName ?? "—"}</td>
              <td>{String(warehouseOrder.lines.length)}</td>
              <td>{warehouseOrder.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function orderInfoFields(order: SaleOrder, customer: Customer | null) {
  return [
    { label: "Sipariş no", value: order.orderNo },
    { label: "Cari", value: customer?.name ?? order.customerId },
    { label: "Tarih", value: dateLabel(order.createdAt) },
    { label: "Durum", value: getOrderStatusLabel(order.status) },
    { label: "Kanal", value: getOrderChannelLabel(order.channel) },
    { label: "Teslim tipi", value: order.deliveryType },
    { label: "Tahsilat", value: getPaymentStatusLabel(order.paymentStatus) },
    { label: "Teslim", value: getDeliveryStatusLabel(order.deliveryStatus) },
    { label: "Oluşturan", value: order.createdBy },
    { label: "Teklif bağlantısı", value: order.offerId ?? "—" },
    { label: "Açıklama", value: order.note ?? "—", full: true }
  ];
}
