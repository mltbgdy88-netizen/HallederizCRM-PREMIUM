import type { Product } from "@hallederiz/types";
import { mapProductToStockRow } from "../../stock/mappers/map-stock-row";
import { getStockCatalog } from "../../stock/queries/get-stock-catalog";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { buildTableMeta, formatCount } from "../../../lib/reference/formatters";
import {
  getSomContext,
  SOM_DEMO_BANNER,
  SOM_FILTERS,
  SOM_FILTER_SEARCH_PLACEHOLDER,
  SOM_KPIS,
  SOM_PAGE_NUMBERS,
  SOM_SUBTITLE,
  SOM_TABLE_ROWS,
  SOM_TABLE_TOTAL,
  SOM_TITLE,
  type StokContextDetail,
  type StokKpi,
  type StokTableRow
} from "../data/stok-operasyon-mock";

export type StokReferenceSnapshot = {
  title: string;
  subtitle: string;
  kpis: StokKpi[];
  filterSearchPlaceholder: string;
  filters: typeof SOM_FILTERS;
  demoBanner: string | null;
  tableRows: StokTableRow[];
  tableTotal: string;
  pageNumbers: readonly string[];
  getContext: (rowId: string) => StokContextDetail;
};

function mapProductTableRow(
  product: Product,
  catalog: Awaited<ReturnType<typeof getStockCatalog>>
): StokTableRow {
  const row = mapProductToStockRow({
    product,
    brands: catalog.brands,
    factories: catalog.factories,
    warehouses: catalog.warehouses,
    priceSlots: catalog.priceSlots,
    referenceCatalogLinked: catalog.brands.length > 0 || catalog.warehouses.length > 0
  });
  const status: StokTableRow["status"] =
    row.displayStatus === "kritik" || row.displayStatus === "tukeniyor" ? "Kritik" : "Stokta";

  return {
    id: product.id,
    code: row.productCode,
    name: row.productName,
    centerStock: formatCount(row.centerWarehouseStockTotal),
    factoryStock: formatCount(row.factoryStockTotal),
    depotRaf: formatCount(row.availableTotal),
    depotRafSub: row.rackDisplayLine,
    price: row.priceMainLine,
    status
  };
}

function buildContext(
  product: Product,
  catalog: Awaited<ReturnType<typeof getStockCatalog>>
): StokContextDetail {
  const row = mapProductToStockRow({
    product,
    brands: catalog.brands,
    factories: catalog.factories,
    warehouses: catalog.warehouses,
    priceSlots: catalog.priceSlots,
    referenceCatalogLinked: catalog.brands.length > 0 || catalog.warehouses.length > 0
  });
  const status: StokContextDetail["status"] =
    row.displayStatus === "kritik" || row.displayStatus === "tukeniyor" ? "Kritik" : "Stokta";

  return {
    productId: product.id,
    code: row.productCode,
    name: row.productName,
    status,
    barcode: row.primaryBarcode,
    brand: row.brandName,
    category: row.categorySummary,
    price: row.priceMainLine,
    priceGroup: row.priceGroupLabel,
    unit: "Adet",
    factoryAlertTitle: status === "Kritik" ? "Fabrika Stok Uyarısı" : "Fabrika Stok",
    factoryAlertDetail: row.factorySubline,
    depotAlertTitle: "Depo Raf",
    depotAlertDetail: `${row.depotDisplayName} · ${row.rackDisplayLine}`,
    summary: [
      { label: "Merkez", value: formatCount(row.centerWarehouseStockTotal) },
      { label: "Fabrika", value: formatCount(row.factoryStockTotal) },
      { label: "Kullanılabilir", value: formatCount(row.availableTotal) }
    ],
    depotInfo: [
      { label: "Depo", value: row.depotDisplayName },
      { label: "Raf", value: row.rackDisplayLine }
    ],
    capacityCurrent: formatCount(row.availableTotal),
    capacityMax: formatCount(row.centerWarehouseStockTotal + row.factoryStockTotal),
    capacityPct: row.centerWarehouseStockTotal > 0 ? Math.min(100, Math.round((row.availableTotal / row.centerWarehouseStockTotal) * 100)) : 0
  };
}

async function buildLiveSnapshot(): Promise<StokReferenceSnapshot> {
  const catalog = await getStockCatalog();
  const { products } = catalog;
  const tableRows = products.map((p) => mapProductTableRow(p, catalog));
  const meta = buildTableMeta(products.length);
  const contextByRow = Object.fromEntries(
    products.map((p) => [p.id, buildContext(p, catalog)])
  ) as Record<string, StokContextDetail>;
  const critical = tableRows.filter((r) => r.status === "Kritik").length;

  return {
    title: SOM_TITLE,
    subtitle: SOM_SUBTITLE,
    kpis: [
      { id: "total", label: "Toplam Ürün", value: formatCount(products.length), tone: "green" },
      { id: "critical", label: "Kritik Stok", value: formatCount(critical), tone: "orange" },
      { id: "center", label: "Merkez Stok", value: "—", tone: "teal" },
      { id: "factory", label: "Fabrika Stok", value: "—", tone: "blue" },
      { id: "shelf", label: "Depo Raf", value: "—", tone: "slate" },
      { id: "price", label: "Fiyat Grubu", value: String(catalog.priceSlots.length || "—"), tone: "gold" }
    ],
    filterSearchPlaceholder: SOM_FILTER_SEARCH_PLACEHOLDER,
    filters: SOM_FILTERS,
    demoBanner: null,
    tableRows,
    tableTotal: meta.tableTotal,
    pageNumbers: meta.pageNumbers,
    getContext: (rowId) => contextByRow[rowId] ?? buildContext(products[0]!, catalog)
  };
}

export function loadStokReferenceDemo(): StokReferenceSnapshot {
  return {
    title: SOM_TITLE,
    subtitle: SOM_SUBTITLE,
    kpis: SOM_KPIS,
    filterSearchPlaceholder: SOM_FILTER_SEARCH_PLACEHOLDER,
    filters: SOM_FILTERS,
    demoBanner: SOM_DEMO_BANNER || REFERENCE_DEMO_BANNER,
    tableRows: SOM_TABLE_ROWS,
    tableTotal: SOM_TABLE_TOTAL,
    pageNumbers: SOM_PAGE_NUMBERS,
    getContext: getSomContext
  };
}

export async function loadStokReferenceLive(): Promise<StokReferenceSnapshot> {
  return buildLiveSnapshot();
}

export const STOK_REFERENCE_INITIAL = loadStokReferenceDemo();

