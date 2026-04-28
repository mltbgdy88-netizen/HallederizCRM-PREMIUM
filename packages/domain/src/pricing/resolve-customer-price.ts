import type {
  CustomerPricingProfile,
  PriceSlotNumber,
  PriceSlotConfig,
  Product,
  ProductPriceTier
} from "@hallederiz/types";

export interface ResolvedCustomerPrice {
  slotNumber: PriceSlotNumber;
  slotName: string;
  amount: number;
  currency: ProductPriceTier["currency"];
  source: "product_tier" | "slot_default";
}

function getActiveTierBySlot(product: Product, slotNumber: number): ProductPriceTier | undefined {
  return product.priceTiers.find((tier) => tier.slotNumber === slotNumber && tier.active);
}

function getDefaultActiveTier(product: Product): ProductPriceTier | undefined {
  return product.priceTiers.find((tier) => tier.active);
}

function getProfileSlot(profile: CustomerPricingProfile): PriceSlotNumber {
  return profile.selectedPriceSlotNo ?? profile.assignedPriceSlot ?? 1;
}

export function resolveCustomerPrice(params: {
  product: Product;
  profile: CustomerPricingProfile;
  slotConfigs: PriceSlotConfig[];
}): ResolvedCustomerPrice | null {
  const { product, profile, slotConfigs } = params;
  const assignedSlot = slotConfigs.find((slot) => slot.slotNumber === getProfileSlot(profile) && slot.active);
  const selectedTier = assignedSlot
    ? getActiveTierBySlot(product, assignedSlot.slotNumber)
    : getDefaultActiveTier(product);

  if (assignedSlot && selectedTier) {
    return {
      slotNumber: assignedSlot.slotNumber,
      slotName: assignedSlot.slotName,
      amount: selectedTier.amount,
      currency: selectedTier.currency,
      source: "product_tier"
    };
  }

  if (!assignedSlot) {
    const fallbackTier = getDefaultActiveTier(product);
    if (!fallbackTier) {
      return null;
    }

    const fallbackSlot = slotConfigs.find((slot) => slot.slotNumber === fallbackTier.slotNumber) ?? {
      slotNumber: fallbackTier.slotNumber,
      slotName: `Slot ${fallbackTier.slotNumber}`,
      currency: fallbackTier.currency,
      amount: fallbackTier.amount,
      active: fallbackTier.active
    };

    return {
      slotNumber: fallbackTier.slotNumber,
      slotName: fallbackSlot.slotName,
      amount: fallbackTier.amount,
      currency: fallbackTier.currency,
      source: "product_tier"
    };
  }

  return {
    slotNumber: assignedSlot.slotNumber,
    slotName: assignedSlot.slotName,
    amount: assignedSlot.amount,
    currency: assignedSlot.currency,
    source: "slot_default"
  };
}
