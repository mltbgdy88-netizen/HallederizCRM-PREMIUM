import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerLedgerEntry,
  Offer
} from "@hallederiz/types";
import { calculateCustomerRiskState } from "@hallederiz/domain";
import type { CustomerLayerKey } from "../../ui-inventory/utils/cariler-subroute-command-center-data";
import { customerEntityHref } from "../../ui-inventory/utils/entity-layer-nav";
import type { CustomerDetailQueryResult } from "../queries/get-customers";
import { customerRiskLabelFromProfile } from "./customer-detail-helpers";
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
import { buildCustomerDetailTabs } from "./map-customer-detail-to-reference";

export type CustomerLayerTab = {
  id: string;
  label: string;
  href: string;
};

export type CkmHeaderView = {
  breadcrumb: string[];
  initials: string;
  title: string;
  status: string;
  meta: { label: string; value: string }[];
  contact: { label: string; value: string }[];
};

export type CkmContextView = {
  title: string;
  cari: { label: string; value: string; badge?: boolean }[];
  finans: { label: string; value: string; negative?: boolean; warn?: boolean }[];
  hareketler: { type: string; title: string; date: string; amount: string }[];
  shortcuts: { label: string; href: string; icon: "offer" | "order" | "payment" | "card" }[];
};

export type CkmKpiCard = {
  id: string;
  label: string;
  value: string;
  sub?: string;
  tone: "green" | "teal" | "orange" | "blue" | "purple" | "bad";
  progress?: number;
  subWarn?: boolean;
};

export type CkmBadgeTone = "ok" | "warn" | "bad" | "info" | "blue" | "neutral" | "green" | "purple" | "orange" | "teal";

export type CkmLayerNavTab = {
  id: string;
  label: string;
  href: string;
};

export type CkmTableRow = Record<string, string>;

export type CkmTableRowMeta = {
  badges?: Record<string, CkmBadgeTone>;
  linkColumns?: string[];
  paymentMethod?: "cash" | "card" | "transfer" | "check" | "unknown";
};

export type CkmTablePagination = {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export type CkmTablePanel = {
  title: string;
  countLabel?: string;
  columns: string[];
  rows: CkmTableRow[];
  emptyMessage: string;
  emptyDetail?: string;
  footnote: string;
  createHref?: string;
  createLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  rowMeta?: CkmTableRowMeta[];
  showActions?: boolean;
  actionVariant?: "contact" | "document" | "payment";
  pagination?: CkmTablePagination;
};

export type CkmOzetRecordTab = {
  id: string;
  label: string;
  count: number;
  active?: boolean;
};

export type CkmIletisimSide = {
  title: string;
  whatsappPhone: string;
  status: string;
  lastMessage: string;
  preferred: string;
  quickActions: { id: string; label: string }[];
  whatsappHref: string | null;
};

export type CkmFinansSide = {
  title: string;
  suggestionAmount: string | null;
  suggestionStrategy: string;
  suggestionPlan: string;
  miniKpis: { label: string; value: string }[];
  ctaHref: string;
  updatedLabel: string;
};

export type CkmFinanceTab = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type CkmFinansAgingRow = {
  range: string;
  amount: string;
  pct: string;
  count: string;
  avgDays: string;
  desc: string;
  tone: "ok" | "warn" | "orange" | "bad" | "neutral";
  preparing?: boolean;
};

export type CkmFinansAgingTotal = {
  amount: string;
  pct: string;
  count: string;
  avgDays: string;
};

export type CustomerFinanceReferenceView = {
  customerId: string;
  header: CkmHeaderView;
  financeTabs: CkmFinanceTab[];
  kpis: CkmKpiCard[];
  agingRows: CkmFinansAgingRow[];
  agingTotal: CkmFinansAgingTotal;
  agingUpdatedLabel: string;
  finansSide: CkmFinansSide;
  hasAccount: boolean;
};

export type CkmTekliflerSide = {
  title: string;
  statuses: { label: string; count: number }[];
  total: number;
  dateRangeLabel: string;
  assigneePlaceholder: string;
  creatorPlaceholder: string;
};

export type CkmSiparislerSide = {
  title: string;
  orderNo: string | null;
  status: string | null;
  statusTone: CkmBadgeTone | null;
  fields: { label: string; value: string }[];
  delivery: { label: string; value: string }[];
  detailHref: string | null;
  emptyMessage: string;
};

export type CkmTahsilatlarSide = {
  title: string;
  summary: { label: string; value: string; tone?: "ok" | "warn" | "bad" }[];
  dates: { label: string; value: string }[];
  actions: { label: string; primary?: boolean; href?: string }[];
};

export type CkmTimelineEvent = {
  id: string;
  group: string;
  title: string;
  desc: string;
  user: string;
  time: string;
  type: string;
  tone: "green" | "blue" | "purple" | "orange" | "warn" | "info" | "neutral" | "ok";
};

export type CustomerLayerReferenceView = {
  layer: CustomerLayerKey;
  customerId: string;
  header: CkmHeaderView;
  tabs: CustomerLayerTab[];
  context: CkmContextView;
  layerTitle: string;
  preparationMessage: string | null;
  kpis: CkmKpiCard[] | null;
  /** @deprecated use tablePanel */
  table: {
    columns: string[];
    rows: CkmTableRow[];
    footnote: string | null;
  } | null;
  contacts: {
    initials: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    preferred: string;
  }[] | null;
  summaryCards: { label: string; value: string; sub?: string }[] | null;
  tablePanel: CkmTablePanel | null;
  ozetRecordTabs: CkmOzetRecordTab[] | null;
  finansAging: {
    rows: CkmFinansAgingRow[];
    total: CkmFinansAgingTotal;
    updatedLabel: string;
  } | null;
  hasAccount: boolean | null;
  finansSide: CkmFinansSide | null;
  iletisimSide: CkmIletisimSide | null;
  tekliflerSide: CkmTekliflerSide | null;
  siparislerSide: CkmSiparislerSide | null;
  tahsilatlarSide: CkmTahsilatlarSide | null;
  timelineEvents: CkmTimelineEvent[] | null;
};

const LAYER_TITLES: Record<CustomerLayerKey, string> = {
  ozet: "Cari Özet Masası",
  iletisim: "İletişim Masası",
  finans: "Finans Masası",
  teklifler: "Teklifler Masası",
  siparisler: "Siparişler Masası",
  tahsilatlar: "Tahsilatlar Masası",
  timeline: "Zaman Akışı Masası"
};


function ledgerTypeLabel(referenceType: CustomerLedgerEntry["referenceType"]): string {
  switch (referenceType) {
    case "payment":
      return "tahsilat";
    case "order":
      return "siparis";
    case "invoice":
      return "fatura";
    case "offer":
      return "teklif";
    default:
      return "hareket";
  }
}

function buildStandardLayerHeader(
  customer: Customer,
  account: CustomerAccount | null,
  contacts: CustomerContact[],
  layer: CustomerLayerKey
): CkmHeaderView {
  const currency = account?.currency ?? "TRY";
  const location = customer.district ? `${customer.district} / ${customer.city}` : customer.city;
  const primaryContact = contacts.find((contact) => contact.isPrimary) ?? contacts[0];

  return {
    breadcrumb: ["Cariler", LAYER_TITLES[layer], customer.code],
    initials: customerInitials(customer.name),
    title: customer.name,
    status: customerStatusLabel(customer),
    meta: [
      { label: "Cari Kodu", value: customer.code },
      { label: "Vergi No", value: customer.taxNumber ?? "—" },
      { label: "İl / İlçe", value: location },
      {
        label: "Bakiye",
        value: account ? formatCustomerMoney(account.balance, currency) : "—"
      }
    ],
    contact: [
      { label: "Telefon", value: customer.phone },
      { label: "E-posta", value: customer.email ?? "—" },
      { label: "Yetkili", value: primaryContact?.fullName ?? "—" }
    ]
  };
}

function buildIletisimTabStrip(customerId: string): CustomerLayerTab[] {
  return [
    { id: "ozet", label: "Genel Bilgiler", href: customerEntityHref(customerId, "ozet") },
    { id: "finans", label: "Finansal Bilgiler", href: customerEntityHref(customerId, "finans") },
    { id: "ozet", label: "İlgili Kayıtlar", href: customerEntityHref(customerId, "ozet") },
    { id: "iletisim", label: "İletişim", href: customerEntityHref(customerId, "iletisim") }
  ];
}

function mapOfferStatusTone(status: string): CkmBadgeTone {
  const normalized = status.toLowerCase();
  if (normalized.includes("kabul") || normalized.includes("onay")) return "ok";
  if (normalized.includes("red") || normalized.includes("iptal")) return "bad";
  if (normalized.includes("hazır") || normalized.includes("taslak")) return "neutral";
  if (normalized.includes("gönder")) return "info";
  return "blue";
}

function buildTablePagination(totalRecords: number, pageSize = 10): CkmTablePagination {
  const totalPages = Math.max(1, Math.ceil(Math.max(totalRecords, 1) / pageSize));
  return {
    totalRecords,
    currentPage: 1,
    pageSize,
    totalPages
  };
}

function buildContext(
  customer: Customer,
  account: CustomerAccount | null,
  ledgerEntries: CustomerLedgerEntry[],
  customerId: string
): CkmContextView {
  const currency = account?.currency ?? "TRY";
  const remaining =
    account?.creditLimit !== undefined && account.creditLimit !== null
      ? Math.max(0, account.creditLimit - account.balance)
      : null;

  return {
    title: "Cari Katman Bağlamı",
    cari: [
      { label: "Cari Kodu", value: customer.code },
      { label: "Cari Adı", value: customer.name },
      { label: "Cari Grubu", value: customerGroupLabel(customer) },
      { label: "Fiyat Grubu", value: customerPriceGroupLabel(customer) },
      { label: "Para Birimi", value: currency },
      { label: "Durum", value: customerStatusLabel(customer), badge: true }
    ],
    finans: [
      {
        label: "Risk Limiti",
        value: account?.creditLimit ? formatCustomerMoney(account.creditLimit, currency) : "—"
      },
      {
        label: "Kullanılan Limit",
        value: account ? formatCustomerMoney(account.balance, currency) : "—",
        warn: Boolean(account && account.balance > 0)
      },
      {
        label: "Kalan Limit",
        value: remaining !== null ? formatCustomerMoney(remaining, currency) : "—"
      },
      {
        label: "Açık Bakiye",
        value: account ? formatCustomerMoney(account.balance, currency) : "—",
        warn: Boolean(account && account.balance > 0)
      },
      {
        label: "Vadesi Geçmiş",
        value: account ? formatCustomerMoney(account.overdueAmount, currency) : "—",
        negative: Boolean(account && account.overdueAmount > 0)
      }
    ],
    hareketler: ledgerEntries.slice(0, 5).map((entry) => ({
      type: ledgerTypeLabel(entry.referenceType),
      title: entry.description,
      date: formatCustomerDateOnly(entry.occurredAt),
      amount: formatCustomerMoney(entry.amount, entry.currency)
    })),
    shortcuts: [
      { label: "Yeni Teklif Oluştur", href: `/teklifler/yeni?customer=${customerId}`, icon: "offer" },
      { label: "Yeni Sipariş Oluştur", href: `/siparisler/yeni?customer=${customerId}`, icon: "order" },
      { label: "Tahsilat Kaydı Ekle", href: `/tahsilatlar/yeni?customer=${customerId}`, icon: "payment" },
      { label: "Cari Kartını Görüntüle", href: customerEntityHref(customerId), icon: "card" }
    ]
  };
}

function buildOzetDeskKpis(
  account: CustomerAccount | null,
  ledgerEntries: CustomerLedgerEntry[]
): CkmKpiCard[] {
  const currency = account?.currency ?? "TRY";
  const usage = account ? creditUsageRatio(account) : null;
  const lastLedger = ledgerEntries[0];
  const invoiceCount = ledgerEntries.filter((entry) => entry.referenceType === "invoice").length;
  const lastPayment = ledgerEntries.find((entry) => entry.referenceType === "payment");

  return [
    {
      id: "balance",
      label: "Toplam Bakiye",
      value: account ? formatCustomerMoney(account.balance, currency) : "—",
      sub: account && account.overdueAmount > 0 ? `Vadesi Geçmiş: ${formatCustomerMoney(account.overdueAmount, currency)}` : account ? undefined : "Hesap özeti bekleniyor",
      tone: "orange",
      subWarn: Boolean(account && account.overdueAmount > 0)
    },
    {
      id: "risk",
      label: "Risk / Limit",
      value: account?.creditLimit ? formatCustomerMoney(account.creditLimit, currency) : "—",
      sub: usage !== null ? `${formatPercent(usage)} kullanıldı` : "Hesap özeti bekleniyor",
      tone: "green",
      progress: usage ?? undefined
    },
    {
      id: "last-move",
      label: "Son Hareket",
      value: lastLedger ? formatCustomerDate(lastLedger.occurredAt) : "—",
      sub: lastLedger ? lastLedger.description : "Henüz hareket kaydı yok",
      tone: "teal"
    },
    {
      id: "open-doc",
      label: "Açık Evrak / Fatura",
      value: account ? String(invoiceCount) : "—",
      sub: account ? "Defter kayıtlarından" : "Hesap özeti bekleniyor",
      tone: "purple"
    },
    {
      id: "collection",
      label: "Tahsilat / Aktivite",
      value: account?.lastPaymentAt ? formatCustomerDateOnly(account.lastPaymentAt) : lastPayment ? formatCustomerDateOnly(lastPayment.occurredAt) : "—",
      sub: lastPayment ? formatCustomerMoney(lastPayment.amount, lastPayment.currency) : account ? "Son tahsilat kaydı yok" : "Hesap özeti bekleniyor",
      tone: "blue"
    }
  ];
}

function buildLedgerTable(ledgerEntries: CustomerLedgerEntry[]): CustomerLayerReferenceView["table"] {
  if (ledgerEntries.length === 0) return null;
  return {
    columns: ["Tarih", "Açıklama", "Tutar", "Referans"],
    rows: ledgerEntries.slice(0, 8).map((entry) => ({
      Tarih: formatCustomerDate(entry.occurredAt),
      Açıklama: entry.description,
      Tutar: formatCustomerMoney(entry.amount, entry.currency),
      Referans: entry.referenceType
    })),
    footnote: `${ledgerEntries.length} hareket kaydı`
  };
}

function buildOffersTable(offers: Offer[]): CustomerLayerReferenceView["table"] {
  if (offers.length === 0) return null;
  return {
    columns: ["Teklif No", "Durum", "Toplam", "Geçerlilik"],
    rows: offers.map((offer) => ({
      "Teklif No": offer.offerNo,
      Durum: offer.status,
      Toplam: formatCustomerMoney(offer.grandTotal, offer.currency),
      Geçerlilik: formatCustomerDateOnly(offer.validUntil)
    })),
    footnote: `${offers.length} teklif kaydı`
  };
}

function buildIletisimContacts(contacts: CustomerContact[], customer: Customer): CustomerLayerReferenceView["contacts"] {
  const preferredChannel = customer.whatsappMatched ? "WhatsApp" : "Telefon";
  if (contacts.length > 0) {
    return contacts.map((contact) => ({
      initials: customerInitials(contact.fullName),
      name: contact.fullName,
      role: contact.title ?? "—",
      phone: contact.phone,
      email: contact.email ?? "—",
      preferred: contact.isPrimary ? preferredChannel : "E-posta"
    }));
  }

  return [
    {
      initials: customerInitials(customer.name),
      name: customer.name,
      role: "Ana kayıt",
      phone: customer.phone,
      email: customer.email ?? "—",
      preferred: preferredChannel
    }
  ];
}

function buildIletisimSummary(customer: Customer, contacts: CustomerContact[], addresses: CustomerAddress[]) {
  return [
    { label: "Telefon", value: customer.phone, sub: contacts.length > 0 ? `${contacts.length} kişi` : undefined },
    { label: "E-posta", value: customer.email ?? "—", sub: customer.email ? "Ana kayıt" : undefined },
    {
      label: "Adres",
      value: customer.addressLine || "—",
      sub: addresses.length > 0 ? `${addresses.length} adres` : undefined
    }
  ];
}

function buildOzetRecordTabs(
  ledgerEntries: CustomerLedgerEntry[],
  offers: Offer[],
  account: CustomerAccount | null
): CkmOzetRecordTab[] {
  const invoiceLike = ledgerEntries.filter((e) => e.referenceType === "invoice").length;
  return [
    { id: "faturalar", label: "Açık Faturalar", count: invoiceLike, active: true },
    { id: "teklifler", label: "Teklifler", count: offers.length },
    { id: "siparisler", label: "Açık Siparişler", count: account?.openOrderCount ?? 0 },
    { id: "tahsilatlar", label: "Tahsilatlar", count: ledgerEntries.filter((e) => e.referenceType === "payment").length },
    { id: "iletisim", label: "İletişim Kayıtları", count: 0 }
  ];
}

function buildOzetTablePanel(customerId: string, ledgerEntries: CustomerLedgerEntry[]): CkmTablePanel {
  const invoiceRows = ledgerEntries.filter((e) => e.referenceType === "invoice");
  return {
    title: "İlgili Kayıtlar",
    columns: ["Belge No", "Belge Tarihi", "Vade Tarihi", "Açıklama", "Tutar", "Açık Bakiye", "Durum"],
    rows:
      invoiceRows.length > 0
        ? invoiceRows.slice(0, 5).map((entry) => ({
            "Belge No": entry.referenceId ?? entry.id.slice(0, 8).toUpperCase(),
            "Belge Tarihi": formatCustomerDateOnly(entry.occurredAt),
            "Vade Tarihi": "—",
            Açıklama: entry.description,
            Tutar: formatCustomerMoney(entry.amount, entry.currency),
            "Açık Bakiye": formatCustomerMoney(entry.amount, entry.currency),
            Durum: "Açık"
          }))
        : [],
    emptyMessage: "Açık fatura kaydı bulunmuyor",
    emptyDetail: "Hesap hareketleri bağlandığında fatura satırları burada listelenir.",
    footnote: invoiceRows.length > 0 ? `Toplam ${invoiceRows.length} kayıt` : "Toplam 0 kayıt",
    viewAllHref: `/cariler/${customerId}/finans`,
    viewAllLabel: "Tümünü Gör"
  };
}

function buildFinansAgingPanel(account: CustomerAccount | null, ledgerEntries: CustomerLedgerEntry[]): CkmTablePanel {
  const currency = account?.currency ?? "TRY";
  const rows =
    account && account.balance > 0
      ? [
          {
            "Yaş Aralığı": "Güncel bakiye",
            "Tutar ₺": formatCustomerMoney(account.balance, currency),
            "%": "100%",
            "Fatura Adedi": String(Math.max(ledgerEntries.length, 1)),
            "Ort. Gün": "—",
            Açıklama: account.overdueAmount > 0 ? "Vadesi geçmiş tutar var" : "İzlenmesi gereken bakiye"
          }
        ]
      : [];
  return {
    title: "Açık Bakiye Yaşlandırma",
    columns: ["Yaş Aralığı", "Tutar ₺", "%", "Fatura Adedi", "Ort. Gün", "Açıklama"],
    rows,
    emptyMessage: "Yaşlandırma verisi henüz bağlı değil",
    emptyDetail: "Finans katmanı API bağlandığında vade aralıkları burada gösterilir.",
    footnote: account ? `Son güncelleme: ${formatCustomerDateOnly(new Date().toISOString())}` : "Hesap özeti bekleniyor"
  };
}

function buildFinansSide(customerId: string, account: CustomerAccount | null): CkmFinansSide {
  const currency = account?.currency ?? "TRY";
  return {
    title: "Finans Bağlamı",
    suggestionAmount: account && account.overdueAmount > 0 ? formatCustomerMoney(account.overdueAmount, currency) : null,
    suggestionStrategy: "Telefon + E-posta + Ziyaret",
    suggestionPlan: account?.creditLimit
      ? `${formatCustomerMoney(Math.min(account.balance, account.creditLimit * 0.4), currency)} — taksit önerisi hazırlanıyor`
      : "Tahsilat planı hesap özeti bağlandığında önerilir",
    miniKpis: [
      { label: "Açık Bakiye", value: account ? formatCustomerMoney(account.balance, currency) : "—" },
      { label: "Vadesi Geçmiş", value: account ? formatCustomerMoney(account.overdueAmount, currency) : "—" },
      { label: "Açık Teklif", value: account ? String(account.openOfferCount) : "—" },
      { label: "Açık Sipariş", value: account ? String(account.openOrderCount) : "—" }
    ],
    ctaHref: `/tahsilatlar/yeni?customer=${customerId}`,
    updatedLabel: formatCustomerDate(new Date().toISOString())
  };
}

function buildOffersTablePanel(offers: Offer[], customerId: string): CkmTablePanel {
  const columns = ["Teklif No", "Tarih", "Tutar", "Durum", "Geçerlilik", "Yetkili", "Aksiyon"];
  const rows = offers.map((offer) => ({
    "Teklif No": offer.offerNo,
    Tarih: formatCustomerDateOnly(offer.createdAt),
    Tutar: formatCustomerMoney(offer.grandTotal, offer.currency),
    Durum: offer.status,
    Geçerlilik: formatCustomerDateOnly(offer.validUntil),
    Yetkili: "—",
    Aksiyon: ""
  }));
  return {
    title: "Teklifler",
    countLabel: String(offers.length),
    columns,
    rows,
    rowMeta: offers.map((offer) => ({
      badges: { Durum: mapOfferStatusTone(offer.status) },
      linkColumns: ["Teklif No"]
    })),
    showActions: true,
    actionVariant: "document",
    pagination: buildTablePagination(offers.length),
    emptyMessage: "Bu cariye bağlı teklif kaydı bulunmuyor",
    emptyDetail: "Yeni teklif oluşturduğunuzda kayıtlar burada listelenir.",
    footnote: offers.length > 0 ? `Toplam ${offers.length} kayıt` : "Toplam 0 kayıt",
    createHref: `/teklifler/yeni?customer=${customerId}`,
    createLabel: "+ Yeni Teklif"
  };
}

function buildTekliflerSide(offers: Offer[]): CkmTekliflerSide {
  const statusMap = new Map<string, number>();
  for (const offer of offers) {
    statusMap.set(offer.status, (statusMap.get(offer.status) ?? 0) + 1);
  }
  const statuses = Array.from(statusMap.entries()).map(([label, count]) => ({ label, count }));
  return {
    title: "Teklif Bağlamı",
    statuses: statuses.length > 0 ? statuses : [{ label: "Kayıt yok", count: 0 }],
    total: offers.length,
    dateRangeLabel: "Son 90 gün",
    assigneePlaceholder: "Yetkili seçin",
    creatorPlaceholder: "Oluşturan seçin"
  };
}

function buildSiparislerTablePanel(customerId: string): CkmTablePanel {
  const columns = ["Sipariş No", "Tarih", "Tutar", "Durum", "Teslimat", "Sorumlu", "Aksiyon"];
  return {
    title: "Siparişler",
    columns,
    rows: [],
    showActions: true,
    actionVariant: "document",
    pagination: buildTablePagination(0),
    emptyMessage: "Sipariş listesi hazırlanıyor",
    emptyDetail: "Bu cariye bağlı sipariş listesi katman API'sine bağlandığında burada görünür.",
    footnote: "Toplam 0 kayıt",
    createHref: `/siparisler/yeni?customer=${customerId}`,
    createLabel: "+ Yeni Sipariş"
  };
}

function buildSiparislerSide(customerId: string): CkmSiparislerSide {
  return {
    title: "Sipariş Bağlamı",
    orderNo: null,
    status: null,
    statusTone: null,
    fields: [
      { label: "Sipariş Tarihi", value: "—" },
      { label: "Teslim Tarihi", value: "—" },
      { label: "Tutar", value: "—" },
      { label: "Para Birimi", value: "—" },
      { label: "Oluşturan", value: "—" },
      { label: "Onaylayan", value: "—" }
    ],
    delivery: [
      { label: "Teslimat Adresi", value: "—" },
      { label: "Teslim Alan", value: "—" },
      { label: "Kargo Firması", value: "—" },
      { label: "Kargo Takip No", value: "—" }
    ],
    detailHref: null,
    emptyMessage: "Seçili sipariş kaydı yok; sipariş katmanı API'si bağlandığında detay burada görünür."
  };
}

function buildTahsilatlarTablePanel(customerId: string, ledgerEntries: CustomerLedgerEntry[]): CkmTablePanel {
  const payments = ledgerEntries.filter((e) => e.referenceType === "payment");
  const columns = ["Tahsilat No", "Tarih", "Tutar", "Yöntem", "Durum", "Sorumlu", "Aksiyon"];
  const rows = payments.map((entry) => ({
    "Tahsilat No": entry.referenceId ?? entry.id.slice(0, 8).toUpperCase(),
    Tarih: formatCustomerDateOnly(entry.occurredAt),
    Tutar: formatCustomerMoney(entry.amount, entry.currency),
    Yöntem: "—",
    Durum: "Tamamlandı",
    Sorumlu: "—",
    Aksiyon: ""
  }));
  return {
    title: "Tahsilatlar",
    countLabel: String(payments.length),
    columns,
    rows,
    rowMeta: payments.map(() => ({
      badges: { Durum: "ok" as CkmBadgeTone },
      linkColumns: ["Tahsilat No"],
      paymentMethod: "unknown" as const
    })),
    showActions: true,
    actionVariant: "payment",
    pagination: buildTablePagination(payments.length),
    emptyMessage: "Tahsilat kaydı bulunmuyor",
    emptyDetail: "Cari tahsilat katmanı API'sine bağlandığında kayıtlar burada listelenir.",
    footnote:
      payments.length > 0
        ? `1 – ${payments.length} / ${payments.length} kayıt`
        : "0 kayıt",
    createHref: `/tahsilatlar/yeni?customer=${customerId}`,
    createLabel: "+ Yeni Tahsilat"
  };
}

function buildTahsilatlarSide(
  customerId: string,
  account: CustomerAccount | null,
  ledgerEntries: CustomerLedgerEntry[]
): CkmTahsilatlarSide {
  const currency = account?.currency ?? "TRY";
  const payments = ledgerEntries.filter((e) => e.referenceType === "payment");
  const totalCollected =
    payments.length > 0
      ? formatCustomerMoney(
          payments.reduce((sum, entry) => sum + entry.amount, 0),
          currency
        )
      : "—";

  return {
    title: "Tahsilat Bağlamı",
    summary: [
      { label: "Toplam Tahsilat", value: totalCollected, tone: "ok" },
      { label: "Bekleyen Tahsilat", value: "—", tone: "warn" },
      { label: "İptal Edilen Tahsilat", value: "—", tone: "bad" }
    ],
    dates: [
      { label: "Son Tahsilat", value: formatCustomerDateOnly(account?.lastPaymentAt) },
      { label: "Sonraki Tahsilat Beklentisi", value: "—" },
      { label: "Ortalama Tahsilat Süresi", value: "—" }
    ],
    actions: [
      { label: "Tahsilat Ekle", primary: true, href: `/tahsilatlar/yeni?customer=${customerId}` },
      { label: "Ödeme Planı Oluştur" },
      { label: "Hatırlatma Gönder" },
      { label: "Tahsilat Raporu" }
    ]
  };
}

function buildIletisimSide(customer: Customer, customerId: string): CkmIletisimSide {
  return {
    title: "İletişim Bağlamı",
    whatsappPhone: customer.phone,
    status: customer.whatsappMatched ? "Bağlı" : "Bağlı değil",
    lastMessage: customer.whatsappMatched ? "WhatsApp eşleşmesi aktif" : "Son mesaj kaydı henüz bağlı değil",
    preferred: customer.whatsappMatched ? "WhatsApp" : "Telefon",
    quickActions: [
      { id: "message", label: "Mesaj Gönder" },
      { id: "file", label: "Dosya Gönder" },
      { id: "location", label: "Konum Gönder" },
      { id: "note", label: "Hızlı Not Gönder" },
      { id: "template", label: "Şablon Gönder" }
    ],
    whatsappHref: customer.whatsappMatched ? `/whatsapp?customer=${customerId}` : null
  };
}

function buildTimelineEvents(ledgerEntries: CustomerLedgerEntry[], offers: Offer[]): CkmTimelineEvent[] {
  const fromLedger = ledgerEntries.slice(0, 4).map((entry, index) => ({
    id: `ledger-${entry.id}`,
    group: index === 0 ? "Bugün" : "Son hareketler",
    title: entry.description,
    desc: `${entry.referenceType} hareketi`,
    user: "Sistem",
    time: formatCustomerDate(entry.occurredAt),
    type: entry.referenceType === "payment" ? "Ödeme" : entry.referenceType === "offer" ? "Teklif" : "Hareket",
    tone: "info" as const
  }));
  const fromOffers = offers.slice(0, 2).map((offer) => ({
    id: `offer-${offer.id}`,
    group: "Teklifler",
    title: `Teklif ${offer.offerNo}`,
    desc: `${offer.status} · ${formatCustomerMoney(offer.grandTotal, offer.currency)}`,
    user: "CRM",
    time: formatCustomerDateOnly(offer.validUntil),
    type: "Teklif",
    tone: "green" as const
  }));
  return [...fromLedger, ...fromOffers];
}

function emptyLayerFields() {
  return {
    tablePanel: null as CkmTablePanel | null,
    ozetRecordTabs: null as CkmOzetRecordTab[] | null,
    finansAging: null as CustomerLayerReferenceView["finansAging"],
    hasAccount: null as boolean | null,
    finansSide: null as CkmFinansSide | null,
    iletisimSide: null as CkmIletisimSide | null,
    tekliflerSide: null as CkmTekliflerSide | null,
    siparislerSide: null as CkmSiparislerSide | null,
    tahsilatlarSide: null as CkmTahsilatlarSide | null,
    timelineEvents: null as CkmTimelineEvent[] | null
  };
}

function buildFinansKpis(account: CustomerAccount | null): CkmKpiCard[] | null {
  if (!account) return null;
  const currency = account.currency;
  const usage = creditUsageRatio(account);
  return [
    { id: "open", label: "Açık Bakiye", value: formatCustomerMoney(account.balance, currency), tone: "green" },
    {
      id: "overdue",
      label: "Vadesi Geçmiş",
      value: formatCustomerMoney(account.overdueAmount, currency),
      tone: account.overdueAmount > 0 ? "bad" : "orange"
    },
    {
      id: "limit",
      label: "Kredi Limiti",
      value: account.creditLimit ? formatCustomerMoney(account.creditLimit, currency) : "—",
      tone: "blue"
    },
    {
      id: "used",
      label: "Kullanılan Limit",
      value: usage !== null ? formatPercent(usage) : "—",
      tone: "teal",
      progress: usage ?? undefined
    },
    { id: "offers", label: "Açık Teklif", value: String(account.openOfferCount), tone: "purple" },
    { id: "orders", label: "Açık Sipariş", value: String(account.openOrderCount), tone: "orange" }
  ];
}

export function mapCustomerToLayerReference(input: {
  customerId: string;
  layer: CustomerLayerKey;
  data: CustomerDetailQueryResult;
  offers: Offer[];
}): CustomerLayerReferenceView | null {
  const customer = input.data.customer;
  if (!customer) return null;

  const { account, contacts, addresses, ledgerEntries } = input.data;
  const base = {
    layer: input.layer,
    customerId: input.customerId,
    header: buildStandardLayerHeader(customer, account, contacts, input.layer),
    tabs: buildCustomerDetailTabs(input.customerId),
    context: buildContext(customer, account, ledgerEntries, input.customerId),
    layerTitle: LAYER_TITLES[input.layer]
  };

  switch (input.layer) {
    case "ozet": {
      const extras = emptyLayerFields();
      return {
        ...base,
        ...extras,
        preparationMessage: account ? null : "Hesap özeti bağlandığında KPI alanları tamamlanacak.",
        kpis: buildOzetDeskKpis(account, ledgerEntries),
        table: buildLedgerTable(ledgerEntries),
        contacts: null,
        summaryCards: null,
        ozetRecordTabs: buildOzetRecordTabs(ledgerEntries, input.offers, account),
        tablePanel: buildOzetTablePanel(input.customerId, ledgerEntries)
      };
    }
    case "finans": {
      const extras = emptyLayerFields();
      const aging = buildFinanceAgingRows(account, ledgerEntries);
      return {
        ...base,
        ...extras,
        preparationMessage: account ? null : "Hesap özeti henüz bağlı değil; KPI ve yaşlandırma iskeleti gösteriliyor.",
        kpis: buildFinanceDeskKpis(customer, account, ledgerEntries),
        table: buildLedgerTable(ledgerEntries),
        contacts: null,
        summaryCards: null,
        tablePanel: null,
        finansAging: {
          rows: aging.rows,
          total: aging.total,
          updatedLabel: account
            ? `Son güncelleme: ${formatCustomerDate(new Date().toISOString())}`
            : "Hesap özeti bekleniyor"
        },
        hasAccount: account !== null,
        finansSide: buildFinanceDeskSide(input.customerId, customer, account)
      };
    }
    case "iletisim": {
      const extras = emptyLayerFields();
      return {
        ...base,
        ...extras,
        tabs: buildIletisimTabStrip(input.customerId),
        preparationMessage: null,
        kpis: null,
        table: null,
        contacts: buildIletisimContacts(contacts, customer),
        summaryCards: buildIletisimSummary(customer, contacts, addresses),
        iletisimSide: buildIletisimSide(customer, input.customerId)
      };
    }
    case "teklifler": {
      const extras = emptyLayerFields();
      return {
        ...base,
        ...extras,
        preparationMessage: null,
        kpis: null,
        table: buildOffersTable(input.offers),
        contacts: null,
        summaryCards: null,
        tablePanel: buildOffersTablePanel(input.offers, input.customerId),
        tekliflerSide: buildTekliflerSide(input.offers)
      };
    }
    case "siparisler": {
      const extras = emptyLayerFields();
      return {
        ...base,
        ...extras,
        preparationMessage: "Sipariş katmanı API'si bağlandığında tablo satırları doldurulacak.",
        kpis: null,
        table: null,
        contacts: null,
        summaryCards: null,
        tablePanel: buildSiparislerTablePanel(input.customerId),
        siparislerSide: buildSiparislerSide(input.customerId)
      };
    }
    case "tahsilatlar": {
      const extras = emptyLayerFields();
      return {
        ...base,
        ...extras,
        preparationMessage: null,
        kpis: null,
        table: null,
        contacts: null,
        summaryCards: null,
        tablePanel: buildTahsilatlarTablePanel(input.customerId, ledgerEntries),
        tahsilatlarSide: buildTahsilatlarSide(input.customerId, account, ledgerEntries)
      };
    }
    case "timeline": {
      const extras = emptyLayerFields();
      const events = buildTimelineEvents(ledgerEntries, input.offers);
      return {
        ...base,
        ...extras,
        preparationMessage: null,
        kpis: null,
        table: null,
        contacts: null,
        summaryCards: null,
        timelineEvents: events
      };
    }
    default:
      return null;
  }
}

const FINANCE_AGING_BUCKETS: { range: string; tone: CkmFinansAgingRow["tone"] }[] = [
  { range: "0-30 Gün", tone: "ok" },
  { range: "31-60 Gün", tone: "warn" },
  { range: "61-90 Gün", tone: "orange" },
  { range: "90+ Gün", tone: "bad" }
];

function buildFinanceTabs(customerId: string): CkmFinanceTab[] {
  return [
    { id: "ozet", label: "ÖZET", href: `/cariler/${customerId}/ozet` },
    { id: "iletisim", label: "İLETİŞİM", href: `/cariler/${customerId}/iletisim` },
    { id: "ticari", label: "TİCARİ", href: `/cariler/${customerId}/teklifler` },
    { id: "finans", label: "FİNANS", href: `/cariler/${customerId}/finans` },
    { id: "risk", label: "RİSK", disabled: true, disabledReason: "Risk katmanı hazırlanıyor" },
    { id: "hareketler", label: "HAREKETLER", href: `/cariler/${customerId}/timeline` },
    { id: "belgeler", label: "BELGELER", href: `/belgeler/arsiv?customer=${customerId}` },
    { id: "notlar", label: "NOTLAR", disabled: true, disabledReason: "Notlar katmanı hazırlanıyor" }
  ];
}

function buildFinanceHeader(
  customer: Customer,
  account: CustomerAccount | null,
  contacts: CustomerContact[]
): CkmHeaderView {
  const currency = account?.currency ?? "TRY";
  const risk = account
    ? calculateCustomerRiskState(customer, account)
    : customerRiskLabelFromProfile(customer);
  const primaryContact = contacts.find((c) => c.isPrimary) ?? contacts[0];
  const contactLabel = primaryContact
    ? `${primaryContact.fullName}${primaryContact.title ? ` (${primaryContact.title})` : ""}`
    : "—";

  return {
    breadcrumb: ["Cariler", "Katman: Finans", customer.code],
    initials: customerInitials(customer.name),
    title: customer.name,
    status: customerStatusLabel(customer),
    meta: [
      { label: "ID", value: customer.code },
      { label: "Müşteri", value: `${formatCustomerDateOnly(customer.createdAt)}'den beri müşteri` },
      { label: "Konum", value: customer.district ? `${customer.district}, ${customer.city}` : customer.city },
      { label: account ? "Bakiye" : "Web", value: account ? formatCustomerMoney(account.balance, currency) : customer.email ?? "—" }
    ],
    contact: [
      { label: "Cari Yetkilisi", value: contactLabel },
      { label: "Segment", value: `${customerGroupLabel(customer)} — ${risk.label} Risk` }
    ]
  };
}

function buildFinanceDeskKpis(
  customer: Customer,
  account: CustomerAccount | null,
  ledgerEntries: CustomerLedgerEntry[]
): CkmKpiCard[] {
  const currency = account?.currency ?? "TRY";
  const risk = account
    ? calculateCustomerRiskState(customer, account)
    : customerRiskLabelFromProfile(customer);
  const invoiceCount = ledgerEntries.filter((entry) => entry.referenceType === "invoice").length;

  return [
    {
      id: "total-balance",
      label: "Toplam Bakiye",
      value: account ? formatCustomerMoney(account.balance, currency) : "—",
      sub: account ? undefined : "Hesap özeti bekleniyor",
      tone: "green"
    },
    {
      id: "overdue",
      label: "Vadesi Geçen",
      value: account ? formatCustomerMoney(account.overdueAmount, currency) : "—",
      sub: account && account.overdueAmount > 0 ? "Tahsilat önceliği" : account ? undefined : "Hesap özeti bekleniyor",
      tone: account && account.overdueAmount > 0 ? "bad" : "orange"
    },
    {
      id: "risk-score",
      label: "Risk Skoru",
      value: risk.label,
      sub: account ? risk.description : "Finans özeti bağlandığında hesaplanır",
      tone: "purple"
    },
    {
      id: "collection-rate",
      label: "Tahsilat Oranı",
      value: "—",
      sub: "Hazırlanıyor",
      tone: "teal"
    },
    {
      id: "avg-term",
      label: "Ortalama Vade",
      value: "—",
      sub: "Hazırlanıyor",
      tone: "blue"
    },
    {
      id: "open-invoice",
      label: "Açık Fatura",
      value: account ? (invoiceCount > 0 ? String(invoiceCount) : "0") : "—",
      sub: account ? "Defter hareketlerinden" : "Hesap özeti bekleniyor",
      tone: "orange"
    }
  ];
}

function buildFinanceAgingRows(
  account: CustomerAccount | null,
  ledgerEntries: CustomerLedgerEntry[]
): { rows: CkmFinansAgingRow[]; total: CkmFinansAgingTotal } {
  const invoiceCount = ledgerEntries.filter((entry) => entry.referenceType === "invoice").length;
  const preparingDesc = "Yaşlandırma hazırlanıyor";

  const rows: CkmFinansAgingRow[] = FINANCE_AGING_BUCKETS.map((bucket) => ({
    range: bucket.range,
    amount: "—",
    pct: "—",
    count: "—",
    avgDays: "—",
    desc: preparingDesc,
    tone: bucket.tone,
    preparing: true
  }));

  const total: CkmFinansAgingTotal = {
    amount: account ? formatCustomerMoney(account.balance, account.currency) : "—",
    pct: account && account.balance > 0 ? "—" : "—",
    count: invoiceCount > 0 ? String(invoiceCount) : "—",
    avgDays: "—"
  };

  return { rows, total };
}

function buildFinanceDeskSide(
  customerId: string,
  customer: Customer,
  account: CustomerAccount | null
): CkmFinansSide {
  const currency = account?.currency ?? "TRY";
  const hasOverdue = Boolean(account && account.overdueAmount > 0);

  return {
    title: "Finans Bağlamı",
    suggestionAmount: hasOverdue ? formatCustomerMoney(account!.overdueAmount, currency) : "—",
    suggestionStrategy: hasOverdue ? "Telefon + E-posta + Ziyaret" : "Tahsilat stratejisi hesap özeti bağlandığında önerilir",
    suggestionPlan: hasOverdue
      ? "Ödeme planı önerisi hazırlanıyor"
      : account
        ? "Vadesi geçmiş tutar yok; plan önerisi gerekmiyor"
        : "Hesap özeti bekleniyor",
    miniKpis: [
      { label: "Toplam Bakiye", value: account ? formatCustomerMoney(account.balance, currency) : "—" },
      { label: "Vadesi Geçen", value: account ? formatCustomerMoney(account.overdueAmount, currency) : "—" },
      { label: "Ortalama Vade (Gün)", value: "—" },
      { label: "Tahsilat Performansı", value: "—" }
    ],
    ctaHref: `/tahsilatlar/yeni?customer=${customerId}`,
    updatedLabel: account
      ? formatCustomerDate(new Date().toISOString())
      : formatCustomerDate(customer.updatedAt)
  };
}

export function mapCustomerToFinanceReference(input: {
  customerId: string;
  data: CustomerDetailQueryResult;
}): CustomerFinanceReferenceView | null {
  const customer = input.data.customer;
  if (!customer) return null;

  const { account, contacts, ledgerEntries } = input.data;
  const aging = buildFinanceAgingRows(account, ledgerEntries);

  return {
    customerId: input.customerId,
    header: buildFinanceHeader(customer, account, contacts),
    financeTabs: buildFinanceTabs(input.customerId),
    kpis: buildFinanceDeskKpis(customer, account, ledgerEntries),
    agingRows: aging.rows,
    agingTotal: aging.total,
    agingUpdatedLabel: account
      ? `Son güncelleme: ${formatCustomerDate(new Date().toISOString())}`
      : "Hesap özeti bekleniyor",
    finansSide: buildFinanceDeskSide(input.customerId, customer, account),
    hasAccount: account !== null
  };
}
