import { calculateCustomerRiskState, resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { computeKpiMetricsFromCustomerRows } from "../data/customers-demo-rows";
import type { CustomerRow } from "../mappers/map-customer-row";
import type { CustomersQueryResult } from "../queries/get-customers";

export type ComReferenceRisk = "Düşük" | "Orta" | "Yüksek";
export type ComKpiTone = "green" | "teal" | "gold" | "orange" | "red";
export type ComKpiIcon = "users" | "check" | "wallet" | "alert" | "spark";

export type ComReferenceKpi = {
  id: string;
  label: string;
  value: string;
  tone: ComKpiTone;
  icon: ComKpiIcon;
};

export type ComReferenceTableRow = {
  id: string;
  code: string;
  customer: string;
  city: string;
  balance: string;
  risk: ComReferenceRisk;
  riskTone: "low" | "mid" | "high";
};

export type ComQuickAction = {
  id: string;
  label: string;
};

export type ComReferenceContext = {
  rowId: string;
  code: string;
  name: string;
  status: "Aktif" | "Pasif" | "Önizleme";
  taxNo: string;
  taxOffice: string;
  city: string;
  group: string;
  accountType: string;
  openedAt: string;
  creditLimit: string;
  remainingLimit: string;
  financeWarningTitle: string;
  financeWarningDetail: string;
  quickActions: ComQuickAction[];
};

export const COM_QUICK_ACTIONS: ComQuickAction[] = [
  { id: "collection", label: "Tahsilat Oluştur" },
  { id: "payment", label: "Ödeme Kaydı Oluştur" },
  { id: "statement", label: "Ekstre Göster" },
  { id: "open-items", label: "Açık Kalemler" },
  { id: "detail", label: "Cari Detay" }
];

function formatMoney(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function riskFromRow(row: CustomerRow): { risk: ComReferenceRisk; tone: ComReferenceTableRow["riskTone"] } {
  if (row.riskTone === "danger") return { risk: "Yüksek", tone: "high" };
  if (row.riskTone === "warning") return { risk: "Orta", tone: "mid" };
  return { risk: "Düşük", tone: "low" };
}

export function mapCustomerRowToTableRow(row: CustomerRow): ComReferenceTableRow {
  const { risk, tone } = riskFromRow(row);
  return {
    id: row.customerId,
    code: row.code,
    customer: row.name,
    city: row.city,
    balance: row.balanceLabel,
    risk,
    riskTone: tone
  };
}

function formatDateTr(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("tr-TR");
}

function buildFinanceWarning(
  customer: Customer | null,
  account: CustomerAccount | null,
  previewRow: CustomerRow | null
): { title: string; detail: string } {
  if (previewRow) {
    if (previewRow.riskTone === "danger") {
      return {
        title: "Finansal Uyarı",
        detail: "Riskli bakiye tespit edildi. Limit takibi önerilir (önizleme)."
      };
    }
    if (previewRow.riskTone === "warning") {
      return {
        title: "Finansal Uyarı",
        detail: "Orta risk; bakiye kontrolü faydalıdır (önizleme)."
      };
    }
    return {
      title: "Finansal Uyarı",
      detail: "Bakiye limitin altında. Ek risk bildirimi yok (önizleme)."
    };
  }

  if (!customer) {
    return { title: "Finansal Uyarı", detail: "Cari seçildiğinde finans özeti görünür." };
  }

  if (!account) {
    const parts = ["Finans özeti henüz bağlı değil."];
    if (customer.riskLevel === "high" || customer.riskLevel === "blocked") {
      parts.push("Yüksek risk; ek onay gerekebilir.");
    }
    return { title: "Finansal Uyarı", detail: parts.join(" ") };
  }

  const risk = calculateCustomerRiskState(customer, account);
  if (account.overdueAmount > 0) {
    return {
      title: "Finansal Uyarı",
      detail: `Vadesi geçmiş tutar: ${formatMoney(account.overdueAmount, account.currency)}`
    };
  }
  if (account.creditLimit != null && account.balance > account.creditLimit) {
    return {
      title: "Finansal Uyarı",
      detail: `Limit aşımı riski. Açık bakiye: ${formatMoney(account.balance, account.currency)}`
    };
  }
  if (risk.level === "high" || risk.level === "blocked") {
    return {
      title: "Finansal Uyarı",
      detail: "Riskli bakiye tespit edildi. Tahsilat planı değerlendirin."
    };
  }
  return {
    title: "Finansal Uyarı",
    detail: "Bakiye limitin altında. Ek risk bildirimi yok."
  };
}

export function mapCustomerToContextPanel(
  customer: Customer | null,
  account: CustomerAccount | null,
  previewRow: CustomerRow | null
): ComReferenceContext | null {
  if (previewRow) {
    const warning = buildFinanceWarning(null, null, previewRow);
    return {
      rowId: previewRow.customerId,
      code: previewRow.code,
      name: previewRow.name,
      status: "Önizleme",
      taxNo: "—",
      taxOffice: "—",
      city: previewRow.city,
      group: previewRow.priceGroupLabel,
      accountType: previewRow.typeLabel,
      openedAt: "—",
      creditLimit: "—",
      remainingLimit: "—",
      financeWarningTitle: warning.title,
      financeWarningDetail: warning.detail,
      quickActions: COM_QUICK_ACTIONS
    };
  }

  if (!customer) return null;

  const warning = buildFinanceWarning(customer, account, null);
  const creditLimit =
    account?.creditLimit != null ? formatMoney(account.creditLimit, account.currency) : "—";
  const remainingLimit =
    account?.creditLimit != null
      ? formatMoney(Math.max(account.creditLimit - Math.max(account.balance, 0), 0), account.currency)
      : "—";

  return {
    rowId: customer.id,
    code: customer.code,
    name: customer.name,
    status: customer.active ? "Aktif" : "Pasif",
    taxNo: customer.taxNumber ?? "—",
    taxOffice: customer.taxOffice ?? "—",
    city: customer.city,
    group: customer.pricingProfile.priceSlotLabelSnapshot ?? `Slot ${customer.pricingProfile.selectedPriceSlotNo}`,
    accountType: resolveCustomerDisplayType(customer.type),
    openedAt: formatDateTr(customer.createdAt),
    creditLimit,
    remainingLimit,
    financeWarningTitle: warning.title,
    financeWarningDetail: warning.detail,
    quickActions: COM_QUICK_ACTIONS
  };
}

export function mapCustomersToReferenceKpis(params: {
  data: CustomersQueryResult;
  displayRows: CustomerRow[];
  usingDemo: boolean;
}): ComReferenceKpi[] {
  const { data, displayRows, usingDemo } = params;

  if (usingDemo) {
    const metrics = computeKpiMetricsFromCustomerRows(displayRows);
    return [
      {
        id: "total",
        label: "Toplam Cari",
        value: formatCount(metrics.totalCount),
        tone: "green",
        icon: "users"
      },
      {
        id: "active",
        label: "Aktif",
        value: formatCount(metrics.totalCount),
        tone: "teal",
        icon: "check"
      },
      {
        id: "risky",
        label: "Riskli Bakiye",
        value: formatMoney(metrics.receivableSumTry),
        tone: "gold",
        icon: "wallet"
      },
      {
        id: "limit",
        label: "Limit Aşımı",
        value: formatCount(metrics.highRiskCount),
        tone: "red",
        icon: "alert"
      },
      {
        id: "new",
        label: "Bu Ay Yeni",
        value: formatCount(Math.min(2, metrics.totalCount)),
        tone: "green",
        icon: "spark"
      }
    ];
  }

  const hasFinance = data.accounts.length > 0;
  const openBalanceTry = hasFinance
    ? data.accounts.reduce((total, account) => total + Math.max(account.balance, 0), 0)
    : null;
  const limitExceeded = data.accounts.filter(
    (account) => account.creditLimit != null && account.balance > account.creditLimit
  ).length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = data.customers.filter((customer) => new Date(customer.createdAt) >= monthStart).length;

  return [
    {
      id: "total",
      label: "Toplam Cari",
      value: formatCount(data.customers.length),
      tone: "green",
      icon: "users"
    },
    {
      id: "active",
      label: "Aktif",
      value: formatCount(data.customers.filter((customer) => customer.active).length),
      tone: "teal",
      icon: "check"
    },
    {
      id: "risky",
      label: "Riskli Bakiye",
      value: openBalanceTry === null ? "—" : formatMoney(openBalanceTry),
      tone: "gold",
      icon: "wallet"
    },
    {
      id: "limit",
      label: "Limit Aşımı",
      value: hasFinance ? formatCount(limitExceeded) : "—",
      tone: "red",
      icon: "alert"
    },
    {
      id: "new",
      label: "Bu Ay Yeni",
      value: formatCount(newThisMonth),
      tone: "green",
      icon: "spark"
    }
  ];
}

export function riskBadgeClass(risk: ComReferenceRisk): string {
  if (risk === "Yüksek") return "com-badge com-badge--high";
  if (risk === "Orta") return "com-badge com-badge--mid";
  return "com-badge com-badge--low";
}

export function statusBadgeClass(status: ComReferenceContext["status"]): string {
  if (status === "Pasif") return "com-badge com-badge--mid";
  if (status === "Önizleme") return "com-badge com-badge--mid";
  return "com-badge com-badge--active";
}
