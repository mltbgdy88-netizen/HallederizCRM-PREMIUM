import type { CurrencyCode, PriceSlotConfig, ProductPriceTier } from "@hallederiz/types";

export interface PriceRowViewModel {
  slotNumber: number;
  slotName: string;
  currency: CurrencyCode;
  amount: number;
  active: boolean;
}

export interface PricingConfigPayload {
  slots: PriceSlotConfig[];
}

export interface ProductPricingPayload {
  tiers: ProductPriceTier[];
}
