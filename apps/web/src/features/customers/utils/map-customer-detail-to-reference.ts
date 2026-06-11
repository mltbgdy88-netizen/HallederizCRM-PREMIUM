import { calculateCustomerRiskState } from "@hallederiz/domain";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerLedgerEntry,
  Offer
} from "@hallederiz/types";
import { customerEntityHref } from "../../ui-inventory/utils/entity-layer-nav";
import type { CustomerDetailQueryResult } from "../queries/get-customers";
import {
  creditUsageRatio,
  customerGroupLabel,
  customerInitials,
  customerPriceGroupLabel,
  customerStatusLabel,
  formatCustomerDate,
  formatCustomerDateOnly,
  formatCustomerMoney,
  formatPercent
} from "./customer-reference-format";
import { customerRiskLabelFromProfile } from "./customer-detail-helpers";

export type CdmDetailTabId = "ozet" | "iletisim" | "finans" | "teklifler" | "siparisler" | "tahsilatlar" | "timeline";

export type CdmNextStepItem = {
  label: string;
  date: string;
};

export type CdmSalesRep = {
  initials: string;
  name: string;
} | null;

export type CdmReferenceField = {
  label: string;
  value: string;
  badge?: boolean;
};

export type CdmReferenceTag = {
  label: string;
  tone: "gold" | "green" | "neutral";
};

export type CdmPerformanceRow = {
  label: string;
  value: string;
  icon: "chart" | "wallet" | "cart" | "calendar" | "open" | "avg";
};

export type CdmWarningItem = {
  title: string;
  detail: string;
};

export type CdmQuickAction = {
  label: string;
  href: string;
};

export type CustomerDetailReferenceView = {
  customerId: string;
  hero: {
    initials: string;
    title: string;
    status: string;
    meta: CdmReferenceField[];
  };
  tabs: { id: CdmDetailTabId; label: string; href: string }[];
  summary: {
    title: string;
    fields: CdmReferenceField[];
    address: string;
    tags: CdmReferenceTag[];
  };
  commercial: {
    title: string;
    fields: CdmReferenceField[];
    rep: CdmSalesRep;
    contacts: { id: string; value: string }[];
    note: string | null;
  };
  performance: {
    title: string;
    rows: CdmPerformanceRow[];
  };
  risk: {
    title: string;
    fields: CdmReferenceField[];
    usageLabel: string;
    usagePct: string | null;
    usageFill: number | null;
  };
  context: {
    title: string;
    rows: { label: string; value: string; live?: boolean }[];
  };
  warnings: { title: string; items: CdmWarningItem[] } | null;
  nextSteps: {
    title: string;
    items: CdmNextStepItem[];
    cta: string;
    emptyMessage: string;
  };
  quickActions: CdmQuickAction[];
  financeLinked: boolean;
};

const DETAIL_TAB_LABELS: { id: Exclude<CdmDetailTabId, "detay">; label: string }[] = [
  { id: "ozet", label: "Özet" },
  { id: "iletisim", label: "İletişim" },
  { id: "finans", label: "Finans" },
  { id: "teklifler", label: "Teklifler" },
  { id: "siparisler", label: "Siparişler" },
  { id: "tahsilatlar", label: "Tahsilatlar" },
  { id: "timeline", label: "Zaman Akışı" }
];

function buildTags(customer: Customer, account: CustomerAccount | null): CdmReferenceTag[] {
  const tags: CdmReferenceTag[] = [{ label: customerGroupLabel(customer), tone: "green" }];
  if (customer.whatsappMatched) {
    tags.push({ label: "WhatsApp", tone: "gold" });
  }
  if (account && account.overdueAmount > 0) {
    tags.push({ label: "Vadesi geçmiş", tone: "neutral" });
  }
  return tags;
}

function buildWarnings(customer: Customer, account: CustomerAccount | null): CdmWarningItem[] {
  const items: CdmWarningItem[] = [];
  if (account && account.overdueAmount > 0) {
    items.push({
      title: "Vadesi geçmiş bakiye",
      detail: `${formatCustomerMoney(account.overdueAmount, account.currency)} tahsilat takibi gerektiriyor.`
    });
  }
  if (customer.riskLevel === "high" || customer.riskLevel === "blocked") {
    items.push({
      title: "Yüksek risk profili",
      detail: customerRiskLabelFromProfile(customer).description
    });
  }
  if (account?.creditLimit && account.balance > account.creditLimit * 0.75) {
    items.push({
      title: "Limit kullanımı yüksek",
      detail: "Kredi limiti kullanım oranı %75 üzerinde."
    });
  }
  return items;
}

function buildPerformanceRows(customer: Customer, account: CustomerAccount | null): CdmPerformanceRow[] {
  return [
    {
      label: "Toplam Ciro (Yıllık)",
      value: "—",
      icon: "chart"
    },
    {
      label: "Toplam Tahsilat (Yıllık)",
      value: "—",
      icon: "wallet"
    },
    {
      label: "Toplam Sipariş (Yıllık)",
      value: "—",
      icon: "cart"
    },
    {
      label: "Açık Sipariş Tutarı",
      value: "—",
      icon: "open"
    },
    {
      label: "Ortalama Sipariş Tutarı",
      value: "—",
      icon: "avg"
    },
    {
      label: "Son Sipariş Tarihi",
      value: formatCustomerDateOnly(customer.lastOrderAt),
      icon: "calendar"
    },
    {
      label: "Son Tahsilat Tarihi",
      value: formatCustomerDateOnly(account?.lastPaymentAt),
      icon: "calendar"
    }
  ];
}

function buildSalesRep(contacts: CustomerContact[]): CdmSalesRep {
  const primary = contacts.find((contact) => contact.isPrimary) ?? contacts[0];
  if (!primary) return null;
  return {
    initials: customerInitials(primary.fullName),
    name: primary.title ? `${primary.fullName} (${primary.title})` : primary.fullName
  };
}

function buildNextSteps(): CustomerDetailReferenceView["nextSteps"] {
  return {
    title: "Sonraki Adımlar",
    items: [],
    cta: "+ Yeni Aksiyon Ekle",
    emptyMessage: "Planlanmış aksiyon kaydı henüz bağlı değil; CRM görev API'si bağlandığında checklist burada görünür."
  };
}

function buildQuickActions(customerId: string): CdmQuickAction[] {
  return [
    { label: "Teklif oluştur", href: `/teklifler/yeni?customer=${customerId}` },
    { label: "Sipariş oluştur", href: `/siparisler/yeni?customer=${customerId}` },
    { label: "Tahsilat gir", href: `/tahsilatlar/yeni?customer=${customerId}` },
    { label: "WhatsApp geçmişi", href: `/whatsapp?customer=${customerId}` }
  ];
}

export function buildCustomerDetailTabs(customerId: string): CustomerDetailReferenceView["tabs"] {
  return DETAIL_TAB_LABELS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    href: customerEntityHref(customerId, tab.id)
  }));
}

export function mapCustomerToDetailReference(input: {
  customerId: string;
  data: CustomerDetailQueryResult;
  offers: Offer[];
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
}): CustomerDetailReferenceView {
  const { customerId, data, offers } = input;
  const customer = data.customer!;
  const account = data.account;
  const contacts = input.contacts ?? data.contacts;
  const addresses = input.addresses ?? data.addresses;
  const financeLinked = account !== null;
  const currency = account?.currency ?? "TRY";
  const risk = account ? calculateCustomerRiskState(customer, account) : customerRiskLabelFromProfile(customer);
  const usage = account ? creditUsageRatio(account) : null;
  const primaryAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
  const addressText = primaryAddress
    ? `${primaryAddress.line}, ${primaryAddress.district ? `${primaryAddress.district} / ` : ""}${primaryAddress.city}`
    : customer.addressLine || "—";

  const contactRows: { id: string; value: string }[] = [];
  if (customer.phone) contactRows.push({ id: "phone", value: customer.phone });
  if (customer.email) contactRows.push({ id: "email", value: customer.email });
  for (const contact of contacts.slice(0, 2)) {
    if (contact.phone) contactRows.push({ id: "mobile", value: `${contact.fullName}: ${contact.phone}` });
  }

  const warnings = buildWarnings(customer, account);

  return {
    customerId,
    hero: {
      initials: customerInitials(customer.name),
      title: customer.name,
      status: customerStatusLabel(customer),
      meta: [
        { label: "Cari Kodu", value: customer.code },
        { label: "Cari Grubu", value: customerGroupLabel(customer) },
        { label: "Vergi Dairesi", value: customer.taxOffice ?? "—" },
        { label: "VKN", value: customer.taxNumber ?? "—" }
      ]
    },
    tabs: buildCustomerDetailTabs(customerId),
    summary: {
      title: "Cari Özeti",
      fields: [
        { label: "Cari Adı", value: customer.name },
        { label: "Cari Kodu", value: customer.code },
        { label: "Cari Grubu", value: customerGroupLabel(customer) },
        { label: "Fiyat Grubu", value: customerPriceGroupLabel(customer) },
        { label: "Para Birimi", value: currency },
        { label: "Durum", value: customerStatusLabel(customer), badge: true },
        { label: "Kayıt Tarihi", value: formatCustomerDate(customer.createdAt) },
        { label: "Son Güncelleme", value: formatCustomerDate(customer.updatedAt) }
      ],
      address: addressText,
      tags: buildTags(customer, account)
    },
    commercial: {
      title: "Ticari Bilgiler",
      fields: [
        { label: "Ödeme Vadesi", value: "—" },
        {
          label: "Kredi Limiti",
          value: account?.creditLimit ? formatCustomerMoney(account.creditLimit, currency) : "—"
        },
        { label: "Risk Limiti", value: "—" },
        { label: "İskonto Oranı", value: "—" },
        { label: "Fiyat Listesi", value: customerPriceGroupLabel(customer) }
      ],
      rep: buildSalesRep(contacts),
      contacts: contactRows,
      note: financeLinked ? null : "Finans özeti henüz bağlı değil; ticari limit ve bakiye alanları hesap özeti bağlandığında güncellenir."
    },
    performance: {
      title: "Cari Performans Özeti",
      rows: buildPerformanceRows(customer, account)
    },
    risk: {
      title: "Risk ve Limit Durumu",
      fields: [
        {
          label: "Kredi Limiti",
          value: account?.creditLimit ? formatCustomerMoney(account.creditLimit, currency) : "—"
        },
        { label: "Açık Bakiye", value: account ? formatCustomerMoney(account.balance, currency) : "—" },
        { label: "Risk Limiti", value: "—" },
        {
          label: "Kullanılan Limit",
          value: account ? formatCustomerMoney(account.balance, currency) : "—"
        },
        {
          label: "Vadesi Geçmiş",
          value: account ? formatCustomerMoney(account.overdueAmount, currency) : "—"
        }
      ],
      usageLabel: "Kullanım Oranı",
      usagePct: usage !== null ? formatPercent(usage) : null,
      usageFill: usage
    },
    context: {
      title: "Cari Bağlamı",
      rows: [
        { label: "Müşteri Tipi", value: customerGroupLabel(customer) },
        { label: "WhatsApp Eşleşmesi", value: customer.whatsappMatched ? "Bağlı" : "Bağlı değil", live: customer.whatsappMatched },
        { label: "Son Sipariş", value: formatCustomerDateOnly(customer.lastOrderAt) },
        { label: "Son Ödeme", value: formatCustomerDateOnly(account?.lastPaymentAt) },
        { label: "Açık Teklif", value: account ? String(account.openOfferCount) : String(offers.length) },
        { label: "Risk Notu", value: risk.description }
      ]
    },
    warnings: warnings.length > 0 ? { title: "Uyarılar", items: warnings } : null,
    nextSteps: buildNextSteps(),
    quickActions: buildQuickActions(customerId),
    financeLinked
  };
}
