import type { CustomerPricingProfile, PriceSlotConfig, PriceSlotNumber } from "@hallederiz/types";

export interface ResolvedCustomerPriceSlot {
  slotNumber: PriceSlotNumber;
  slotName: string;
  active: boolean;
  fallbackUsed: boolean;
  warning?: string;
}

export function resolveCustomerPriceSlot(params: {
  profile?: CustomerPricingProfile | null;
  priceSlots: PriceSlotConfig[];
}): ResolvedCustomerPriceSlot {
  const { profile, priceSlots } = params;
  const selectedSlotNo = profile?.selectedPriceSlotNo ?? profile?.assignedPriceSlot ?? 1;
  const selectedSlot = priceSlots.find((slot) => slot.slotNumber === selectedSlotNo && slot.active);

  if (selectedSlot) {
    return {
      slotNumber: selectedSlot.slotNumber,
      slotName: selectedSlot.slotName,
      active: selectedSlot.active,
      fallbackUsed: false
    };
  }

  const fallback = priceSlots.find((slot) => slot.active) ?? priceSlots[0];
  if (!fallback) {
    return {
      slotNumber: 1,
      slotName: "Slot 1",
      active: false,
      fallbackUsed: true,
      warning: "Aktif fiyat slotu bulunamadi."
    };
  }

  return {
    slotNumber: fallback.slotNumber,
    slotName: fallback.slotName,
    active: fallback.active,
    fallbackUsed: true,
    warning: "Cari fiyat grubu pasif veya bulunamadi; guvenli fallback kullanildi."
  };
}
