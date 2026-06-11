import { computeStockKpisFromDisplayedRows } from "../data/stock-demo-rows";
import type { StockRow } from "../mappers/map-stock-row";

export type SomReferenceStatus = "Stokta" | "Kritik";
export type SomKpiTone = "green" | "orange" | "teal" | "blue" | "slate" | "gold";
export type SomKpiIcon = "package" | "alert" | "center" | "factory" | "shelf" | "price";

export type SomReferenceKpi = {
  id: string;
  label: string;
  value: string;
  tone: SomKpiTone;
  icon: SomKpiIcon;
};

export type SomReferenceTableRow = {
  id: string;
  code: string;
  name: string;
  centerStock: string;
  factoryStock: string;
  depotRaf: string;
  depotRafSub: string;
  price: string;
  status: SomReferenceStatus;
};

export type SomContextSummaryRow = { label: string; value: string };
export type SomContextDepotRow = { label: string; value: string };

export type SomReferenceContext = {
  productId: string;
  code: string;
  name: string;
  status: SomReferenceStatus;
  barcode: string;
  brand: string;
  category: string;
  price: string;
  priceGroup: string;
  unit: string;
  factoryAlertTitle: string;
  factoryAlertDetail: string;
  depotAlertTitle: string;
  depotAlertDetail: string;
  summary: SomContextSummaryRow[];
  depotInfo: SomContextDepotRow[];
  capacityCurrent: string;
  capacityMax: string;
  capacityPct: number;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function formatAdet(value: number): string {
  return `${formatCount(value)} adet`;
}

function referenceStatus(row: StockRow): SomReferenceStatus {
  if (row.displayStatus === "kritik" || row.criticalStockStatus === "critical") {
    return "Kritik";
  }
  return "Stokta";
}

function capacityPctForRow(row: StockRow): number {
  if (row.displayStatus === "kritik") return 92;
  if (row.displayStatus === "tukeniyor") return 78;
  if (row.displayStatus === "blokeli") return 45;
  return 68;
}

export function mapStockRowToTableRow(row: StockRow): SomReferenceTableRow {
  return {
    id: row.productId,
    code: row.productCode,
    name: row.productName,
    centerStock: formatCount(row.centerWarehouseStockTotal),
    factoryStock: formatCount(row.factoryStockTotal),
    depotRaf: formatCount(row.availableTotal > 0 ? row.availableTotal : row.centerWarehouseStockTotal),
    depotRafSub: row.rackDisplayLine,
    price: row.priceMainLine,
    status: referenceStatus(row)
  };
}

export function mapStockRowToContextPanel(row: StockRow | null): SomReferenceContext | null {
  if (!row) return null;

  const status = referenceStatus(row);
  const capacityPct = capacityPctForRow(row);
  const capacityMax = Math.max(row.centerWarehouseStockTotal, row.availableTotal, 1);
  const capacityCurrent = formatCount(Math.round((capacityMax * capacityPct) / 100));

  const factoryAlertDetail =
    status === "Kritik"
      ? `Minimum: ${row.criticalLevel} | Mevcut: ${formatCount(row.factoryStockTotal)}`
      : `Minimum: ${row.criticalLevel} | Mevcut: ${formatCount(row.factoryStockTotal)}`;

  return {
    productId: row.productId,
    code: row.productCode,
    name: row.productName,
    status,
    barcode: row.primaryBarcode,
    brand: row.brandName,
    category: row.categorySummary,
    price: row.priceMainLine,
    priceGroup: row.priceGroupLabel,
    unit: "Adet",
    factoryAlertTitle: "Fabrika Stok Seviyesi Düşük",
    factoryAlertDetail,
    depotAlertTitle: "Depo Raf Kapasite",
    depotAlertDetail: `Kullanım Oranı: %${capacityPct}`,
    summary: [
      { label: "Merkez Stok", value: formatCount(row.centerWarehouseStockTotal) },
      { label: "Fabrika Stok", value: formatCount(row.factoryStockTotal) },
      { label: "Depo Raf", value: formatCount(row.availableTotal) },
      { label: "Rezerve", value: formatCount(row.reservedTotal) },
      { label: "Kullanılabilir", value: formatCount(row.availableTotal) }
    ],
    depotInfo: [
      { label: "Depo", value: row.depotDisplayName },
      { label: "Raf Kodu", value: row.rackDisplayLine },
      { label: "Raf Tipi", value: status === "Kritik" ? "Kritik Raf" : "Standart" }
    ],
    capacityCurrent,
    capacityMax: formatAdet(capacityMax),
    capacityPct
  };
}

export function mapStockRowsToReferenceKpis(
  displayRows: StockRow[],
  priceSlotActiveCount: number
): SomReferenceKpi[] {
  const metrics = computeStockKpisFromDisplayedRows(displayRows, priceSlotActiveCount);

  return [
    {
      id: "total",
      label: "Toplam Ürün",
      value: formatCount(metrics.totalProducts),
      tone: "green",
      icon: "package"
    },
    {
      id: "critical",
      label: "Kritik Stok",
      value: formatCount(metrics.criticalCount),
      tone: "orange",
      icon: "alert"
    },
    {
      id: "center",
      label: "Merkez Stok",
      value: formatAdet(metrics.totalCenterStock),
      tone: "teal",
      icon: "center"
    },
    {
      id: "factory",
      label: "Fabrika Stok",
      value: formatAdet(metrics.totalFactoryStock),
      tone: "blue",
      icon: "factory"
    },
    {
      id: "shelf",
      label: "Depo Raf",
      value: formatAdet(metrics.totalCenterStock),
      tone: "slate",
      icon: "shelf"
    },
    {
      id: "price",
      label: "Fiyat Grubu",
      value: formatCount(metrics.priceGroupCount),
      tone: "gold",
      icon: "price"
    }
  ];
}

export function statusBadgeClass(status: SomReferenceStatus): string {
  return status === "Kritik" ? "som-badge som-badge--warn" : "som-badge som-badge--ok";
}
