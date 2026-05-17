import type { Customer, CustomerAccount, Product } from "@hallederiz/types";
import { customers as demoCatalogCustomers, getCustomerAccount } from "../../../demo/customers";
import { stockCatalog } from "../../../demo";
import { dataSourceConfig } from "../../../lib/data-source";
import { CUSTOMERS_PORTFOLIO_DEMO_ROWS } from "../../customers/data/customers-demo-rows";
import type { QuickOperationCustomer, QuickOperationLine } from "../types";

function mapRisk(risk: Customer["riskLevel"]): QuickOperationCustomer["risk"] {
  if (risk === "high" || risk === "blocked") return "Yüksek";
  if (risk === "medium") return "Orta";
  return "Düşük";
}

function formatBalance(amount: number): string {
  return amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

function mapCatalogCustomer(customer: Customer, account: CustomerAccount | null, financeLinked: boolean): QuickOperationCustomer {
  const balance = account?.balance ?? 0;
  const overdue = account?.overdueAmount ?? 0;
  return {
    id: customer.id,
    name: customer.name,
    contactName: customer.name,
    phone: customer.phone ?? "-",
    priceGroup: customer.pricingProfile?.priceSlotLabelSnapshot ?? "Genel",
    customerType: customer.type,
    whatsappMatched: customer.whatsappMatched,
    risk: mapRisk(customer.riskLevel),
    balance,
    address: customer.addressLine ?? customer.city ?? "-",
    receivableDisplay: financeLinked && balance > 0 ? formatBalance(balance) : "—",
    payableDisplay: financeLinked && overdue > 0 ? formatBalance(overdue) : "—",
    warningDisplay:
      financeLinked && overdue > 0
        ? `${formatBalance(overdue)} TL gecikmiş bakiye`
        : customer.riskLevel === "blocked"
          ? "Cari blokeli"
          : "—",
    financeLinked
  };
}

function mapPortfolioRowToCustomer(
  row: (typeof CUSTOMERS_PORTFOLIO_DEMO_ROWS)[number]
): QuickOperationCustomer {
  const risk: QuickOperationCustomer["risk"] =
    row.riskTone === "danger" ? "Yüksek" : row.riskTone === "warning" ? "Orta" : "Düşük";
  return {
    id: row.customerId,
    name: row.name,
    contactName: row.name,
    phone: row.phone,
    priceGroup: row.priceGroupLabel,
    customerType: row.typeLabel,
    whatsappMatched: row.whatsappMatched,
    risk,
    balance: 0,
    address: row.city,
    receivableDisplay: row.financeLinked ? row.balanceCreditLine.replace(" alacak", "") : "—",
    payableDisplay: row.financeLinked ? row.balanceDebitLine : "—",
    warningDisplay: row.riskLabel !== "Düşük" ? `${row.riskLabel} risk` : "—",
    financeLinked: row.financeLinked
  };
}

/** Demo modda cari listesi — kanonik demo/customers + cariler onizleme satirlari. */
export function buildQuickOperationCustomers(): QuickOperationCustomer[] {
  if (!dataSourceConfig.useDemoData) {
    return [];
  }

  const fromCatalog = demoCatalogCustomers.map((customer) =>
    mapCatalogCustomer(customer, getCustomerAccount(customer.id), true)
  );

  const portfolioOnly = CUSTOMERS_PORTFOLIO_DEMO_ROWS.filter(
    (row) => !fromCatalog.some((c) => c.id === row.customerId)
  ).map(mapPortfolioRowToCustomer);

  return [...fromCatalog, ...portfolioOnly];
}

export function findQuickOperationCustomer(customerId: string): QuickOperationCustomer | undefined {
  return buildQuickOperationCustomers().find((c) => c.id === customerId);
}

export function findCatalogProduct(productId: string): Product | undefined {
  if (!dataSourceConfig.useDemoData) {
    return undefined;
  }
  return stockCatalog.products.find((p) => p.id === productId);
}

export function productToQuickOperationLine(product: Product): QuickOperationLine {
  const tier = product.priceTiers.find((t) => t.active && t.amount > 0);
  const unitPrice = tier?.amount ?? 0;
  const centerWh = stockCatalog.warehouses.find((w) => w.isCentral);
  const stock = product.warehouseStocks.find((s) => s.warehouseId === centerWh?.id);
  const loc = product.locations.find((l) => l.warehouseId === centerWh?.id);

  return {
    id: `line_prod_${product.id}_${Date.now()}`,
    productCode: product.code,
    productName: product.name,
    unit: "Adet",
    quantity: 1,
    unitPrice,
    taxRate: tier?.currency === "TRY" ? 20 : 20,
    sourceType: "center_warehouse",
    sourceLabel: "Merkez",
    warehouseName: centerWh?.name ?? "—",
    rackCode: loc?.rackNo ?? "—",
    locationCode: loc?.locationCode ?? "—"
  };
}
