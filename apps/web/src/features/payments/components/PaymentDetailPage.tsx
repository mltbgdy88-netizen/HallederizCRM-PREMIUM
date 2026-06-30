"use client";

import Link from "next/link";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { DetailDemoBand, DetailReferenceHeader, DetailWorkspace } from "../../shared/detail-shell";
import { EntityTimelinePanel } from "../../shared/components/EntityTimelinePanel";
import { PaymentActionsBar } from "./PaymentActionsBar";
import { PaymentAllocationTable } from "./PaymentAllocationTable";
import { PaymentDocumentPanel } from "./PaymentDocumentPanel";
import { PaymentReversalsPanel } from "./PaymentReversalsPanel";
import { PaymentSummaryCards } from "./PaymentSummaryCards";
import { getPaymentDetail } from "../queries/get-payments";
import {
  getPaymentBankLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel
} from "../queries/payment-mock-data";
import {
  PaymentReferenceLoadingState,
  PaymentReferenceNotFoundState,
  PaymentReferenceShell,
  PaymentReferenceSidePanel
} from "./payment-reference-shared";

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return `${padTwo(d.getDate())}.${padTwo(d.getMonth() + 1)}.${d.getFullYear()} ${padTwo(d.getHours())}:${padTwo(d.getMinutes())}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return `${padTwo(d.getDate())}.${padTwo(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function PaymentDetailPage({ paymentId }: { paymentId: string }) {
  const [payment, setPayment] = useState<PaymentReceipt | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPaymentDetail(paymentId)
      .then((result) => {
        if (mounted) {
          setPayment(result.payment);
          setCustomers(result.customers);
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
  }, [paymentId]);

  const customer = useMemo(() => customers.find((item) => item.id === payment?.customerId) ?? null, [customers, payment?.customerId]);

  if (loading) {
    return <PaymentReferenceLoadingState />;
  }

  if (!payment) {
    return <PaymentReferenceNotFoundState />;
  }

  const bankLabel = getPaymentBankLabel(payment.method, payment.referenceNo);

  return (
    <PaymentReferenceShell>
      <DetailReferenceHeader
        eyebrow="Tahsilatlar"
        title="Tahsilat Detayı"
        meta={`${payment.receiptNo} · ${customer?.name ?? payment.customerId} · ${fmtDate(payment.receivedAt)}`}
        actions={
          <Link href="/tahsilatlar" className="tdf-header__back">
            ← Listeye dön
          </Link>
        }
      />

      <div className="tdf-shell__scroll">
        {dataSourceConfig.useDemoData ? (
          <DetailDemoBand>
            Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, doğrula veya gönderim canlıda bağlı değildir.
          </DetailDemoBand>
        ) : null}

        <PaymentSummaryCards payment={payment} />

        <DetailWorkspace
          main={
            <>
              <section className="tdf-section" aria-label="Tahsilat bilgileri">
                <header className="tdf-section__head">
                  <h2>Tahsilat bilgileri</h2>
                </header>
                <p className="tdf-section__desc">Fiş üst bilgileri; canlı doğrulama kiracı kurallarına bağlıdır.</p>
                <div className="tdf-field-grid">
                  <label className="tdf-field">
                    <span>Cari</span>
                    <strong>{customer?.name ?? payment.customerId}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Tahsilat tarihi</span>
                    <strong>{fmtDateTime(payment.receivedAt)}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Ödeme yöntemi</span>
                    <strong>{getPaymentMethodLabel(payment.method)}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Banka / kanal</span>
                    <strong>{bankLabel}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Referans no</span>
                    <strong>{payment.referenceNo ?? "—"}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Durum</span>
                    <strong>{getPaymentStatusLabel(payment.status)}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Oluşturan</span>
                    <strong>{payment.createdBy ?? "—"}</strong>
                  </label>
                  <label className="tdf-field">
                    <span>Onay zamanı</span>
                    <strong>{payment.confirmedAt ? fmtDateTime(payment.confirmedAt) : "—"}</strong>
                  </label>
                  <label className="tdf-field tdf-field--full">
                    <span>Açıklama / not</span>
                    <strong>{payment.description ?? "—"}</strong>
                  </label>
                </div>
              </section>

              <PaymentAllocationTable allocations={payment.allocations} />

              <PaymentReversalsPanel payment={payment} />

              <EntityTimelinePanel entityType="payment" entityId={payment.id} title="Zaman akışı" />
            </>
          }
          side={
            <PaymentReferenceSidePanel payment={payment} customer={customer}>
              <PaymentDocumentPanel payment={payment} />
              <PaymentActionsBar />
            </PaymentReferenceSidePanel>
          }
        />
      </div>
    </PaymentReferenceShell>
  );
}
