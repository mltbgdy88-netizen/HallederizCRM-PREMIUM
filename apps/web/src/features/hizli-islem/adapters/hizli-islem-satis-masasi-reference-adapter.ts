import type { Customer, Product, SaleOrder } from "@hallederiz/types";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getOrders } from "../../orders/queries/get-orders";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";
import { formatCount, formatRelativeTimeAgo, formatTryMoney } from "../../../lib/reference/formatters";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import {
  HISM_FORM,
  HISM_LINES,
  HISM_PAGE,
  HISM_RECENT,
  HISM_SUMMARY
} from "../data/hizli-islem-satis-masasi-mock";

export type HizliIslemSatisMasasiLine = (typeof HISM_LINES)[number];
export type HizliIslemSatisMasasiRecent = (typeof HISM_RECENT)[number];

export type HizliIslemSatisMasasiSummary = {
  subtotal: string;
  discount: string;
  afterDisc: string;
  vat: string;
  grand: string;
  products: string;
  totalQty: string;
};

export type HizliIslemSatisMasasiSnapshot = {
  page: typeof HISM_PAGE;
  recent: HizliIslemSatisMasasiRecent[];
  form: typeof HISM_FORM;
  lines: HizliIslemSatisMasasiLine[];
  summary: HizliIslemSatisMasasiSummary;
  demoBanner: string | null;
};

const VAT_RATE = 20;

function formatQty(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function mapOrderToHismStatus(order: SaleOrder): string {
  if (order.status === "draft") return "Taslak";
  if (
    order.status === "confirmed" ||
    order.status === "waiting_stock" ||
    order.status === "in_preparation" ||
    order.status === "ready"
  ) {
    return "Onayda";
  }
  if (order.status === "completed" || order.status === "delivered" || order.status === "partially_delivered") {
    return "Onaylandı";
  }
  return "Taslak";
}

function mapOrderToRecent(order: SaleOrder, customers: Customer[]): HizliIslemSatisMasasiRecent {
  const row = mapOrderRow(order, customers);
  const amount = row.totalLabel.startsWith("₺") ? row.totalLabel : `₺${row.totalLabel}`;
  return {
    id: row.orderNo,
    amount,
    customer: row.customerName,
    status: mapOrderToHismStatus(order),
    time: formatRelativeTimeAgo(order.updatedAt || order.createdAt)
  };
}

type LineBuild = {
  line: HizliIslemSatisMasasiLine;
  qty: number;
  lineTotal: number;
};

function mapProductToLineBuild(product: Product, index: number): LineBuild {
  const tier = product.priceTiers.find((t) => t.active && t.amount > 0);
  const unitPrice = tier?.amount ?? 0;
  const currency = tier?.currency ?? "TRY";
  const qty = 1;
  const lineTotal = unitPrice * qty;
  return {
    qty,
    lineTotal,
    line: {
      id: String(index + 1),
      code: product.code,
      name: product.name,
      qty: formatQty(qty),
      unit: "Adet",
      price: formatTryMoney(unitPrice, currency),
      disc: "0",
      vat: `%${VAT_RATE}`,
      total: formatTryMoney(lineTotal, currency)
    }
  };
}

function buildSummaryFromLineBuilds(builds: LineBuild[]): HizliIslemSatisMasasiSummary {
  if (!builds.length) {
    return {
      subtotal: "₺0,00",
      discount: "₺0,00",
      afterDisc: "₺0,00",
      vat: "₺0,00",
      grand: "₺0,00",
      products: "0 ürün",
      totalQty: "Toplam Miktar: 0,000"
    };
  }

  const subtotalNum = builds.reduce((sum, b) => sum + b.lineTotal, 0);
  const qtyTotal = builds.reduce((sum, b) => sum + b.qty, 0);
  const discountNum = 0;
  const afterDisc = subtotalNum - discountNum;
  const vatNum = afterDisc * (VAT_RATE / 100);
  const grand = afterDisc + vatNum;

  return {
    subtotal: formatTryMoney(subtotalNum),
    discount: formatTryMoney(discountNum),
    afterDisc: formatTryMoney(afterDisc),
    vat: formatTryMoney(vatNum),
    grand: formatTryMoney(grand),
    products: `${formatCount(builds.length)} ürün`,
    totalQty: `Toplam Miktar: ${formatQty(qtyTotal)}`
  };
}

export function loadHizliIslemSatisMasasiDemo(): HizliIslemSatisMasasiSnapshot {
  return {
    page: HISM_PAGE,
    recent: HISM_RECENT,
    form: HISM_FORM,
    lines: HISM_LINES,
    summary: HISM_SUMMARY,
    demoBanner: REFERENCE_DEMO_BANNER
  };
}

export async function loadHizliIslemSatisMasasiLive(): Promise<HizliIslemSatisMasasiSnapshot> {
  const [{ orders, customers }, catalog] = await Promise.all([getOrders(), getStockCatalog()]);
  const lineBuilds = catalog.products.slice(0, 5).map(mapProductToLineBuild);

  return {
    page: HISM_PAGE,
    recent: orders
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((order) => mapOrderToRecent(order, customers)),
    form: HISM_FORM,
    lines: lineBuilds.map((b) => b.line),
    summary: buildSummaryFromLineBuilds(lineBuilds),
    demoBanner: null
  };
}

export const HIZLI_ISLEM_SATIS_MASASI_INITIAL = loadHizliIslemSatisMasasiDemo();

