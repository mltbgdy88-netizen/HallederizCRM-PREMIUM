"use client";

import Link from "next/link";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import type { ReactNode } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  DetailLoadingState,
  DetailNotFoundState,
  DetailReferenceShell,
  DetailSideCard
} from "../../shared/detail-shell";
import { getPaymentStatusLabel, getPaymentSummary } from "../queries/payment-mock-data";
import { money } from "../utils";

export function PaymentReferenceShell({ children }: { children: ReactNode }) {
  return <DetailReferenceShell>{children}</DetailReferenceShell>;
}

export function PaymentReferenceLoadingState() {
  return (
    <PaymentReferenceShell>
      <DetailLoadingState
        title="Tahsilat yükleniyor"
        message="Fiş, tahsis satırları ve belge bağlantıları hazırlanıyor."
      />
    </PaymentReferenceShell>
  );
}

export function PaymentReferenceNotFoundState() {
  return (
    <PaymentReferenceShell>
      <DetailNotFoundState
        title="Tahsilat bulunamadı"
        message="Seçilen tahsilat kaydı bulunamadı veya erişim kapsamında değil."
        backHref="/tahsilatlar"
        backLabel="Tahsilatlar listesine dön"
      />
    </PaymentReferenceShell>
  );
}

export function PaymentReferenceSideList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <ul className="tdf-side-list">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value || "—"}</strong>
        </li>
      ))}
    </ul>
  );
}

function statusBadgeClass(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "tdf-badge tdf-badge--success";
  if (status === "partially_allocated") return "tdf-badge tdf-badge--warning";
  if (status === "confirmed") return "tdf-badge tdf-badge--info";
  if (status === "reversed") return "tdf-badge tdf-badge--danger";
  return "tdf-badge tdf-badge--muted";
}

export function approvalLabel(payment: PaymentReceipt): string {
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

export function receiptLabel(payment: PaymentReceipt): string {
  if (payment.status === "draft") {
    return "Taslak";
  }
  if (payment.documentCount > 0) {
    return "Belge mevcut";
  }
  return "Hazırlanmadı";
}

export function PaymentReferenceStatusSideCard({ payment }: { payment: PaymentReceipt }) {
  const summary = getPaymentSummary(payment);

  return (
    <DetailSideCard
      title="Durum"
      ariaLabel="Durum paneli"
      headExtra={<span className={statusBadgeClass(payment.status)}>{getPaymentStatusLabel(payment.status)}</span>}
    >
      <PaymentReferenceSideList
        items={[
          { label: "Tahsilat durumu", value: getPaymentStatusLabel(payment.status) },
          { label: "Onay durumu", value: approvalLabel(payment) },
          { label: "Makbuz durumu", value: receiptLabel(payment) },
          { label: "Dağıtılan", value: money(summary.allocatedTotal, payment.currency) },
          { label: "Kalan", value: money(summary.remainingAmount, payment.currency) },
          ...(dataSourceConfig.useDemoData ? [{ label: "Veri modu", value: "Demo / önizleme" }] : [])
        ]}
      />
    </DetailSideCard>
  );
}

export function PaymentReferenceCustomerSideCard({ customer }: { customer: Customer | null }) {
  return (
    <DetailSideCard title="Cari" ariaLabel="Cari paneli">
      <PaymentReferenceSideList
        items={[
          { label: "Cari adı", value: customer?.name ?? "—" },
          { label: "Cari kodu", value: customer?.code ?? "—" },
          { label: "Telefon", value: customer?.phone ?? "—" },
          { label: "E-posta", value: customer?.email ?? "—" },
          { label: "Şehir", value: customer?.city ?? "—" }
        ]}
      />
      {customer ? (
        <Link href={`/cariler/${customer.id}`} className="tdf-side-link">
          Cari detayına git →
        </Link>
      ) : null}
    </DetailSideCard>
  );
}

export function PaymentReferenceSidePanel({
  payment,
  customer,
  children
}: {
  payment: PaymentReceipt;
  customer: Customer | null;
  children?: ReactNode;
}) {
  return (
    <>
      <PaymentReferenceStatusSideCard payment={payment} />
      <PaymentReferenceCustomerSideCard customer={customer} />
      {children}
    </>
  );
}
