"use client";

import Link from "next/link";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { PaymentActionsBar } from "./PaymentActionsBar";
import { PaymentAllocationTable } from "./PaymentAllocationTable";
import { PaymentDocumentPanel } from "./PaymentDocumentPanel";
import { PaymentSummaryCards } from "./PaymentSummaryCards";
import { getPaymentDetail } from "../queries/get-payments";
import {
  getPaymentBankLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentSummary
} from "../queries/payment-mock-data";
import { money } from "../utils";
import { EntityTimelinePanel } from "../../shared/components/EntityTimelinePanel";

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

function statusBadgeClass(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "tdf-badge tdf-badge--success";
  if (status === "partially_allocated") return "tdf-badge tdf-badge--warning";
  if (status === "confirmed") return "tdf-badge tdf-badge--info";
  if (status === "reversed") return "tdf-badge tdf-badge--danger";
  return "tdf-badge tdf-badge--muted";
}

function approvalLabel(payment: PaymentReceipt): string {
  if (payment.status === "reversed") {
    return "Ters kayıt";
  }
  if (payment.confirmedAt) {
    return "Onaylandı";
  }
  if (payment.status === "draft") {
    return "Taslak";
  }
  return "Bekliyor";
}

function receiptLabel(payment: PaymentReceipt): string {
  if (payment.status === "draft") {
    return "Taslak";
  }
  if (payment.documentCount > 0) {
    return "Belge mevcut";
  }
  return "Hazırlanmadı";
}

function PaymentDetailShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="tdf-page hz-tahsilatlar-detail-page">
      <div className="tdf-shell">{children}</div>
    </section>
  );
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
    return (
      <PaymentDetailShell>
        <div className="tdf-state" role="status" aria-live="polite">
          <div className="tdf-state__spinner" aria-hidden />
          <h2>Tahsilat yükleniyor</h2>
          <p>Fiş, tahsis satırları ve belge bağlantıları hazırlanıyor.</p>
        </div>
      </PaymentDetailShell>
    );
  }

  if (!payment) {
    return (
      <PaymentDetailShell>
        <div className="tdf-state" role="alert">
          <h2>Tahsilat bulunamadı</h2>
          <p>Seçilen tahsilat kaydı bulunamadı veya erişim kapsamında değil.</p>
          <Link href="/tahsilatlar" className="tdf-state__link">
            Tahsilatlar listesine dön
          </Link>
        </div>
      </PaymentDetailShell>
    );
  }

  const summary = getPaymentSummary(payment);
  const bankLabel = getPaymentBankLabel(payment.method, payment.referenceNo);

  return (
    <PaymentDetailShell>
      <header className="tdf-header">
        <div className="tdf-header__main">
          <p className="tdf-header__eyebrow">Tahsilatlar</p>
          <h1>Tahsilat Detayı</h1>
          <p className="tdf-header__meta">
            {payment.receiptNo} · {customer?.name ?? payment.customerId} · {fmtDate(payment.receivedAt)}
          </p>
        </div>
        <Link href="/tahsilatlar" className="tdf-header__back">
          ← Listeye dön
        </Link>
      </header>

      {dataSourceConfig.useDemoData ? (
        <p className="tdf-demo-band" role="status">
          Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, doğrula veya gönderim canlıda bağlı değildir.
        </p>
      ) : null}

      <PaymentSummaryCards payment={payment} />

      <main className="tdf-layout">
        <section className="tdf-main">
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

          <EntityTimelinePanel entityType="payment" entityId={payment.id} title="Zaman akışı" />
        </section>

        <aside className="tdf-side">
          <section className="tdf-side-card" aria-label="Durum paneli">
            <header className="tdf-side-card__head">
              <h3>Durum</h3>
              <span className={statusBadgeClass(payment.status)}>{getPaymentStatusLabel(payment.status)}</span>
            </header>
            <ul className="tdf-side-list">
              <li>
                <span>Tahsilat durumu</span>
                <strong>{getPaymentStatusLabel(payment.status)}</strong>
              </li>
              <li>
                <span>Onay durumu</span>
                <strong>{approvalLabel(payment)}</strong>
              </li>
              <li>
                <span>Makbuz durumu</span>
                <strong>{receiptLabel(payment)}</strong>
              </li>
              <li>
                <span>Dağıtılan</span>
                <strong>{money(summary.allocatedTotal, payment.currency)}</strong>
              </li>
              <li>
                <span>Kalan</span>
                <strong>{money(summary.remainingAmount, payment.currency)}</strong>
              </li>
              {dataSourceConfig.useDemoData ? (
                <li>
                  <span>Veri modu</span>
                  <strong>Demo / önizleme</strong>
                </li>
              ) : null}
            </ul>
          </section>

          <section className="tdf-side-card" aria-label="Cari paneli">
            <header className="tdf-side-card__head">
              <h3>Cari</h3>
            </header>
            <ul className="tdf-side-list">
              <li>
                <span>Cari adı</span>
                <strong>{customer?.name ?? "—"}</strong>
              </li>
              <li>
                <span>Cari kodu</span>
                <strong>{customer?.code ?? "—"}</strong>
              </li>
              <li>
                <span>Telefon</span>
                <strong>{customer?.phone ?? "—"}</strong>
              </li>
              <li>
                <span>E-posta</span>
                <strong>{customer?.email ?? "—"}</strong>
              </li>
              <li>
                <span>Şehir</span>
                <strong>{customer?.city ?? "—"}</strong>
              </li>
            </ul>
            {customer ? (
              <Link href={`/cariler/${customer.id}`} className="tdf-side-link">
                Cari detayına git →
              </Link>
            ) : null}
          </section>

          <PaymentDocumentPanel payment={payment} />
          <PaymentActionsBar />
        </aside>
      </main>
    </PaymentDetailShell>
  );
}
