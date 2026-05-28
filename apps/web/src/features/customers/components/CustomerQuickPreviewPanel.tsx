"use client";

import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import type { CustomerRow } from "../mappers/map-customer-row";
import { isCustomersDemoRowId } from "../data/customers-demo-rows";
import {
  buildDemoSideActions,
  buildLiveSideActions,
  CustomerSideRadarCompact,
  type CustomerSideRadarView
} from "./CustomerSideRadarCompact";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function buildRiskNoteWithoutAccount(customer: Customer): string {
  const parts: string[] = ["Finans özeti henüz bağlı değil."];
  if (customer.whatsappMatched) parts.push("WhatsApp eşleşmesi aktif.");
  if (customer.riskLevel === "high" || customer.riskLevel === "blocked") {
    parts.push("Yüksek risk; ek onay gerekebilir.");
  }
  return parts.join(" ");
}

function buildRiskNote(customer: Customer, account: CustomerAccount): string {
  const risk = calculateCustomerRiskState(customer, account);
  const parts: string[] = [];
  if (account.balance > 50000) {
    parts.push("Açık bakiye yüksek; tahsilat kontrolü önerilir.");
  } else if (account.overdueAmount > 0) {
    parts.push("Vadesi geçen tutar var; tahsilat planı değerlendirin.");
  }
  if (customer.whatsappMatched) parts.push("WhatsApp eşleşmesi aktif.");
  if (risk.level === "high" || risk.level === "blocked") {
    parts.push("Risk yüksek; ek onay gerekebilir.");
  }
  if (parts.length === 0) {
    return "Profil stabil; rutin operasyona devam edilebilir.";
  }
  return parts.join(" ");
}

function buildDemoRiskNote(row: CustomerRow): string {
  if (row.riskTone === "danger") return "Yüksek risk; limit takibi önerilir (önizleme).";
  if (row.riskTone === "warning") return "Orta risk; bakiye kontrolü faydalıdır (önizleme).";
  return "Risk dengeli; rutin akış uygun (önizleme).";
}

function opsFields(
  customer: Customer,
  account: CustomerAccount | null,
  preview?: CustomerRow | null
): CustomerSideRadarView["ops"] {
  if (preview) {
    return [
      { label: "Sipariş", value: "—" },
      { label: "Teklif", value: "—" },
      { label: "Tahsilat", value: "—" },
      { label: "Son ödeme", value: "—" },
      { label: "WA", value: preview.whatsappMatched ? "Eşleşti" : "Hayır" }
    ];
  }
  return [
    { label: "Sipariş", value: account ? String(account.openOrderCount) : "—" },
    { label: "Teklif", value: account ? String(account.openOfferCount) : "—" },
    { label: "Tahsilat", value: "—" },
    {
      label: "Son ödeme",
      value: account?.lastPaymentAt ? new Date(account.lastPaymentAt).toLocaleDateString("tr-TR") : "—"
    },
    { label: "WA", value: customer.whatsappMatched ? "Eşleşti" : "Hayır" }
  ];
}

export function CustomerQuickPreviewPanel({
  customer,
  account,
  previewRow
}: {
  customer: Customer | null;
  account: CustomerAccount | null;
  previewRow?: CustomerRow | null;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [demoDone, setDemoDone] = useState<Record<string, boolean>>({});

  const fireDemo = (key: string, message: string) => {
    if (demoDone[key]) return;
    pushToast(message);
    setDemoDone((d) => ({ ...d, [key]: true }));
  };

  if (!customer && !previewRow) {
    return <CustomerSideRadarCompact view={{ mode: "empty" }} />;
  }

  if (previewRow && isCustomersDemoRowId(previewRow.customerId)) {
    const view: CustomerSideRadarView = {
      mode: "filled",
      name: previewRow.name,
      statusLabel: "Önizleme",
      statusTone: "preview",
      identity: [
        { label: "Kod", value: previewRow.code },
        { label: "Tip", value: previewRow.typeLabel },
        { label: "Şehir", value: previewRow.city },
        { label: "Telefon", value: previewRow.phone },
        { label: "Vergi", value: "—" },
        { label: "Fiyat", value: previewRow.priceGroupLabel }
      ],
      finance: [
        { label: "Alacak", value: previewRow.balanceCreditLine, tone: "pos" },
        { label: "Borç", value: previewRow.balanceDebitLine, tone: "neg" },
        { label: "Net", value: previewRow.balanceLabel },
        { label: "Limit", value: "—" }
      ],
      riskBadge: previewRow.riskLabel,
      overdueHint: null,
      ops: opsFields({ whatsappMatched: previewRow.whatsappMatched } as Customer, null, previewRow),
      actions: buildDemoSideActions(demoDone, fireDemo),
      riskNote: buildDemoRiskNote(previewRow)
    };
    return <CustomerSideRadarCompact view={view} />;
  }

  if (!customer) {
    return <CustomerSideRadarCompact view={{ mode: "empty" }} />;
  }

  const identity = [
    { label: "Kod", value: customer.code },
    { label: "Tip", value: resolveCustomerDisplayType(customer.type) },
    { label: "Şehir", value: customer.city },
    { label: "Telefon", value: customer.phone },
    {
      label: "Vergi",
      value: `${customer.taxOffice ?? "—"}${customer.taxNumber ? ` · ${customer.taxNumber}` : ""}`
    },
    {
      label: "Fiyat",
      value: customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`
    }
  ];

  if (!account) {
    const view: CustomerSideRadarView = {
      mode: "filled",
      name: customer.name,
      statusLabel: customer.active ? "Aktif" : "Pasif",
      statusTone: customer.active ? "ok" : "off",
      identity,
      finance: [{ label: "Durum", value: "Finans bağlı değil" }],
      ops: opsFields(customer, null),
      actions: buildLiveSideActions(router, customer.id),
      riskNote: buildRiskNoteWithoutAccount(customer)
    };
    return <CustomerSideRadarCompact view={view} />;
  }

  const risk = calculateCustomerRiskState(customer, account);
  const bal = account.balance;
  const rec = bal > 0 ? formatMoney(bal, account.currency) : "—";
  const pay = bal < 0 ? formatMoney(-bal, account.currency) : "—";
  const net = formatMoney(bal, account.currency);

  const view: CustomerSideRadarView = {
    mode: "filled",
    name: customer.name,
    statusLabel: customer.active ? "Aktif" : "Pasif",
    statusTone: customer.active ? "ok" : "off",
    identity,
    finance: [
      { label: "Alacak", value: rec, tone: "pos" },
      { label: "Borç", value: pay, tone: "neg" },
      { label: "Net", value: net },
      {
        label: "Limit",
        value: account.creditLimit != null ? formatMoney(account.creditLimit, account.currency) : "—"
      }
    ],
    riskBadge: risk.label,
    overdueHint:
      account.overdueAmount > 0
        ? `Vade: ${formatMoney(account.overdueAmount, account.currency)}`
        : null,
    ops: opsFields(customer, account),
    actions: buildLiveSideActions(router, customer.id),
    riskNote: buildRiskNote(customer, account)
  };

  return <CustomerSideRadarCompact view={view} />;
}
