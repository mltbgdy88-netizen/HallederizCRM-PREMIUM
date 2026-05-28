import { resolveCustomerPriceSlot } from "../customers";
import type { CustomerPricingProfile, PriceSlotConfig, Product, ProductPriceTier } from "@hallederiz/types";

export interface ResolvedOfferPricing {
  slotNumber: ProductPriceTier["slotNumber"];
  slotName: string;
  amount: number;
  currency: ProductPriceTier["currency"];
  fallbackUsed: boolean;
  warning?: string;
}

function findFallbackTier(product: Product): ProductPriceTier | undefined {
  return product.priceTiers.find((tier) => tier.active) ?? product.priceTiers[0];
}

export function resolveOfferDefaultPricing(params: {
  product: Product;
  profile: CustomerPricingProfile;
  priceSlots: PriceSlotConfig[];
  overrideSlotNo?: ProductPriceTier["slotNumber"];
}): ResolvedOfferPricing | null {
  const { product, profile, priceSlots, overrideSlotNo } = params;
  const resolvedSlot = overrideSlotNo
    ? {
        slotNumber: overrideSlotNo,
        slotName: priceSlots.find((slot) => slot.slotNumber === overrideSlotNo)?.slotName ?? `Slot ${overrideSlotNo}`,
        active: true,
        fallbackUsed: false
      }
    : resolveCustomerPriceSlot({ profile, priceSlots });

  const tier = product.priceTiers.find((item) => item.slotNumber === resolvedSlot.slotNumber && item.active);
  if (tier) {
    return {
      slotNumber: resolvedSlot.slotNumber,
      slotName: resolvedSlot.slotName,
      amount: tier.amount,
      currency: tier.currency,
      fallbackUsed: resolvedSlot.fallbackUsed,
      warning: resolvedSlot.warning
    };
  }

  const fallbackTier = findFallbackTier(product);
  if (!fallbackTier) {
    return null;
  }

  const fallbackSlot = priceSlots.find((slot) => slot.slotNumber === fallbackTier.slotNumber);

  return {
    slotNumber: fallbackTier.slotNumber,
    slotName: fallbackSlot?.slotName ?? `Slot ${fallbackTier.slotNumber}`,
    amount: fallbackTier.amount,
    currency: fallbackTier.currency,
    fallbackUsed: true,
    warning: "Urunun secili fiyat slotunda aktif fiyat yok; guvenli fallback kullanildi."
  };
}
