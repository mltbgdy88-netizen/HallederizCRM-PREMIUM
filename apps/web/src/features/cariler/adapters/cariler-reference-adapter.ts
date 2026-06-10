import { resolveCustomerDisplayType } from "@hallederiz/domain";
import type { Customer, CustomerAccount } from "@hallederiz/types";
import { mapCustomerToRow } from "../../customers/mappers/map-customer-row";
import { getCustomers } from "../../customers/queries/get-customers";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { buildTableMeta, formatTryMoney } from "../../../lib/reference/formatters";
import {
  COM_CONTEXT_BY_ROW,
  COM_DEMO_BANNER,
  COM_FILTERS,
  COM_FILTER_SEARCH_PLACEHOLDER,
  COM_KPIS,
  COM_PAGE_NUMBERS,
  COM_QUICK_ACTIONS,
  COM_SUBTITLE,
  COM_TABLE_ROWS,
  COM_TABLE_TOTAL,
  COM_TITLE,
  getComContext,
  type CarilerContextDetail,
  type CarilerKpi,
  type CarilerRisk,
  type CarilerTableRow
} from "../data/cariler-operasyon-mock";

export type CarilerReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: CarilerKpi[];
  filterSearchPlaceholder: string;
  filters: typeof COM_FILTERS;
  demoBanner: string | null;
  tableRows: CarilerTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => CarilerContextDetail;
};

function riskFromLabel(label: string): CarilerRisk {
  if (label === "Yüksek" || label === "Blokeli") return "Yüksek";
  if (label === "Orta") return "Orta";
  return "Düşük";
}

function mapCustomerTableRow(
  customer: Customer,
  account: CustomerAccount | null
): CarilerTableRow {
  const row = mapCustomerToRow(customer, account);
  return {
    id: customer.id,
    code: row.code,
    customer: row.name,
    city: row.city || "—",
    balance: row.balanceLabel,
    risk: riskFromLabel(row.riskLabel)
  };
}

function buildContext(customer: Customer, account: CustomerAccount | null): CarilerContextDetail {
  const row = mapCustomerToRow(customer, account);
  return {
    rowId: customer.id,
    code: customer.code,
    name: customer.name,
    status: "Aktif",
    taxNo: customer.taxNumber || "—",
    taxOffice: customer.taxOffice || "—",
    city: customer.city || "—",
    group: resolveCustomerDisplayType(customer.type),
    accountType: row.typeLabel,
    openedAt: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("tr-TR") : "—",
    creditLimit: account?.creditLimit != null ? formatTryMoney(account.creditLimit, account.currency) : "—",
    remainingLimit:
      account?.creditLimit != null && account.balance != null
        ? formatTryMoney(Math.max(account.creditLimit - Math.abs(account.balance), 0), account.currency)
        : "—",
    financeWarningTitle: row.riskTone === "danger" ? "Finansal Uyarı" : "Finans Özeti",
    financeWarningDetail:
      row.financeLinked && account
        ? `Güncel bakiye: ${row.balanceLabel}. Risk: ${row.riskLabel}.`
        : "Canlı hesap özeti henüz bağlanmadı.",
    quickActions: COM_QUICK_ACTIONS
  };
}

function buildLiveSnapshot(
  customers: Customer[],
  accounts: CustomerAccount[]
): CarilerReferenceSnapshot {
  const tableRows = customers.map((customer) =>
    mapCustomerTableRow(
      customer,
      accounts.find((a) => a.customerId === customer.id) ?? null
    )
  );
  const meta = buildTableMeta(customers.length);
  const contextByRow = Object.fromEntries(
    customers.map((customer) => [
      customer.id,
      buildContext(customer, accounts.find((a) => a.customerId === customer.id) ?? null)
    ])
  ) as Record<string, CarilerContextDetail>;

  const riskyCount = tableRows.filter((r) => r.risk === "Yüksek").length;

  return {
    title: COM_TITLE,
    subtitle: COM_SUBTITLE,
    kpis: [
      { id: "total", label: "Toplam Cari", value: String(customers.length), tone: "green" },
      { id: "active", label: "Aktif", value: String(customers.filter((c) => c.active !== false).length), tone: "teal" },
      { id: "risky", label: "Riskli", value: String(riskyCount), tone: "gold" },
      { id: "limit", label: "Limit Aşımı", value: "—", tone: "red" },
      { id: "new", label: "Bu Ay Yeni", value: "—", tone: "green" }
    ],
    filterSearchPlaceholder: COM_FILTER_SEARCH_PLACEHOLDER,
    filters: COM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(customers[0]!, accounts[0] ?? null)
  };
}

export function loadCarilerReferenceDemo(): CarilerReferenceSnapshot {
  return {
    title: COM_TITLE,
    subtitle: COM_SUBTITLE,
    kpis: COM_KPIS,
    filterSearchPlaceholder: COM_FILTER_SEARCH_PLACEHOLDER,
    filters: COM_FILTERS,
    demoBanner: COM_DEMO_BANNER || REFERENCE_DEMO_BANNER,
    tableRows: COM_TABLE_ROWS,
    tableTotal: COM_TABLE_TOTAL,
    pageNumbers: COM_PAGE_NUMBERS,
    getContext: getComContext
  };
}

export async function loadCarilerReferenceLive(): Promise<CarilerReferenceSnapshot> {
  const { customers, accounts } = await getCustomers();
  return buildLiveSnapshot(customers, accounts);
}

export const CARILER_REFERENCE_INITIAL = loadCarilerReferenceDemo();

