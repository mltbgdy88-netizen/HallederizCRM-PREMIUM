"use client";

import { useMemo } from "react";
import type { PriceSlotConfig, ProductPriceTier } from "@hallederiz/types";
import { mapProductPriceSlots } from "../mappers/map-product-price-slots";

export function usePricingPreview(slotConfigs: PriceSlotConfig[], productTiers: ProductPriceTier[]) {
  return useMemo(
    () =>
      mapProductPriceSlots({
        slotConfigs,
        productTiers
      }),
    [slotConfigs, productTiers]
  );
}
