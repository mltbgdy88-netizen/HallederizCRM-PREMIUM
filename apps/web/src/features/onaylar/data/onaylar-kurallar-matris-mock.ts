// @ts-nocheck
export type OkmRuleRole =
  | "Satış Yetkilisi"
  | "Satış Müdürü"
  | "Genel Müdür"
  | "Finans Müdürü"
  | "Yönetici";

export type OkmRuleRow = {
  id: string;
  transactionType: string;
  limit: string;
  role: OkmRuleRole;
  requiredApproval: string;
  active: boolean;
};

export type OkmRuleDetail = {
  name: string;
  transactionType: string;
  description: string;
  priority: string;
  created: string;
  updated: string;
  currency: string;
  limitType: string;
  min: string;
  max: string;
  approvalCount: string;
  approvalOrder: string;
  approverRole: OkmRuleRole;
  conditions: string[];
};

export const OKR_TITLE = "Onay Kuralları ve Limitler";
export const OKR_SUBTITLE = "Sistem genelinde işlem onay kurallarını ve limitlerini yönetin.";

export const OKR_KPIS = [
  { label: "Toplam Kural", value: "24" },
  { label: "Aktif Kural", value: "18" },
  { label: "Pasif Kural", value: "4" },
  { label: "Rol Tanımlı", value: "7" }
];

export const OKR_LAST_UPDATE = "22.05.2025 14:35";

export const OKR_FILTER_SEARCH = "Kural ara...";

export const OKR_FILTERS = [
  { id: "role", label: "Rol", options: [{ label: "Tümü", value: "all" }] },
  { id: "type", label: "İşlem Tipi", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] },
  { id: "currency", label: "Para Birimi", options: [{ label: "TRY", value: "try" }] }
];

export const OKR_TABLE_ROWS: OkmRuleRow[] = [
  {
    id: "1",
    transactionType: "İndirim Onayı",
    limit: "%15'e kadar",
    role: "Satış Yetkilisi",
    requiredApproval: "1 Onay",
    active: true
  },
  {
    id: "2",
    transactionType: "İndirim Onayı",
    limit: "%15 - %25 arası",
    role: "Satış Müdürü",
    requiredApproval: "1 Onay",
    active: true
  },
  {
    id: "3",
    transactionType: "İndirim Onayı",
    limit: "%25 üzeri",
    role: "Genel Müdür",
    requiredApproval: "2 Onay",
    active: true
  },
  {
    id: "4",
    transactionType: "Teklif Onayı",
    limit: "₺50.000'e kadar",
    role: "Satış Yetkilisi",
    requiredApproval: "1 Onay",
    active: true
  },
  {
    id: "5",
    transactionType: "Teklif Onayı",
    limit: "₺250.000 üzeri",
    role: "Genel Müdür",
    requiredApproval: "2 Onay",
    active: true
  },
  {
    id: "6",
    transactionType: "Sipariş Onayı",
    limit: "₺100.000 - ₺500.000",
    role: "Satış Müdürü",
    requiredApproval: "1 Onay",
    active: true
  },
  {
    id: "7",
    transactionType: "Fiyat Değişikliği",
    limit: "₺10.000 üzeri",
    role: "Finans Müdürü",
    requiredApproval: "1 Onay",
    active: false
  }
];

export const OKR_TABLE_TOTAL = "Toplam 24 kural";
export const OKR_PAGE_NUMBERS = ["1", "2", "3"];

export function getOkrDetail(selectedId: string): OkmRuleDetail {
  const row = OKR_TABLE_ROWS.find((r) => r.id === selectedId) ?? OKR_TABLE_ROWS[0];
  return {
    name: `${row.transactionType} — ${row.limit}`,
    transactionType: row.transactionType,
    description: "Satış işlemlerinde geçerli indirim onay kuralı. Limit aşımında otomatik onay akışı başlatılır.",
    priority: "1",
    created: "15.01.2025 — Ali Yılmaz",
    updated: "22.05.2025 14:35 — Yusuf Kaya",
    currency: "TRY",
    limitType: "Yüzde",
    min: "0%",
    max: "15%",
    approvalCount: "1",
    approvalOrder: "Sıralı",
    approverRole: row.role,
    conditions: [
      "Tüm satış işlemleri için geçerlidir",
      "Müşteri risk skoru yüksek ise ek onay gerekir",
      "Kampanya dönemlerinde geçici olarak devre dışı bırakılabilir"
    ]
  };
}

export function okrRoleClass(role: OkmRuleRole): string {
  if (role === "Genel Müdür" || role === "Yönetici") return " okr-badge--gold";
  if (role === "Finans Müdürü") return " okr-badge--teal";
  return " okr-badge--green";
}

