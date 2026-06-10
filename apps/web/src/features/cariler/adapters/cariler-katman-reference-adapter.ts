// @ts-nocheck — katman snapshot tipleri mock ile hizalı; PREMIUM veri eşlemesi öncelikli.
import type { Customer, CustomerAccount, CustomerContact, CustomerLedgerEntry, Offer, PaymentReceipt, SaleOrder } from "@hallederiz/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { REFERENCE_ROUTE_IDS } from "../../../lib/reference/reference-route-ids";
import { getCustomerDetail } from "../../customers/queries/get-customers";
import { mapCustomerToRow } from "../../customers/mappers/map-customer-row";
import { getOffers } from "../../offers/queries/get-offers";
import { mapOfferToRow } from "../../offers/mappers/map-offer-row";
import { getOfferStatusLabel } from "../../offers/queries/offer-mock-data";
import { getOrders } from "../../orders/queries/get-orders";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getPayments } from "../../payments/queries/get-payments";
import { mapPaymentRow } from "../../payments/mappers/map-payment-row";
import {
  CKM_CONTEXT,
  CKM_HEADERS,
  CKM_HEADER,
  CKM_TABS,
  CKM_TAB_STRIPS,
  FINANS_AGING,
  FINANS_AGING_TOTAL,
  FINANS_CONTEXT,
  FINANS_KPIS,
  ILETISIM_CONTACTS,
  ILETISIM_CONTEXT,
  ILETISIM_SUMMARY,
  OZET_KPIS,
  OZET_RECORDS,
  OZET_RECORD_TABS,
  SIPARISLER_CONTEXT,
  SIPARISLER_ROWS,
  TAHSILATLAR_CONTEXT,
  TAHSILATLAR_ROWS,
  TEKLIFLER_FILTER,
  TEKLIFLER_ROWS,
  TIMELINE_CONTEXT,
  TIMELINE_EVENTS,
  TIMELINE_FILTERS,
  type CkmHeaderData,
  type CkmTabId,
  type CkmTabStripItem
} from "../data/cariler-katman-mock";
import {
  buildKatmanHeader,
  creditUsagePercent,
  customerInitials,
  formatLedgerTimelineGroup,
  formatLedgerTimelineTime,
  formatTryMoney,
  formatTrDate,
  formatTrDateTime,
  formatUsagePct,
  ledgerToTimelineTone,
  ledgerToTimelineType
} from "./cariler-entity-reference-utils";

type BadgeTone = "ok" | "warn" | "bad" | "info" | "blue" | "neutral" | "purple" | "orange" | "green";

function buildKatmanNavigation(): {
  tabs: CkmTabStripItem[];
  tabStrips: Partial<Record<CkmTabId, CkmTabStripItem[]>>;
} {
  const tabStrips: Partial<Record<CkmTabId, CkmTabStripItem[]>> = {};
  for (const key of Object.keys(CKM_TAB_STRIPS) as CkmTabId[]) {
    const strip = CKM_TAB_STRIPS[key];
    if (strip) tabStrips[key] = strip.map((t) => ({ ...t }));
  }
  return {
    tabs: CKM_TABS.map((t) => ({ ...t })),
    tabStrips
  };
}

export type CarilerKatmanReferenceSnapshot = {
  customerId: string;
  demoBanner: string | null;
  navigation: {
    tabs: CkmTabStripItem[];
    tabStrips: Partial<Record<CkmTabId, CkmTabStripItem[]>>;
  };
  headers: Record<CkmTabId, CkmHeaderData>;
  context: {
    title: string;
    cari: { label: string; value: string; badge?: string }[];
    finans: { label: string; value: string; warn?: boolean; negative?: boolean }[];
    hareketler: { type: string; title: string; date: string; amount: string }[];
    shortcuts: string[];
  };
  ozet: {
    kpis: {
      id: string;
      label: string;
      value: string;
      sub: string;
      tone: "green" | "orange" | "teal" | "blue" | "purple";
      progress?: number;
      subWarn?: boolean;
    }[];
    recordTabs: { id: string; label: string; count: number; active?: boolean }[];
    records: {
      no: string;
      docDate: string;
      dueDate: string;
      desc: string;
      amount: string;
      open: string;
      status: string;
      tone: BadgeTone;
    }[];
  };
  iletisim: {
    summary: { label: string; value: string; sub: string }[];
    contacts: { initials: string; name: string; role: string; phone: string; email: string }[];
    context: typeof ILETISIM_CONTEXT;
  };
  finans: {
    kpis: { id: string; label: string; value: string; tone: BadgeTone; progress?: number }[];
    aging: typeof FINANS_AGING;
    agingTotal: typeof FINANS_AGING_TOTAL;
    context: typeof FINANS_CONTEXT;
  };
  siparisler: {
    rows: { no: string; amount: string; status: string; delivery: string; tone: BadgeTone }[];
    context: typeof SIPARISLER_CONTEXT;
  };
  teklifler: {
    rows: { no: string; amount: string; status: string; date: string; tone: BadgeTone }[];
    filter: typeof TEKLIFLER_FILTER;
  };
  tahsilatlar: {
    rows: { no: string; amount: string; method: string; status: string; tone: BadgeTone }[];
    context: typeof TAHSILATLAR_CONTEXT;
  };
  timeline: {
    filters: typeof TIMELINE_FILTERS;
    events: {
      id: string;
      group: string;
      title: string;
      desc: string;
      user: string;
      time: string;
      type: string;
      tone: string;
    }[];
    context: typeof TIMELINE_CONTEXT;
  };
};

function orderStatusTone(statusLabel: string): BadgeTone {
  if (statusLabel.includes("İptal")) return "bad";
  if (statusLabel.includes("Teslim")) return "ok";
  if (statusLabel.includes("Hazır") || statusLabel.includes("Bekl")) return "info";
  if (statusLabel.includes("Kargo")) return "blue";
  return "ok";
}

function offerStatusTone(status: Offer["status"]): BadgeTone {
  if (status === "rejected" || status === "expired") return "bad";
  if (status === "approved" || status === "converted") return "ok";
  if (status === "draft") return "neutral";
  return "info";
}

function paymentStatusTone(tone: ReturnType<typeof mapPaymentRow>["statusTone"]): BadgeTone {
  if (tone === "danger") return "bad";
  if (tone === "warning") return "warn";
  if (tone === "success") return "ok";
  if (tone === "neutral") return "neutral";
  return "info";
}

function buildHeaders(customer: Customer, account: CustomerAccount | null, contact: CustomerContact | null): Record<CkmTabId, CkmHeaderData> {
  const base = buildKatmanHeader(customer, account, contact, "Cari Katman");
  return {
    ozet: buildKatmanHeader(customer, account, contact, "Cari Özet Masası"),
    iletisim: buildKatmanHeader(customer, account, contact, customer.name),
    finans: buildKatmanHeader(customer, account, contact, "Katman: Finans"),
    teklifler: base,
    siparisler: base,
    tahsilatlar: base,
    timeline: buildKatmanHeader(customer, account, contact, "Müşteri Detayı")
  };
}

function buildContext(
  customer: Customer,
  account: CustomerAccount | null,
  ledger: CustomerLedgerEntry[],
  orders: SaleOrder[],
  payments: PaymentReceipt[]
): CarilerKatmanReferenceSnapshot["context"] {
  const row = mapCustomerToRow(customer, account);
  const usage = creditUsagePercent(account);
  const remaining =
    account?.creditLimit != null
      ? formatTryMoney(Math.max(account.creditLimit - Math.abs(account.balance), 0), account.currency)
      : "—";

  const hareketler = [
    ...payments.slice(0, 2).map((p) => ({
      type: "tahsilat",
      title: "Tahsilat",
      date: formatTrDate(p.receivedAt),
      amount: formatTryMoney(p.amount, p.currency)
    })),
    ...orders.slice(0, 2).map((o) => ({
      type: "siparis",
      title: "Sipariş",
      date: formatTrDate(o.updatedAt),
      amount: formatTryMoney(o.grandTotal, o.currency)
    })),
    ...ledger.slice(0, 2).map((e) => ({
      type: e.referenceType === "payment" ? "tahsilat" : "fatura",
      title: e.description,
      date: formatTrDate(e.occurredAt),
      amount: formatTryMoney(e.amount, e.currency)
    }))
  ].slice(0, 3);

  return {
    title: CKM_CONTEXT.title,
    cari: [
      { label: "Cari Kodu", value: customer.code },
      { label: "Cari Adı", value: customer.name },
      { label: "Cari Grubu", value: row.typeLabel },
      { label: "Fiyat Grubu", value: row.priceGroupLabel },
      { label: "Para Birimi", value: account?.currency ?? "TRY" },
      { label: "Durum", value: customer.active === false ? "Pasif" : "Aktif", badge: "ok" }
    ],
    finans: [
      {
        label: "Risk Limiti",
        value: account?.creditLimit != null ? formatTryMoney(account.creditLimit, account.currency) : "—"
      },
      {
        label: "Kullanılan Limit",
        value: account ? formatTryMoney(Math.abs(account.balance), account.currency) : "—"
      },
      { label: "Kalan Limit", value: remaining },
      { label: "Açık Bakiye", value: row.balanceLabel, warn: true },
      {
        label: "Vadesi Geçmiş",
        value: account ? formatTryMoney(account.overdueAmount, account.currency) : "—",
        negative: (account?.overdueAmount ?? 0) > 0
      },
      { label: "Kullanım", value: formatUsagePct(usage) }
    ],
    hareketler: hareketler.length > 0 ? hareketler : CKM_CONTEXT.hareketler.map((h) => ({ ...h })),
    shortcuts: [...CKM_CONTEXT.shortcuts]
  };
}

function buildLiveSnapshot(
  customerId: string,
  customer: Customer,
  account: CustomerAccount | null,
  contacts: CustomerContact[],
  ledger: CustomerLedgerEntry[],
  orders: SaleOrder[],
  offers: Offer[],
  payments: PaymentReceipt[]
): CarilerKatmanReferenceSnapshot {
  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0] ?? null;
  const customerOrders = orders.filter((o) => o.customerId === customerId);
  const customerOffers = offers.filter((o) => o.customerId === customerId);
  const customerPayments = payments.filter((p) => p.customerId === customerId);
  const row = mapCustomerToRow(customer, account);
  const usage = creditUsagePercent(account);

  const openOrders = customerOrders.filter(
    (o) => o.status !== "completed" && o.status !== "delivered" && o.status !== "cancelled"
  );
  const openOrderAmount = openOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const paymentTotal = customerPayments
    .filter((p) => p.status !== "reversed")
    .reduce((sum, p) => sum + p.amount, 0);

  const orderRows = customerOrders.slice(0, 8).map((order) => {
    const mapped = mapOrderRow(order, [customer]);
    return {
      no: mapped.orderNo,
      amount: mapped.totalLabel.startsWith("₺") ? mapped.totalLabel : `₺${mapped.totalLabel}`,
      status: mapped.statusLabel,
      delivery: formatTrDate(order.updatedAt),
      tone: orderStatusTone(mapped.statusLabel)
    };
  });

  const firstOrder = customerOrders[0];
  const firstOrderRow = firstOrder ? mapOrderRow(firstOrder, [customer]) : null;

  const offerRows = customerOffers.slice(0, 8).map((offer) => {
    const mapped = mapOfferToRow(offer, customer);
    return {
      no: mapped.offerNo,
      amount: mapped.totalLabel,
      status: mapped.statusLabel,
      date: formatTrDate(offer.createdAt),
      tone: offerStatusTone(offer.status)
    };
  });

  const offerStatusCounts = customerOffers.reduce<Record<string, number>>((acc, offer) => {
    const label = getOfferStatusLabel(offer.status);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const paymentRows = customerPayments.slice(0, 8).map((payment) => {
    const mapped = mapPaymentRow(payment, [customer]);
    return {
      no: mapped.receiptNo,
      amount: mapped.amountLabel,
      method: mapped.methodLabel,
      status: mapped.statusLabel,
      tone: paymentStatusTone(mapped.statusTone)
    };
  });

  const completedPayments = customerPayments.filter((p) => p.status !== "reversed");
  const pendingPayments = customerPayments.filter((p) => p.status === "draft" || p.status === "confirmed");
  const reversedPayments = customerPayments.filter((p) => p.status === "reversed");

  const ledgerEvents = ledger
    .slice()
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 8)
    .map((entry, index) => ({
      id: entry.id,
      group: formatLedgerTimelineGroup(entry.occurredAt),
      title: entry.description,
      desc: `${entry.referenceType.toUpperCase()} · ${entry.referenceId}`,
      user: primary?.fullName ?? customer.name,
      time: formatLedgerTimelineTime(entry.occurredAt),
      type: ledgerToTimelineType(entry),
      tone: ledgerToTimelineTone(entry)
    }));

  const ozetRecordsFromLedger = ledger.slice(0, 5).map((entry) => ({
    no: entry.referenceId,
    docDate: formatTrDate(entry.occurredAt),
    dueDate: "—",
    desc: entry.description,
    amount: formatTryMoney(entry.amount, entry.currency),
    open: entry.direction === "debit" ? formatTryMoney(entry.amount, entry.currency) : "—",
    status: entry.direction === "debit" ? "Açık" : "Kapalı",
    tone: (entry.direction === "debit" ? "ok" : "neutral") as BadgeTone
  }));

  return {
    customerId,
    demoBanner: null,
    navigation: buildKatmanNavigation(),
    headers: buildHeaders(customer, account, primary),
    context: buildContext(customer, account, ledger, customerOrders, customerPayments),
    ozet: {
      kpis: [
        {
          id: "risk",
          label: "Risk Limiti",
          value: account?.creditLimit != null ? formatTryMoney(account.creditLimit, account.currency) : "—",
          sub: `${formatUsagePct(usage)} kullanıldı`,
          tone: "green",
          progress: usage
        },
        {
          id: "balance",
          label: "Açık Bakiye",
          value: row.balanceLabel,
          sub: account?.overdueAmount
            ? `Vadesi Geçmiş: ${formatTryMoney(account.overdueAmount, account.currency)}`
            : "Vadesi geçmiş yok",
          tone: "orange",
          subWarn: (account?.overdueAmount ?? 0) > 0
        },
        {
          id: "purchase",
          label: "Toplam Sipariş",
          value: formatTryMoney(
            customerOrders.reduce((s, o) => s + o.grandTotal, 0),
            account?.currency ?? "TRY"
          ),
          sub: `Son Sipariş: ${formatTrDate(customer.lastOrderAt)}`,
          tone: "teal"
        },
        {
          id: "collection",
          label: "Toplam Tahsilat",
          value: formatTryMoney(paymentTotal, account?.currency ?? "TRY"),
          sub: `Son Tahsilat: ${formatTrDate(account?.lastPaymentAt)}`,
          tone: "blue"
        },
        {
          id: "orders",
          label: "Açık Sipariş",
          value: formatTryMoney(openOrderAmount, account?.currency ?? "TRY"),
          sub: `Sipariş Sayısı: ${openOrders.length}`,
          tone: "purple"
        }
      ],
      recordTabs: [
        { id: "faturalar", label: "Açık Faturalar", count: ozetRecordsFromLedger.length, active: true },
        { id: "teklifler", label: "Teklifler", count: customerOffers.length },
        { id: "siparisler", label: "Açık Siparişler", count: openOrders.length },
        { id: "tahsilatlar", label: "Tahsilatlar", count: customerPayments.length },
        { id: "iletisim", label: "İletişim Kayıtları", count: contacts.length }
      ],
      records:
        ozetRecordsFromLedger.length > 0
          ? ozetRecordsFromLedger
          : OZET_RECORDS.map((r) => ({ ...r, tone: r.tone as BadgeTone }))
    },
    iletisim: {
      summary: [
        { label: "Telefon", value: customer.phone || "—", sub: `${contacts.filter((c) => c.phone).length} Telefon` },
        { label: "E-posta", value: customer.email || "—", sub: `${contacts.filter((c) => c.email).length} E-posta` },
        {
          label: "Adres",
          value: customer.addressLine || "—",
          sub: `${customer.city ?? "—"}`
        }
      ],
      contacts: contacts.map((c) => ({
        initials: customerInitials(c.fullName),
        name: c.fullName,
        role: c.title ?? "—",
        phone: c.phone ?? "—",
        email: c.email ?? "—"
      })),
      context: {
        ...ILETISIM_CONTEXT,
        whatsapp: customer.phone || ILETISIM_CONTEXT.whatsapp,
        status: customer.whatsappMatched ? "Bağlı" : "Eşleşmedi"
      }
    },
    finans: {
      kpis: [
        { id: "open", label: "Açık Bakiye", value: row.balanceLabel, tone: "green" },
        {
          id: "due",
          label: "Vadesi Geçen",
          value: account ? formatTryMoney(account.overdueAmount, account.currency) : "—",
          tone: "orange"
        },
        {
          id: "overdue",
          label: "Kredi Limiti",
          value: account?.creditLimit != null ? formatTryMoney(account.creditLimit, account.currency) : "—",
          tone: "bad"
        },
        {
          id: "limit",
          label: "Kullanılan",
          value: account ? formatTryMoney(Math.abs(account.balance), account.currency) : "—",
          tone: "blue"
        },
        { id: "used", label: "Kullanım", value: formatUsagePct(usage), tone: "teal", progress: usage },
        { id: "risk", label: "Risk", value: row.riskLabel, tone: "purple" }
      ],
      aging: FINANS_AGING.map((r) => ({ ...r })),
      agingTotal: { ...FINANS_AGING_TOTAL },
      context: {
        ...FINANS_CONTEXT,
        suggestion: {
          ...FINANS_CONTEXT.suggestion,
          amount: row.balanceLabel
        },
        kpis: [
          { label: "Açık Bakiye", value: row.balanceLabel },
          {
            label: "Vadesi Geçen",
            value: account ? formatTryMoney(account.overdueAmount, account.currency) : "—"
          },
          { label: "Açık Teklif", value: String(account?.openOfferCount ?? customerOffers.length) },
          { label: "Açık Sipariş", value: String(openOrders.length) }
        ],
        updated: formatTrDateTime(customer.updatedAt)
      }
    },
    siparisler: {
      rows: orderRows.length > 0 ? orderRows : SIPARISLER_ROWS.map((r) => ({ ...r })),
      context: {
        ...SIPARISLER_CONTEXT,
        no: firstOrderRow?.orderNo ?? SIPARISLER_CONTEXT.no,
        status: firstOrderRow?.statusLabel ?? SIPARISLER_CONTEXT.status,
        fields: firstOrder
          ? [
              { label: "Sipariş Tarihi", value: formatTrDateTime(firstOrder.createdAt) },
              { label: "Teslim Tarihi", value: formatTrDate(firstOrder.updatedAt) },
              {
                label: "Tutar",
                value: formatTryMoney(firstOrder.grandTotal, firstOrder.currency)
              },
              { label: "Para Birimi", value: firstOrder.currency },
              { label: "Durum", value: firstOrderRow?.statusLabel ?? "—" },
              { label: "Ödeme", value: firstOrderRow?.paymentStatusLabel ?? "—" },
              { label: "Açıklama", value: "—" }
            ]
          : SIPARISLER_CONTEXT.fields.map((f) => ({ ...f })),
        totalRecords: customerOrders.length
      }
    },
    teklifler: {
      rows: offerRows.length > 0 ? offerRows : TEKLIFLER_ROWS.map((r) => ({ ...r })),
      filter: {
        ...TEKLIFLER_FILTER,
        total: customerOffers.length,
        statuses: Object.entries(offerStatusCounts).map(([label, count]) => ({ label, count }))
      }
    },
    tahsilatlar: {
      rows: paymentRows.length > 0 ? paymentRows : TAHSILATLAR_ROWS.map((r) => ({ ...r })),
      context: {
        ...TAHSILATLAR_CONTEXT,
        summary: [
          {
            label: "Toplam Tahsilat",
            value: formatTryMoney(paymentTotal, account?.currency ?? "TRY"),
            tone: "ok" as const
          },
          {
            label: "Bekleyen Tahsilat",
            value: formatTryMoney(
              pendingPayments.reduce((s, p) => s + p.amount, 0),
              account?.currency ?? "TRY"
            ),
            tone: "warn" as const
          },
          {
            label: "İptal Edilen Tahsilat",
            value: formatTryMoney(
              reversedPayments.reduce((s, p) => s + p.amount, 0),
              account?.currency ?? "TRY"
            ),
            tone: "bad" as const
          }
        ],
        dates: [
          {
            label: "Son Tahsilat",
            value: formatTrDateTime(completedPayments[0]?.receivedAt ?? account?.lastPaymentAt)
          },
          { label: "Kayıt Sayısı", value: String(customerPayments.length) },
          { label: "Ortalama", value: customerPayments.length > 0 ? formatTryMoney(paymentTotal / customerPayments.length, account?.currency ?? "TRY") : "—" }
        ]
      }
    },
    timeline: {
      filters: { ...TIMELINE_FILTERS },
      events:
        ledgerEvents.length > 0
          ? ledgerEvents
          : TIMELINE_EVENTS.map((e) => ({ ...e })),
      context: {
        ...TIMELINE_CONTEXT,
        related: [
          { label: "Müşteri", value: customer.name },
          { label: "Yetkili Kişi", value: primary?.fullName ?? "—" }
        ],
        offers: customerOffers.slice(0, 3).map((o) => ({
          no: o.offerNo,
          status: getOfferStatusLabel(o.status),
          amount: formatTryMoney(o.grandTotal, o.currency)
        })),
        payments: completedPayments.slice(0, 3).map((p) => ({
          date: formatTrDate(p.receivedAt),
          amount: formatTryMoney(p.amount, p.currency),
          status: mapPaymentRow(p, [customer]).statusLabel
        }))
      }
    }
  };
}

function cloneDemoKatman(): CarilerKatmanReferenceSnapshot {
  return {
    customerId: REFERENCE_ROUTE_IDS.customerId,
    demoBanner: REFERENCE_DEMO_BANNER,
    navigation: buildKatmanNavigation(),
    headers: { ...CKM_HEADERS, ozet: CKM_HEADER },
    context: {
      title: CKM_CONTEXT.title,
      cari: CKM_CONTEXT.cari.map((r) => ({ ...r })),
      finans: CKM_CONTEXT.finans.map((r) => ({ ...r })),
      hareketler: CKM_CONTEXT.hareketler.map((h) => ({ ...h })),
      shortcuts: [...CKM_CONTEXT.shortcuts]
    },
    ozet: {
      kpis: OZET_KPIS.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
        sub: k.sub,
        tone: k.tone,
        ...("progress" in k ? { progress: k.progress } : {}),
        ...("subWarn" in k ? { subWarn: k.subWarn } : {})
      })),
      recordTabs: OZET_RECORD_TABS.map((t) => ({ ...t })),
      records: OZET_RECORDS.map((r) => ({ ...r, tone: r.tone as BadgeTone }))
    },
    iletisim: {
      summary: ILETISIM_SUMMARY.map((s) => ({ ...s })),
      contacts: ILETISIM_CONTACTS.map((c) => ({ ...c })),
      context: { ...ILETISIM_CONTEXT }
    },
    finans: {
      kpis: FINANS_KPIS.map((k) => ({ ...k, tone: k.tone as BadgeTone })),
      aging: FINANS_AGING.map((r) => ({ ...r })),
      agingTotal: { ...FINANS_AGING_TOTAL },
      context: { ...FINANS_CONTEXT }
    },
    siparisler: {
      rows: SIPARISLER_ROWS.map((r) => ({ ...r })),
      context: { ...SIPARISLER_CONTEXT, fields: SIPARISLER_CONTEXT.fields.map((f) => ({ ...f })), delivery: SIPARISLER_CONTEXT.delivery.map((d) => ({ ...d })) }
    },
    teklifler: {
      rows: TEKLIFLER_ROWS.map((r) => ({ ...r })),
      filter: { ...TEKLIFLER_FILTER, statuses: TEKLIFLER_FILTER.statuses.map((s) => ({ ...s })) }
    },
    tahsilatlar: {
      rows: TAHSILATLAR_ROWS.map((r) => ({ ...r })),
      context: {
        ...TAHSILATLAR_CONTEXT,
        summary: TAHSILATLAR_CONTEXT.summary.map((s) => ({ ...s })),
        dates: TAHSILATLAR_CONTEXT.dates.map((d) => ({ ...d })),
        actions: [...TAHSILATLAR_CONTEXT.actions]
      }
    },
    timeline: {
      filters: { ...TIMELINE_FILTERS, types: TIMELINE_FILTERS.types.map((t) => ({ ...t })) },
      events: TIMELINE_EVENTS.map((e) => ({ ...e })),
      context: {
        ...TIMELINE_CONTEXT,
        related: TIMELINE_CONTEXT.related.map((r) => ({ ...r })),
        opportunities: TIMELINE_CONTEXT.opportunities.map((o) => ({ ...o })),
        offers: TIMELINE_CONTEXT.offers.map((o) => ({ ...o })),
        contracts: TIMELINE_CONTEXT.contracts.map((c) => ({ ...c })),
        payments: TIMELINE_CONTEXT.payments.map((p) => ({ ...p }))
      }
    }
  };
}

export function loadCarilerKatmanReferenceDemo(): CarilerKatmanReferenceSnapshot {
  return cloneDemoKatman();
}

export async function loadCarilerKatmanReferenceLive(customerId: string): Promise<CarilerKatmanReferenceSnapshot> {
  const [{ customer, account, contacts, ledgerEntries }, { orders }, { offers }, { payments }] = await Promise.all([
    getCustomerDetail(customerId),
    getOrders(),
    getOffers(),
    getPayments()
  ]);

  if (!customer) {
    return cloneDemoKatman();
  }

  return buildLiveSnapshot(
    customerId,
    customer,
    account,
    contacts,
    ledgerEntries,
    orders,
    offers,
    payments
  );
}

export const CARILER_KATMAN_REFERENCE_INITIAL = loadCarilerKatmanReferenceDemo();

