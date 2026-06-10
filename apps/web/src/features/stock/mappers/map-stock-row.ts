import { detectCriticalStock, resolveProductAvailability } from "@hallederiz/domain";
import type {
  Brand,
  CriticalStockStatus,
  CurrencyCode,
  Factory,
  PriceSlotConfig,
  Product,
  Warehouse
} from "@hallederiz/types";

export type StockDisplayStatus = "saglikli" | "kritik" | "tukeniyor" | "blokeli";

export interface StockRow {
  productId: string;
  productCode: string;
  productName: string;
  brandName: string;
  centerWarehouseStockTotal: number;
  factoryStockTotal: number;
  criticalStockStatus: CriticalStockStatus;
  criticalLevel: number;
  active: boolean;
  primaryBarcode: string;
  qrCodeValue: string;
  categorySummary: string;
  productSubline: string;
  centerDetailLine: string;
  factorySubline: string;
  factoryName: string;
  depotDisplayName: string;
  rackDisplayLine: string;
  locationFingerprint: string;
  priceMainLine: string;
  priceSubLine: string;
  listPriceAmount: number;
  listPriceCurrency: CurrencyCode;
  dealerPriceLine: string;
  corporatePriceLine: string;
  priceGroupLabel: string;
  displayStatus: StockDisplayStatus;
  reservedTotal: number;
  availableTotal: number;
  lastMovementLine: string;
  lastCountLine: string;
}

function formatMoney(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

function tierAmount(product: Product, slot: number): { amount: number; currency: CurrencyCode } | null {
  const tier = product.priceTiers.find((t) => t.slotNumber === slot && t.active && t.amount > 0);
  if (!tier) {
    return null;
  }
  return { amount: tier.amount, currency: tier.currency };
}

function pickListPrice(product: Product): { amount: number; currency: CurrencyCode; slotNo: number } | null {
  for (const slot of [1, 2, 3, 4, 5, 6] as const) {
    const t = tierAmount(product, slot);
    if (t) {
      return { ...t, slotNo: slot };
    }
  }
  return null;
}

function slotLabel(priceSlots: PriceSlotConfig[], slotNo: number): string {
  return priceSlots.find((s) => s.slotNumber === slotNo)?.slotName ?? `Slot ${slotNo}`;
}

function pickLocation(product: Product, warehouses: Warehouse[]) {
  const loc = product.locations[0];
  const centerWh = warehouses.find((w) => w.isCentral);
  if (!loc) {
    return {
      depotDisplayName: centerWh?.name ?? "Merkez depo",
      rackDisplayLine: "—",
      locationFingerprint: `${centerWh?.id ?? "none"}|default`
    };
  }
  const wh = warehouses.find((w) => w.id === loc.warehouseId);
  const rack = loc.rackNo?.trim() || loc.locationCode?.trim() || "—";
  return {
    depotDisplayName: wh?.name ?? "Depo",
    rackDisplayLine: rack,
    locationFingerprint: `${loc.warehouseId}|${rack}`
  };
}

export function computeStockDisplayStatus(
  product: Product,
  availability: ReturnType<typeof resolveProductAvailability>,
  critical: CriticalStockStatus
): StockDisplayStatus {
  if (!product.active) {
    return "blokeli";
  }
  if (critical === "critical") {
    return "kritik";
  }
  const { centerStockTotal } = availability;
  const lvl = product.criticalStockLevel;
  if (lvl > 0 && centerStockTotal > lvl && centerStockTotal <= lvl * 2) {
    return "tukeniyor";
  }
  return "saglikli";
}

export function computeStockDisplayStatusForFilter(product: Product, warehouses: Warehouse[]): StockDisplayStatus {
  const availability = resolveProductAvailability({ product, warehouses });
  const critical = detectCriticalStock(product, availability);
  return computeStockDisplayStatus(product, availability, critical);
}

export function mapProductToStockRow(params: {
  product: Product;
  brands: Brand[];
  factories: Factory[];
  warehouses: Warehouse[];
  priceSlots: PriceSlotConfig[];
  /** False when production API returns products without demo depo/marka/fabrika katalogu. */
  referenceCatalogLinked?: boolean;
}): StockRow {
  const { product, brands, factories, warehouses, priceSlots, referenceCatalogLinked = true } = params;
  const availability = resolveProductAvailability({ product, warehouses });
  const criticalStockStatus = detectCriticalStock(product, availability);
  const brandName = brands.find((b) => b.id === product.brandId)?.name ?? "—";
  const factoryName = product.factoryId ? (factories.find((f) => f.id === product.factoryId)?.name ?? "—") : "—";

  const categoryBits = product.categoryValues
    .map((c) => c.value)
    .filter(Boolean)
    .slice(0, 2);
  const categorySummary = categoryBits.join(" · ") || "—";
  const productSubline = [product.primaryBarcode || "—", categorySummary, brandName].join(" · ");

  const list = pickListPrice(product);
  const listPriceAmount = list?.amount ?? 0;
  const listPriceCurrency = list?.currency ?? "TRY";
  const priceMainLine = list ? formatMoney(list.amount, list.currency) : "—";
  const priceSubLine = list ? slotLabel(priceSlots, list.slotNo) : "Fiyat grubu";

  const t2 = tierAmount(product, 2);
  const t3 = tierAmount(product, 3);
  const dealerPriceLine = t2 ? `${slotLabel(priceSlots, 2)}: ${formatMoney(t2.amount, t2.currency)}` : "Bayi: —";
  const corporatePriceLine = t3 ? `${slotLabel(priceSlots, 3)}: ${formatMoney(t3.amount, t3.currency)}` : "Kurumsal: —";

  const { depotDisplayName, rackDisplayLine, locationFingerprint } = pickLocation(product, warehouses);

  const sync = product.factoryStockSummary;
  const syncHint =
    sync.lastSyncedAt != null
      ? `Güncellendi: ${new Date(sync.lastSyncedAt).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
      : sync.syncStatus === "synced"
        ? "Senkron"
        : sync.syncStatus === "stale"
          ? "Veri gecikmiş olabilir"
          : "Teyit bekleniyor";

  const factorySubline = `${factoryName} · ${syncHint}`;
  const centerDetailLine =
    product.criticalStockLevel > 0 ? `Eşik: ${product.criticalStockLevel}` : `Eşik: —`;

  const displayStatus = computeStockDisplayStatus(product, availability, criticalStockStatus);

  const priceGroupLabel =
    product.priceTiers
      .filter((t) => t.active && t.amount > 0)
      .map((t) => slotLabel(priceSlots, t.slotNumber))
      .slice(0, 2)
      .join(", ") || "—";

  return {
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    brandName,
    centerWarehouseStockTotal: availability.centerStockTotal,
    factoryStockTotal: availability.factoryStockTotal,
    criticalStockStatus,
    criticalLevel: product.criticalStockLevel,
    active: product.active,
    primaryBarcode: product.primaryBarcode || "—",
    qrCodeValue: product.qrCodeValue || "—",
    categorySummary,
    productSubline,
    centerDetailLine,
    factorySubline,
    factoryName,
    depotDisplayName,
    rackDisplayLine,
    locationFingerprint,
    priceMainLine,
    priceSubLine,
    listPriceAmount,
    listPriceCurrency,
    dealerPriceLine,
    corporatePriceLine,
    priceGroupLabel,
    displayStatus,
    reservedTotal: availability.reservedTotal,
    availableTotal: availability.availableTotal,
    lastMovementLine: referenceCatalogLinked ? "Son hareket: günlük senkron" : "Son hareket: —",
    lastCountLine: "Son sayım: —"
  };
}

