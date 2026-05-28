// @ts-nocheck
"use client";



import Link from "next/link";

import type { Customer, SaleOrder } from "@hallederiz/types";

import { LucideIcon } from "../../../components/icons/lucide-icons";

import { dateLabel, formatTryMoney } from "../utils/format";

import {

  fulfillmentSummaryForPreview,

  mapOrderStatusDeskBadge,

  paymentBreakdownForPreview,

  type OrdersDeskBadgeTone

} from "../utils/orders-desk-view-model";



function badgeClass(tone: OrdersDeskBadgeTone): string {

  if (tone === "success") return "hz-orders-badge hz-orders-badge--success";

  if (tone === "danger") return "hz-orders-badge hz-orders-badge--danger";

  if (tone === "gold") return "hz-orders-badge hz-orders-badge--gold";

  if (tone === "info") return "hz-orders-badge hz-orders-badge--info";

  if (tone === "warning") return "hz-orders-badge hz-orders-badge--warning";

  return "hz-orders-badge hz-orders-badge--muted";

}



type OrdersDeskPreviewProps = {

  order: SaleOrder | null;

  customer: Customer | null;

};



export function OrdersDeskPreview({ order, customer }: OrdersDeskPreviewProps) {

  if (!order) {

    return (

      <aside className="hz-orders-preview hz-orders-card hz-orders-card--empty" aria-label="SipariÅŸ Ã¶nizleme">

        <div className="hz-orders-preview__empty">

          <p className="hz-orders-preview__empty-title">Bir sipariÅŸ seÃ§in.</p>

          <p className="hz-orders-preview__empty-desc">SeÃ§ili sipariÅŸin Ã¶deme ve sevkiyat durumu burada gÃ¶rÃ¼nÃ¼r.</p>

        </div>

      </aside>

    );

  }



  const payment = paymentBreakdownForPreview(order);

  const fulfillment = fulfillmentSummaryForPreview(order);

  const status = mapOrderStatusDeskBadge(order);

  const collectionHref = `/tahsilatlar/yeni?order=${encodeURIComponent(order.id)}`;



  return (

    <aside className="hz-orders-preview hz-orders-card" aria-label="SipariÅŸ baÄŸlamÄ±">

      <header className="hz-orders-preview__header">

        <p className="hz-orders-preview__eyebrow">SipariÅŸ BaÄŸlamÄ±</p>
        <h2 className="hz-orders-preview__title">{order.orderNo}</h2>

        <p className="hz-orders-preview__subtitle">

          <LucideIcon name="building-2" size={14} />

          {customer?.name ?? "Cari bilgisi bekleniyor"}

        </p>

        <p className="hz-orders-preview__amount">{formatTryMoney(order.grandTotal, order.currency)}</p>

        <span className={badgeClass(status.tone)}>{status.label}</span>

      </header>



      <div className="hz-orders-preview__body">

        <section className="hz-orders-preview-section">

          <div className="hz-orders-preview-section__head">

            <h3>

              <LucideIcon name="receipt" size={14} />

          Tahsilat Durumu

            </h3>

            <span className={badgeClass(payment.statusTone)}>{payment.statusLabel}</span>

          </div>



          {payment.hasInfo ? (

            <>

              <div className="hz-orders-payment-grid">

                <article className="hz-orders-payment-metric">

                  <p className="hz-orders-payment-metric__label">Toplam Tutar</p>

                  <p className="hz-orders-payment-metric__value">{payment.totalLabel}</p>

                </article>

                <article className="hz-orders-payment-metric hz-orders-payment-metric--paid">

                  <p className="hz-orders-payment-metric__label">Tahsil Edilen</p>

                  <p className="hz-orders-payment-metric__value">{payment.paidLabel}</p>

                </article>

                <article className={`hz-orders-payment-metric hz-orders-payment-metric--remaining hz-orders-payment-metric--${payment.remainingTone}`}>

                  <p className="hz-orders-payment-metric__label">Kalan Tutar</p>

                  <p className="hz-orders-payment-metric__value">{payment.remainingLabel}</p>

                </article>

              </div>

              {payment.lastCollectionLabel ? (

                <p className="hz-orders-preview-section__meta">Son tahsilat kaydÄ±: {payment.lastCollectionLabel}</p>

              ) : null}

            </>

          ) : (

            <p className="hz-orders-preview-section__empty">Tahsilat bilgisi bekleniyor</p>

          )}

        </section>



        <section className="hz-orders-preview-section">

          <h3>

            <LucideIcon name="truck" size={14} />

            Teslimat HazÄ±rlÄ±ÄŸÄ±

          </h3>

          <p className="hz-orders-preview-section__headline">{fulfillment.headline}</p>

          <p className="hz-orders-preview-section__detail">{fulfillment.detail}</p>

        </section>



        <section className="hz-orders-preview-section hz-orders-preview-section--timeline">

          <h3>

            <LucideIcon name="clock" size={14} />

            Fatura / Belge Durumu

          </h3>

          <p className="hz-orders-preview-section__headline">
            {order.status === "completed" || order.status === "delivered" ? "Belge hazÄ±r" : "Fatura bekliyor"}
          </p>
          <p className="hz-orders-preview-section__detail">Son gÃ¼ncelleme: {dateLabel(order.updatedAt)}</p>

        </section>

      </div>



      <div className="hz-orders-action-stack">

        <Link href={`/siparisler/${order.id}`} className="hz-orders-button-primary">

          <LucideIcon name="eye" size={14} />

          DetayÄ± AÃ§

        </Link>

        {payment.showCollectionLink ? (

          <Link href={collectionHref} className="hz-orders-button-secondary hz-orders-button-secondary--emphasis">

            <LucideIcon name="circle-dollar-sign" size={14} />

          Tahsilat AÃ§

          </Link>

        ) : (

          <Link href="/tahsilatlar" className="hz-orders-button-secondary">

            <LucideIcon name="circle-dollar-sign" size={14} />

          TahsilatÄ± GÃ¶r

          </Link>

        )}

        <Link href={`/teslimatlar/yeni?order=${encodeURIComponent(order.id)}`} className="hz-orders-button-tertiary">

          <LucideIcon name="truck" size={14} />

          Teslim Planla

        </Link>

      </div>

    </aside>

  );

}



