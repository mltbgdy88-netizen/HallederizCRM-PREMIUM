import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount, CustomerContact, CustomerLedgerEntry, Offer, PaymentReceipt, SaleOrder } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { getCustomerDetail } from "../../customers/queries/get-customers";
import { mapCustomerToRow } from "../../customers/mappers/map-customer-row";
import { getOffers } from "../../offers/queries/get-offers";
import { mapOfferToRow } from "../../offers/mappers/map-offer-row";
import { getOrders } from "../../orders/queries/get-orders";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getPayments } from "../../payments/queries/get-payments";
import { mapPaymentRow } from "../../payments/mappers/map-payment-row";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import {
  CDM_COMMERCIAL,
  CDM_CONTEXT,
  CDM_HERO,
  CDM_NEXT_STEPS,
  CDM_PERFORMANCE,
  CDM_RISK,
  CDM_SUMMARY,
  CDM_TABS,
  CDM_WARNINGS,
  type CdmTab
} from "../data/cariler-detay-mock";
import {
  creditUsagePercent,
  customerInitials,
  formatTryMoney,
  formatTrDate,
  formatTrDateTime,
  formatUsagePct
} from "./cariler-entity-reference-utils";

export type CarilerDetayHero = {
  initials: string;
  title: string;
  status: string;
  meta: { label: string; value: string }[];
};

export type CarilerDetayField = { label: string; value: string; badge?: boolean };

export type CarilerDetayReferenceSnapshot = {
  customerId: string;
  demoBanner: string | null;
  tabs: readonly CdmTab[];
  hero: CarilerDetayHero;
  summary: {
    title: string;
    fields: CarilerDetayField[];
    address: string;
    tags: { label: string; tone: "gold" | "green" | "neutral" }[];
  };
  commercial: {
    title: string;
    fields: { label: string; value: string }[];
    rep: { initials: string; name: string };
    contacts: { id: string; label: string; value: string }[];
    note: string;
  };
  performance: {
    title: string;
    rows: { label: string; value: string; icon: (typeof CDM_PERFORMANCE.rows)[number]["icon"] }[];
  };
  risk: {
    title: string;
    fields: { label: string; value: string }[];
    usageLabel: string;
    usagePct: string;
    usageValue: number;
  };
  context: {
    title: string;
    rows: { label: string; value: string; live?: boolean }[];
  };
  warnings: {
    title: string;
    items: { title: string; detail: string }[];
  };
  nextSteps: {
    title: string;
    items: { label: string; date: string }[];
    cta: string;
  };
};

function buildLiveSnapshot(
  customerId: string,
  customer: Customer,
  account: CustomerAccount | null,
  contacts: CustomerContact[],
  orders: SaleOrder[],
  offers: Offer[],
  payments: PaymentReceipt[]
): CarilerDetayReferenceSnapshot {
  const row = mapCustomerToRow(customer, account);
  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];
  const customerOrders = orders.filter((o) => o.customerId === customerId);
  const customerOffers = offers.filter((o) => o.customerId === customerId);
  const customerPayments = payments.filter((p) => p.customerId === customerId);

  const orderTotal = customerOrders.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0);
  const paymentTotal = customerPayments
    .filter((p) => p.status !== "reversed")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const openOrders = customerOrders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered" && o.status !== "cancelled"
  );
  const openOrderAmount = openOrders.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0);
  const avgOrder = customerOrders.length > 0 ? orderTotal / customerOrders.length : 0;
  const lastPayment = customerPayments
    .map((p) => p.receivedAt)
    .filter(Boolean)
    .sort()
    .pop();

  const usage = creditUsagePercent(account);
  const creditLimit = account?.creditLimit ?? 0;
  const usedLimit = account ? Math.abs(account.balance) : 0;
  const remaining =
    account?.creditLimit != null
      ? formatTryMoney(Math.max(account.creditLimit - Math.abs(account.balance), 0), account.currency)
      : "—";

  const warnings: { title: string; detail: string }[] = [];
  if (openOrderAmount > 0 && creditLimit > 0 && openOrderAmount > creditLimit * 0.5) {
    warnings.push({
      title: "Açık sipariş tutarı yüksek",
      detail: `Toplam açık sipariş: ${formatTryMoney(openOrderAmount, account?.currency)}.`
    });
  }
  if (usage >= 75) {
    warnings.push({
      title: "Risk limiti kullanım oranı yüksek",
      detail: `Kullanım oranı ${formatUsagePct(usage)} seviyesinde.`
    });
  }
  if (account && account.overdueAmount > 0) {
    warnings.push({
      title: "Vadesi geçmiş bakiye",
      detail: `${formatTryMoney(account.overdueAmount, account.currency)} tahsilat bekliyor.`
    });
  }

  const groupLabel = resolveCustomerDisplayType(customer.type);
  const priceGroup = customer.pricingProfile.priceSlotLabelSnapshot ?? "—";

  return {
    customerId,
    demoBanner: null,
    tabs: CDM_TABS,
    hero: {
      initials: customerInitials(customer.name),
      title: customer.name,
      status: customer.active === false ? "Pasif" : "Aktif",
      meta: [
        { label: "Cari Kodu", value: customer.code },
        { label: "Cari Grubu", value: groupLabel },
        { label: "Vergi Dairesi", value: customer.taxOffice || "—" },
        { label: "VKN", value: customer.taxNumber || "—" }
      ]
    },
    summary: {
      title: CDM_SUMMARY.title,
      fields: [
        { label: "Cari Adı", value: customer.name },
        { label: "Firma Ünvanı", value: customer.name },
        { label: "Cari Grubu", value: groupLabel },
        { label: "Fiyat Grubu", value: priceGroup },
        { label: "Para Birimi", value: account?.currency ?? "TRY" },
        { label: "Durum", value: customer.active === false ? "Pasif" : "Aktif", badge: true },
        { label: "Kayıt Tarihi", value: formatTrDateTime(customer.createdAt) },
        { label: "Son Güncelleme", value: formatTrDateTime(customer.updatedAt) }
      ],
      address: customer.addressLine
        ? `${customer.addressLine}${customer.district ? `, ${customer.district}` : ""} / ${customer.city ?? ""}`
        : "—",
      tags: [
        ...(customer.riskLevel === "high" || customer.riskLevel === "blocked"
          ? [{ label: "Riskli", tone: "gold" as const }]
          : []),
        { label: groupLabel, tone: "green" as const },
        ...(customer.whatsappMatched ? [{ label: "WhatsApp", tone: "neutral" as const }] : [])
      ]
    },
    commercial: {
      title: CDM_COMMERCIAL.title,
      fields: [
        {
          label: "Kredi Limiti",
          value: account?.creditLimit != null ? formatTryMoney(account.creditLimit, account.currency) : "—"
        },
        {
          label: "Güncel Bakiye",
          value: row.balanceLabel
        },
        {
          label: "Vadesi Geçmiş",
          value: account ? formatTryMoney(account.overdueAmount, account.currency) : "—"
        },
        { label: "Fiyat Listesi", value: priceGroup },
        { label: "Risk", value: row.riskLabel }
      ],
      rep: {
        initials: primary ? customerInitials(primary.fullName) : "—",
        name: primary?.fullName ?? "—"
      },
      contacts: [
        ...(customer.phone ? [{ id: "phone", label: "Telefon", value: customer.phone }] : []),
        ...(customer.email ? [{ id: "email", label: "E-posta", value: customer.email }] : []),
        ...(primary?.phone && primary.phone !== customer.phone
          ? [{ id: "mobile", label: "Mobil", value: primary.phone }]
          : [])
      ],
      note: primary?.title ? `${primary.fullName} — ${primary.title}` : "—"
    },
    performance: {
      title: CDM_PERFORMANCE.title,
      rows: [
        {
          label: "Toplam Sipariş Tutarı",
          value: formatTryMoney(orderTotal, account?.currency ?? "TRY"),
          icon: "chart"
        },
        {
          label: "Toplam Tahsilat",
          value: formatTryMoney(paymentTotal, account?.currency ?? "TRY"),
          icon: "wallet"
        },
        {
          label: "Toplam Sipariş",
          value: String(customerOrders.length),
          icon: "cart"
        },
        {
          label: "Açık Sipariş Tutarı",
          value: formatTryMoney(openOrderAmount, account?.currency ?? "TRY"),
          icon: "open"
        },
        {
          label: "Ortalama Sipariş Tutarı",
          value: formatTryMoney(avgOrder, account?.currency ?? "TRY"),
          icon: "avg"
        },
        {
          label: "Son Sipariş Tarihi",
          value: formatTrDate(customer.lastOrderAt),
          icon: "calendar"
        },
        {
          label: "Son Tahsilat Tarihi",
          value: formatTrDate(lastPayment),
          icon: "calendar"
        }
      ]
    },
    risk: {
      title: CDM_RISK.title,
      fields: [
        {
          label: "Kredi Limiti",
          value: account?.creditLimit != null ? formatTryMoney(creditLimit, account.currency) : "—"
        },
        {
          label: "Kullanılan Limit",
          value: account ? formatTryMoney(usedLimit, account.currency) : "—"
        },
        { label: "Kalan Limit", value: remaining }
      ],
      usageLabel: CDM_RISK.usageLabel,
      usagePct: formatUsagePct(usage),
      usageValue: usage
    },
    context: {
      title: CDM_CONTEXT.title,
      rows: [
        { label: "Sektör", value: groupLabel },
        { label: "Müşteri Tipi", value: resolveCustomerDisplayType(customer.type) },
        { label: "Açık Teklif", value: String(account?.openOfferCount ?? customerOffers.length) },
        { label: "Açık Sipariş", value: String(account?.openOrderCount ?? openOrders.length) },
        { label: "Çalışma Durumu", value: customer.active === false ? "Pasif" : "Devam Ediyor", live: true },
        { label: "Son Sipariş", value: formatTrDate(customer.lastOrderAt) },
        {
          label: "Son Tahsilat",
          value: account?.lastPaymentAt ? formatTrDate(account.lastPaymentAt) : formatTrDate(lastPayment)
        }
      ]
    },
    warnings: {
      title: CDM_WARNINGS.title,
      items: warnings.length > 0 ? warnings : CDM_WARNINGS.items.slice(0, 1)
    },
    nextSteps: {
      title: CDM_NEXT_STEPS.title,
      items: [
        ...(customerOffers[0]
          ? [
              {
                label: `Teklif ${mapOfferToRow(customerOffers[0], customer).offerNo} takibi`,
                date: formatTrDate(customerOffers[0].updatedAt)
              }
            ]
          : []),
        ...(openOrders[0]
          ? [
              {
                label: `Sipariş ${mapOrderRow(openOrders[0], [customer]).orderNo} operasyonu`,
                date: formatTrDate(openOrders[0].updatedAt)
              }
            ]
          : []),
        ...(warnings.length === 0
          ? CDM_NEXT_STEPS.items.slice(0, 1)
          : [{ label: "Risk değerlendirmesi yap", date: formatTrDate(new Date().toISOString()) }])
      ],
      cta: CDM_NEXT_STEPS.cta
    }
  };
}

export function loadCarilerDetayReferenceDemo(): CarilerDetayReferenceSnapshot {
  return {
    customerId: REFERENCE_ROUTE_IDS.customerId,
    demoBanner: REFERENCE_DEMO_BANNER,
    tabs: CDM_TABS,
    hero: {
      initials: CDM_HERO.initials,
      title: CDM_HERO.title,
      status: CDM_HERO.status,
      meta: CDM_HERO.meta.map((m) => ({ label: m.label, value: m.value }))
    },
    summary: {
      title: CDM_SUMMARY.title,
      fields: CDM_SUMMARY.fields.map((f) => ({ label: f.label, value: f.value, ...("badge" in f && f.badge ? { badge: true } : {}) })),
      address: CDM_SUMMARY.address,
      tags: CDM_SUMMARY.tags.map((t) => ({ label: t.label, tone: t.tone }))
    },
    commercial: {
      title: CDM_COMMERCIAL.title,
      fields: CDM_COMMERCIAL.fields.map((f) => ({ label: f.label, value: f.value })),
      rep: { ...CDM_COMMERCIAL.rep },
      contacts: CDM_COMMERCIAL.contacts.map((c) => ({ id: c.id, label: c.label, value: c.value })),
      note: CDM_COMMERCIAL.note
    },
    performance: {
      title: CDM_PERFORMANCE.title,
      rows: CDM_PERFORMANCE.rows.map((r) => ({ label: r.label, value: r.value, icon: r.icon }))
    },
    risk: {
      title: CDM_RISK.title,
      fields: CDM_RISK.fields.map((f) => ({ label: f.label, value: f.value })),
      usageLabel: CDM_RISK.usageLabel,
      usagePct: CDM_RISK.usagePct,
      usageValue: 57.33
    },
    context: {
      title: CDM_CONTEXT.title,
      rows: CDM_CONTEXT.rows.map((r) => ({
        label: r.label,
        value: r.value,
        ...("live" in r && r.live ? { live: true } : {})
      }))
    },
    warnings: {
      title: CDM_WARNINGS.title,
      items: CDM_WARNINGS.items.map((i) => ({ title: i.title, detail: i.detail }))
    },
    nextSteps: {
      title: CDM_NEXT_STEPS.title,
      items: CDM_NEXT_STEPS.items.map((i) => ({ label: i.label, date: i.date })),
      cta: CDM_NEXT_STEPS.cta
    }
  };
}

export async function loadCarilerDetayReferenceLive(
  customerId: string
): Promise<CarilerDetayReferenceSnapshot> {
  const [{ customer, account, contacts }, { orders }, { offers }, { payments }] = await Promise.all([
    getCustomerDetail(customerId),
    getOrders(),
    getOffers(),
    getPayments()
  ]);

  if (!customer) {
    return loadCarilerDetayReferenceDemo();
  }

  return buildLiveSnapshot(customerId, customer, account, contacts, orders, offers, payments);
}

export const CARILER_DETAY_REFERENCE_INITIAL = loadCarilerDetayReferenceDemo();
