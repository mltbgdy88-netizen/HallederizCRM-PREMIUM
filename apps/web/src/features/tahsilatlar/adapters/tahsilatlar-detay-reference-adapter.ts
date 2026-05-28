// @ts-nocheck
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { formatTrDate, formatTrDateTime, formatTryMoney } from "../../../lib/reference/formatters";
import { mapPaymentRow } from "../../payments/mappers/map-payment-row";
import { getPayments } from "../../payments/queries/get-payments";
import {
  getPaymentBankLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentSummary
} from "../../payments/queries/payment-mock-data";
import {
  THDM_CONTEXT,
  THDM_DIST_FOOTER,
  THDM_INFO,
  THDM_INVOICES,
  THDM_LINKED,
  THDM_NOTES,
  THDM_OVERVIEW,
  THDM_PAGE,
  THDM_RECEIPT,
  THDM_STEPS,
  THDM_SUMMARY,
  type ThdmInvoiceStatus
} from "../data/tahsilatlar-detay-mock";

export type TahsilatlarDetayReferenceSnapshot = {
  paymentId: string;
  demoBanner: string | null;
  page: { breadcrumb: string[]; title: string };
  summary: typeof THDM_SUMMARY;
  steps: { id: string; title: string; time: string; actor: string }[];
  info: { label: string; value: string; full?: boolean }[];
  receipt: typeof THDM_RECEIPT;
  invoices: {
    id: string;
    docNo: string;
    date: string;
    dueDate: string;
    original: string;
    remaining: string;
    collected: string;
    status: ThdmInvoiceStatus;
  }[];
  distFooter: typeof THDM_DIST_FOOTER;
  context: typeof THDM_CONTEXT;
  linked: { id: string; docNo: string; amount: string }[];
  overview: { label: string; value: string }[];
  notes: typeof THDM_NOTES;
};

function mapDetailStatusLabel(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "Tamamlandı";
  if (status === "partially_allocated") return "Kısmi Eşleşti";
  if (status === "confirmed") return "Beklemede";
  if (status === "draft") return "Taslak";
  if (status === "reversed") return "İptal";
  return getPaymentStatusLabel(status);
}

function mapMatchStatus(payment: PaymentReceipt): string {
  const summary = getPaymentSummary(payment);
  if (payment.status === "allocated") return "Tam Eşleşti";
  if (payment.status === "partially_allocated") return "Kısmi Eşleşti";
  if (summary.allocationCount === 0) return "Eşleşme Bekliyor";
  return "Kısmi Eşleşti";
}

function buildSteps(payment: PaymentReceipt): TahsilatlarDetayReferenceSnapshot["steps"] {
  const steps: TahsilatlarDetayReferenceSnapshot["steps"] = [
    {
      id: "1",
      title: "Tahsilat Oluşturuldu",
      time: formatTrDateTime(payment.createdAt),
      actor: "Sistem"
    }
  ];

  if (payment.confirmedAt) {
    steps.push({
      id: "2",
      title: "Ödeme Kaydedildi",
      time: formatTrDateTime(payment.confirmedAt),
      actor: "Sistem"
    });
  }

  if (payment.allocations.length > 0) {
    steps.push({
      id: "3",
      title: "Otomatik Eşleştirme",
      time: formatTrDateTime(payment.allocations[0]!.createdAt),
      actor: "Sistem"
    });
  }

  if (payment.documentCount > 0) {
    steps.push({
      id: "4",
      title: "Dekont Yüklendi",
      time: formatTrDateTime(payment.confirmedAt ?? payment.receivedAt),
      actor: "Sistem"
    });
  }

  if (payment.status === "allocated" || payment.status === "partially_allocated") {
    steps.push({
      id: "5",
      title: payment.status === "allocated" ? "Tahsilat Tamamlandı" : "Kısmi Tahsilat",
      time: formatTrDateTime(payment.confirmedAt ?? payment.receivedAt),
      actor: "Sistem"
    });
  }

  return steps.length > 0 ? steps : THDM_STEPS.map((s) => ({ ...s }));
}

function cloneDemoSnapshot(): TahsilatlarDetayReferenceSnapshot {
  return {
    paymentId: REFERENCE_ROUTE_IDS.paymentId,
    demoBanner: null,
    page: { breadcrumb: [...THDM_PAGE.breadcrumb], title: THDM_PAGE.title },
    summary: { ...THDM_SUMMARY },
    steps: THDM_STEPS.map((s) => ({ ...s })),
    info: THDM_INFO.map((f) => ({ ...f })),
    receipt: { ...THDM_RECEIPT },
    invoices: THDM_INVOICES.map((row) => ({ ...row })),
    distFooter: { ...THDM_DIST_FOOTER },
    context: { ...THDM_CONTEXT },
    linked: THDM_LINKED.map((item) => ({ ...item })),
    overview: THDM_OVERVIEW.map((row) => ({ ...row })),
    notes: { ...THDM_NOTES }
  };
}

function buildLiveSnapshot(
  payment: PaymentReceipt,
  customers: Customer[],
  demoBanner: string | null
): TahsilatlarDetayReferenceSnapshot {
  const customer = customers.find((c) => c.id === payment.customerId);
  const row = mapPaymentRow(payment, customers);
  const summary = getPaymentSummary(payment);
  const methodLabel = getPaymentMethodLabel(payment.method);
  const bankLabel = getPaymentBankLabel(payment.method, payment.referenceNo);
  const methodDetail = payment.referenceNo ? `${bankLabel} · ${payment.referenceNo}` : bankLabel;

  const invoices = payment.allocations.map((alloc) => ({
    id: alloc.id,
    docNo: alloc.targetNo,
    date: formatTrDate(alloc.createdAt),
    dueDate: "—",
    original: formatTryMoney(alloc.targetTotal, alloc.currency),
    remaining: formatTryMoney(alloc.openBalance, alloc.currency),
    collected: formatTryMoney(alloc.allocatedAmount, alloc.currency),
    status: (alloc.openBalance <= 0 ? "Ödendi" : "Kısmi") as ThdmInvoiceStatus
  }));

  const allocatedTotal = summary.allocatedTotal;
  const targetTotal = payment.allocations.reduce((sum, a) => sum + a.targetTotal, 0);

  return {
    paymentId: payment.id,
    demoBanner,
    page: {
      breadcrumb: ["Tahsilatlar", `Tahsilat ${payment.receiptNo}`],
      title: "Tahsilat Detay Masası"
    },
    summary: {
      number: payment.receiptNo,
      date: formatTrDateTime(payment.receivedAt),
      customer: customer?.name ?? row.customerName,
      customerCode: customer?.code ?? "—",
      amount: formatTryMoney(payment.amount, payment.currency),
      method: methodLabel,
      methodDetail,
      status: mapDetailStatusLabel(payment.status)
    },
    steps: buildSteps(payment),
    info: [
      { label: "Tahsilat No", value: payment.receiptNo },
      { label: "Tarih", value: formatTrDateTime(payment.receivedAt) },
      { label: "Cari Ünvan", value: customer?.name ?? row.customerName },
      { label: "Cari Kodu", value: customer?.code ?? "—" },
      { label: "Ödeme Yöntemi", value: methodLabel },
      { label: "Banka Hesabı", value: methodDetail },
      { label: "Açıklama", value: payment.description || "—", full: true }
    ],
    receipt: {
      fileName: payment.documentCount > 0 ? `dekont_${payment.receiptNo.replace(/\s+/g, "_").toLowerCase()}.pdf` : "—",
      label: "Dekont"
    },
    invoices: invoices.length > 0 ? invoices : [],
    distFooter: {
      collected: formatTryMoney(allocatedTotal, payment.currency),
      original: formatTryMoney(targetTotal || payment.amount, payment.currency),
      remaining: formatTryMoney(summary.remainingAmount, payment.currency),
      matchStatus: mapMatchStatus(payment)
    },
    context: {
      title: THDM_CONTEXT.title,
      customer: customer?.name ?? row.customerName,
      status: customer?.active === false ? "Pasif" : "Aktif",
      taxId: customer?.taxNumber ?? "—",
      phone: customer?.phone ?? "—",
      email: customer?.email ?? "—",
      address: customer?.addressLine
        ? `${customer.addressLine}${customer.district ? `, ${customer.district}` : ""} / ${customer.city ?? ""}`
        : "—"
    },
    linked: payment.allocations.map((alloc) => ({
      id: alloc.id,
      docNo: alloc.targetNo,
      amount: formatTryMoney(alloc.allocatedAmount, alloc.currency)
    })),
    overview: [
      { label: "Toplam Tahsilat", value: formatTryMoney(payment.amount, payment.currency) },
      {
        label: "Toplam Fatura",
        value: formatTryMoney(targetTotal || payment.amount, payment.currency)
      },
      { label: "Eşleşen Tutar", value: formatTryMoney(allocatedTotal, payment.currency) },
      { label: "Kalan Tutar", value: formatTryMoney(summary.remainingAmount, payment.currency) },
      { label: "İskonto Tutarı", value: formatTryMoney(0, payment.currency) }
    ],
    notes: {
      placeholder: THDM_NOTES.placeholder,
      saveLabel: THDM_NOTES.saveLabel,
      systemNote: payment.description
        ? `Tahsilat kaydı: ${payment.description} — ${formatTrDateTime(payment.updatedAt ?? payment.createdAt)}`
        : THDM_NOTES.systemNote
    }
  };
}

export const TAHSILATLAR_DETAY_REFERENCE_INITIAL = cloneDemoSnapshot();

export function loadTahsilatlarDetayReferenceDemo(): TahsilatlarDetayReferenceSnapshot {
  return cloneDemoSnapshot();
}

export async function loadTahsilatlarDetayReferenceLive(
  paymentId: string
): Promise<TahsilatlarDetayReferenceSnapshot> {
  const { payments, customers } = await getPayments();
  const payment = payments.find((p) => p.id === paymentId || p.receiptNo === paymentId) ?? payments[0];
  if (!payment) {
    return { ...cloneDemoSnapshot(), demoBanner: REFERENCE_DEMO_BANNER };
  }
  return buildLiveSnapshot(payment, customers, null);
}
