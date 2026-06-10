import type { CustomerRow } from "../mappers/map-customer-row";

/** UI-only fallback when API returns zero customers; never mixed with real IDs. */
export const HZ_CUSTOMERS_DEMO_PREFIX = "hz_demo_" as const;

export const CUSTOMERS_PORTFOLIO_DEMO_ROWS: CustomerRow[] = [
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}delta`,
    code: "CUS-001",
    name: "Delta A.�?.",
    typeLabel: "Bayi",
    phone: "+90 312 000 00 01",
    city: "Ankara",
    balanceLabel: "₺84.500",
    balanceCreditLine: "₺84.500 alacak",
    balanceDebitLine: "—",
    riskLabel: "Orta",
    riskTone: "warning",
    priceGroupLabel: "Bayi A / Slot 2",
    lastOrderLabel: "12.04.2026",
    whatsappMatched: true,
    financeLinked: true
  },
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}nova`,
    code: "CUS-002",
    name: "Nova Gıda",
    typeLabel: "Kurumsal",
    phone: "+90 232 000 00 02",
    city: "İzmir",
    balanceLabel: "₺48.750",
    balanceCreditLine: "₺48.750 alacak",
    balanceDebitLine: "—",
    riskLabel: "Normal",
    riskTone: "success",
    priceGroupLabel: "Kurumsal / Slot 1",
    lastOrderLabel: "28.03.2026",
    whatsappMatched: true,
    financeLinked: true
  },
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}ege`,
    code: "CUS-003",
    name: "Ege Un A.�?.",
    typeLabel: "Toptan",
    phone: "+90 236 000 00 03",
    city: "Manisa",
    balanceLabel: "₺120.000",
    balanceCreditLine: "₺120.000 alacak",
    balanceDebitLine: "—",
    riskLabel: "Yüksek",
    riskTone: "danger",
    priceGroupLabel: "Toptan B / Slot 3",
    lastOrderLabel: "30.04.2026",
    whatsappMatched: true,
    financeLinked: true
  },
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}ghi`,
    code: "CUS-004",
    name: "GHI Mobilya",
    typeLabel: "Perakende",
    phone: "+90 224 000 00 04",
    city: "Bursa",
    balanceLabel: "₺6.450",
    balanceCreditLine: "—",
    balanceDebitLine: "₺6.450 borç",
    riskLabel: "Orta",
    riskTone: "warning",
    priceGroupLabel: "Perakende / Slot 1",
    lastOrderLabel: "01.04.2026",
    whatsappMatched: false,
    financeLinked: true
  },
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}kuzey`,
    code: "CUS-005",
    name: "Kuzey Lojistik",
    typeLabel: "Kurumsal",
    phone: "+90 212 000 00 05",
    city: "İstanbul",
    balanceLabel: "₺22.400",
    balanceCreditLine: "₺22.400 alacak",
    balanceDebitLine: "—",
    riskLabel: "Normal",
    riskTone: "success",
    priceGroupLabel: "Kurumsal / Slot 2",
    lastOrderLabel: "25.04.2026",
    whatsappMatched: true,
    financeLinked: true
  },
  {
    customerId: `${HZ_CUSTOMERS_DEMO_PREFIX}abc`,
    code: "CUS-006",
    name: "ABC Ltd.",
    typeLabel: "Bayi",
    phone: "+90 312 000 00 06",
    city: "Ankara",
    balanceLabel: "₺18.400",
    balanceCreditLine: "₺18.400 alacak",
    balanceDebitLine: "—",
    riskLabel: "Yüksek",
    riskTone: "danger",
    priceGroupLabel: "Bayi B / Slot 2",
    lastOrderLabel: "18.03.2026",
    whatsappMatched: false,
    financeLinked: true
  }
];

export function isCustomersDemoRowId(customerId: string): boolean {
  return customerId.startsWith(HZ_CUSTOMERS_DEMO_PREFIX);
}

/** TR para metninden tam sayı TRY (binlik nokta, ondalık virgül). Sadece UI önizlemesi. */
export function parseTryAmountFromMoneySnippet(text: string): number {
  const head = text.replace(/₺/g, "").trim().split(/\s+/)[0] ?? "";
  if (!head) {
    return 0;
  }
  if (head.includes(",")) {
    const parts = head.split(",");
    const intPart = parts[0] ?? "";
    const decPart = parts[1] ?? "";
    return Number(`${intPart.replace(/\./g, "")}.${decPart}`);
  }
  return Number(head.replace(/\./g, ""));
}

/** Liste satırlarından önizleme KPI üretir; backend yazılmaz. */
export function computeKpiMetricsFromCustomerRows(rows: CustomerRow[]): {
  totalCount: number;
  receivableSumTry: number;
  highRiskCount: number;
  whatsappMatchedCount: number;
  overdueCount: number;
  uniquePriceGroupCount: number;
} {
  let receivableSumTry = 0;
  for (const row of rows) {
    if (row.balanceCreditLine !== "—" && row.balanceCreditLine.includes("alacak")) {
      receivableSumTry += parseTryAmountFromMoneySnippet(row.balanceCreditLine);
    }
  }
  const highRiskCount = rows.filter((r) => r.riskTone === "danger").length;
  const whatsappMatchedCount = rows.filter((r) => r.whatsappMatched).length;
  const uniquePriceGroupCount = new Set(rows.map((r) => r.priceGroupLabel.trim()).filter(Boolean)).size;
  return {
    totalCount: rows.length,
    receivableSumTry,
    highRiskCount,
    whatsappMatchedCount,
    overdueCount: 0,
    uniquePriceGroupCount
  };
}

