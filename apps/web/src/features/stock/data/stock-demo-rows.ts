import type { Brand, CriticalStockStatus, CurrencyCode, Factory, Warehouse } from "@hallederiz/types";
import type { StockDisplayStatus, StockRow } from "../mappers/map-stock-row";
import type { StockFilters } from "../schemas/stock-filter-schema";

export const HZ_STOCK_DEMO_PREFIX = "hz_demo_stock_" as const;

export function isStockDemoRowId(id: string): boolean {
  return id.startsWith(HZ_STOCK_DEMO_PREFIX);
}

function row(partial: Omit<StockRow, "productId"> & { suffix: string }): StockRow {
  const { suffix, ...rest } = partial;
  return { ...rest, productId: `${HZ_STOCK_DEMO_PREFIX}${suffix}` };
}

/** Örnek stok satırları — yalnızca katalog boşken gösterilir; gerçek ID ile karışmaz. */
export const STOCK_OPERATION_DEMO_ROWS: StockRow[] = [
  row({
    suffix: "001",
    productCode: "URN-001",
    productName: "Premium Kutu Ambalaj",
    brandName: "AmbalajPro",
    centerWarehouseStockTotal: 58,
    factoryStockTotal: 120,
    criticalStockStatus: "ok" as CriticalStockStatus,
    criticalLevel: 20,
    active: true,
    primaryBarcode: "8680001001001",
    qrCodeValue: "QR-URN-001",
    categorySummary: "Ambalaj · Kutu",
    productSubline: "8680001001001 · Ambalaj · Kutu · AmbalajPro",
    centerDetailLine: "Eşik: 20",
    factorySubline: "Ankara Fabrika · Güncellendi: 02.05.2026 09:12",
    factoryName: "Ankara Fabrika",
    depotDisplayName: "Depo Merkez",
    rackDisplayLine: "Raf A-12",
    locationFingerprint: "demo-wh-1|A-12",
    priceMainLine: "₺148,50",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 148.5,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺132,00",
    corporatePriceLine: "Kurumsal: ₺125,40",
    priceGroupLabel: "Liste, Bayi",
    displayStatus: "saglikli",
    reservedTotal: 4,
    availableTotal: 54,
    lastMovementLine: "Son hareket: 01.05.2026 çıkış",
    lastCountLine: "Son sayım: 28.04.2026"
  }),
  row({
    suffix: "056",
    productCode: "URN-056",
    productName: "Endüstriyel Streç Film",
    brandName: "WrapLine",
    centerWarehouseStockTotal: 14,
    factoryStockTotal: 60,
    criticalStockStatus: "critical" as CriticalStockStatus,
    criticalLevel: 24,
    active: true,
    primaryBarcode: "8680001056002",
    qrCodeValue: "QR-URN-056",
    categorySummary: "Sarf · Film",
    productSubline: "8680001056002 · Sarf · Film · WrapLine",
    centerDetailLine: "Eşik: 24",
    factorySubline: "İzmir Fabrika · Veri gecikmiş olabilir",
    factoryName: "İzmir Fabrika",
    depotDisplayName: "Depo Merkez",
    rackDisplayLine: "Raf B-04",
    locationFingerprint: "demo-wh-1|B-04",
    priceMainLine: "₺320,00",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 320,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺298,00",
    corporatePriceLine: "Kurumsal: ₺285,00",
    priceGroupLabel: "Liste, Bayi",
    displayStatus: "kritik",
    reservedTotal: 2,
    availableTotal: 12,
    lastMovementLine: "Son hareket: 30.04.2026 giriş",
    lastCountLine: "Son sayım: —"
  }),
  row({
    suffix: "104",
    productCode: "URN-104",
    productName: "Oluklu Koli 40x60",
    brandName: "KoliMark",
    centerWarehouseStockTotal: 220,
    factoryStockTotal: 480,
    criticalStockStatus: "ok" as CriticalStockStatus,
    criticalLevel: 40,
    active: true,
    primaryBarcode: "8680001104003",
    qrCodeValue: "QR-URN-104",
    categorySummary: "Ambalaj · Koli",
    productSubline: "8680001104003 · Ambalaj · Koli · KoliMark",
    centerDetailLine: "Eşik: 40",
    factorySubline: "Bursa Fabrika · Senkron",
    factoryName: "Bursa Fabrika",
    depotDisplayName: "Depo Fabrika",
    rackDisplayLine: "Raf C-18",
    locationFingerprint: "demo-wh-2|C-18",
    priceMainLine: "₺42,75",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 42.75,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺39,90",
    corporatePriceLine: "Kurumsal: ₺37,50",
    priceGroupLabel: "Liste",
    displayStatus: "saglikli",
    reservedTotal: 10,
    availableTotal: 210,
    lastMovementLine: "Son hareket: 02.05.2026 çıkış",
    lastCountLine: "Son sayım: 25.04.2026"
  }),
  row({
    suffix: "221",
    productCode: "URN-221",
    productName: "Plastik Palet",
    brandName: "Paleta",
    centerWarehouseStockTotal: 8,
    factoryStockTotal: 22,
    criticalStockStatus: "ok" as CriticalStockStatus,
    criticalLevel: 5,
    active: true,
    primaryBarcode: "8680001221004",
    qrCodeValue: "QR-URN-221",
    categorySummary: "Lojistik · Palet",
    productSubline: "8680001221004 · Lojistik · Palet · Paleta",
    centerDetailLine: "Eşik: 5",
    factorySubline: "Ankara Fabrika · Güncellendi: 01.05.2026 16:40",
    factoryName: "Ankara Fabrika",
    depotDisplayName: "Depo Merkez",
    rackDisplayLine: "Raf D-02",
    locationFingerprint: "demo-wh-1|D-02",
    priceMainLine: "₺680,00",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 680,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺640,00",
    corporatePriceLine: "Kurumsal: ₺610,00",
    priceGroupLabel: "Liste, Kurumsal",
    displayStatus: "tukeniyor" as StockDisplayStatus,
    reservedTotal: 1,
    availableTotal: 7,
    lastMovementLine: "Son hareket: 29.04.2026 çıkış",
    lastCountLine: "Son sayım: —"
  }),
  row({
    suffix: "318",
    productCode: "URN-318",
    productName: "Etiket Rulosu",
    brandName: "EtiketA",
    centerWarehouseStockTotal: 76,
    factoryStockTotal: 140,
    criticalStockStatus: "ok" as CriticalStockStatus,
    criticalLevel: 18,
    active: true,
    primaryBarcode: "8680001318005",
    qrCodeValue: "QR-URN-318",
    categorySummary: "Ofis · Etiket",
    productSubline: "8680001318005 · Ofis · Etiket · EtiketA",
    centerDetailLine: "Eşik: 18",
    factorySubline: "İzmir Fabrika · Senkron",
    factoryName: "İzmir Fabrika",
    depotDisplayName: "Depo Merkez",
    rackDisplayLine: "Raf E-10",
    locationFingerprint: "demo-wh-1|E-10",
    priceMainLine: "₺95,00",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 95,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺88,00",
    corporatePriceLine: "Kurumsal: ₺84,00",
    priceGroupLabel: "Liste",
    displayStatus: "saglikli",
    reservedTotal: 6,
    availableTotal: 70,
    lastMovementLine: "Son hareket: 02.05.2026 giriş",
    lastCountLine: "Son sayım: 30.04.2026"
  }),
  row({
    suffix: "402",
    productCode: "URN-402",
    productName: "Koruyucu Köpük Levha",
    brandName: "FoamX",
    centerWarehouseStockTotal: 0,
    factoryStockTotal: 18,
    criticalStockStatus: "critical" as CriticalStockStatus,
    criticalLevel: 12,
    active: true,
    primaryBarcode: "8680001402006",
    qrCodeValue: "QR-URN-402",
    categorySummary: "Koruma · Köpük",
    productSubline: "8680001402006 · Koruma · Köpük · FoamX",
    centerDetailLine: "Eşik: 12",
    factorySubline: "Bursa Fabrika · Teyit bekleniyor",
    factoryName: "Bursa Fabrika",
    depotDisplayName: "Depo Fabrika",
    rackDisplayLine: "Raf F-07",
    locationFingerprint: "demo-wh-2|F-07",
    priceMainLine: "₺210,00",
    priceSubLine: "Liste fiyatı",
    listPriceAmount: 210,
    listPriceCurrency: "TRY" as CurrencyCode,
    dealerPriceLine: "Bayi: ₺198,00",
    corporatePriceLine: "Kurumsal: ₺190,00",
    priceGroupLabel: "Liste, Bayi",
    displayStatus: "kritik",
    reservedTotal: 0,
    availableTotal: 0,
    lastMovementLine: "Son hareket: 27.04.2026 çıkış",
    lastCountLine: "Son sayım: —"
  })
];

/** Önizleme satırlarında sunucu filtresi yok; temel alanlarla süzülür. */
export function filterStockDemoRows(
  rows: StockRow[],
  filters: StockFilters,
  factories: Factory[],
  brands: Brand[],
  warehouses: Warehouse[]
): StockRow[] {
  return rows.filter((r) => {
    const q = filters.searchText.toLowerCase().trim();
    if (q) {
      const hay = `${r.productCode} ${r.productName} ${r.primaryBarcode} ${r.brandName} ${r.depotDisplayName} ${r.rackDisplayLine} ${r.priceMainLine}`
        .toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }

    if (filters.brandId) {
      const bn = brands.find((b) => b.id === filters.brandId)?.name;
      if (bn && r.brandName !== bn) {
        return false;
      }
    }

    if (filters.factoryId) {
      const fn = factories.find((f) => f.id === filters.factoryId)?.name;
      if (fn && r.factoryName !== fn) {
        return false;
      }
    }

    if (filters.warehouseId) {
      const wn = warehouses.find((w) => w.id === filters.warehouseId)?.name;
      if (wn && r.depotDisplayName !== wn) {
        return false;
      }
    }

    if (filters.category1 && !r.categorySummary.toLowerCase().includes(filters.category1.toLowerCase())) {
      return false;
    }

    if (filters.stockStatusFilter) {
      if (r.displayStatus !== filters.stockStatusFilter) {
        return false;
      }
    } else if (filters.criticalOnly && r.criticalStockStatus !== "critical") {
      return false;
    }

    if (filters.inStockOnly && r.centerWarehouseStockTotal <= 0) {
      return false;
    }

    return true;
  });
}

export function computeStockKpisFromDisplayedRows(rows: StockRow[], priceSlotCount: number) {
  const criticalCount = rows.filter((r) => r.displayStatus === "kritik" || r.criticalStockStatus === "critical").length;
  const totalCenterStock = rows.reduce((s, r) => s + r.centerWarehouseStockTotal, 0);
  const totalFactoryStock = rows.reduce((s, r) => s + r.factoryStockTotal, 0);
  const depotRafCount = new Set(rows.map((r) => r.locationFingerprint)).size;
  const uniquePriceGroups = new Set(rows.map((r) => r.priceGroupLabel).filter((v) => v && v !== "—")).size;
  const priceGroupKpi = priceSlotCount > 0 ? priceSlotCount : Math.max(uniquePriceGroups, 1);

  return {
    totalProducts: rows.length,
    criticalCount,
    totalCenterStock,
    totalFactoryStock,
    depotRafCount,
    priceGroupCount: priceGroupKpi
  };
}
