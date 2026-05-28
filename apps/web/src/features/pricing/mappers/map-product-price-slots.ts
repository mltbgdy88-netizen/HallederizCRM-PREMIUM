import type { PriceSlotConfig, ProductPriceTier } from "@hallederiz/types";
import type { PriceRowViewModel } from "../schemas/pricing-schema";

export function mapProductPriceSlots(params: {
  slotConfigs: PriceSlotConfig[];
  productTiers: ProductPriceTier[];
}): PriceRowViewModel[] {
  const { slotConfigs, productTiers } = params;

  return slotConfigs.map((slot) => {
    const tier = productTiers.find((item) => item.slotNumber === slot.slotNumber);
    return {
      slotNumber: slot.slotNumber,
      slotName: slot.slotName,
      currency: tier?.currency ?? slot.currency,
      amount: tier?.amount ?? slot.amount,
      active: tier?.active ?? slot.active
    };
  });
}
