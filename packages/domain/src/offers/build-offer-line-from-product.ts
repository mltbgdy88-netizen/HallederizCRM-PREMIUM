import { resolveProductAvailability } from "../stock";
import { resolveOfferDefaultPricing } from "./resolve-offer-default-pricing";
import type {
  CustomerPricingProfile,
  OfferLine,
  OfferId,
  PriceSlotConfig,
  PriceSlotNumber,
  Product,
  Warehouse
} from "@hallederiz/types";

export function buildOfferLineFromProduct(params: {
  lineId: string;
  offerId: OfferId;
  product: Product;
  profile: CustomerPricingProfile;
  priceSlots: PriceSlotConfig[];
  warehouses: Warehouse[];
  quantity: number;
  discountPercent?: number;
  overrideSlotNo?: PriceSlotNumber;
}): OfferLine {
  const { lineId, offerId, product, profile, priceSlots, warehouses, quantity, discountPercent = 0, overrideSlotNo } = params;
  const pricing = resolveOfferDefaultPricing({ product, profile, priceSlots, overrideSlotNo });
  const availability = resolveProductAvailability({ product, warehouses });

  if (!pricing) {
    throw new Error(`Urun icin fiyat bulunamadi: ${product.code}`);
  }

  const grossLineTotal = pricing.amount * quantity;
  const discountAmount = grossLineTotal * (discountPercent / 100);

  return {
    id: lineId,
    offerId,
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    quantity,
    priceSlotNo: pricing.slotNumber,
    priceSlotLabelSnapshot: pricing.slotName,
    unitPrice: pricing.amount,
    currency: pricing.currency,
    exchangeRate: pricing.currency === "TRY" ? 1 : 0,
    discountPercent,
    lineTotal: Math.max(grossLineTotal - discountAmount, 0),
    sourcePreference: product.defaultSource,
    centerStockSnapshot: availability.centerStockTotal,
    factoryStockSnapshot: availability.factoryStockTotal,
    priceOverride: Boolean(overrideSlotNo && overrideSlotNo !== (profile.selectedPriceSlotNo ?? profile.assignedPriceSlot)),
    pricingWarning: pricing.warning
  };
}
