import type { CategorySlotConfig, ExchangeRate, ExchangeRatePolicy, PriceSlotConfig } from "@hallederiz/types";

export const demoTenantId = "tenant_1";
export const demoUserId = "user_1";
export const demoNow = "2026-04-28T12:00:00.000Z";

export const demoPriceSlots: PriceSlotConfig[] = [
  { slotNumber: 1, slotName: "Perakende", currency: "TRY", amount: 0, active: true },
  { slotNumber: 2, slotName: "Proje", currency: "TRY", amount: 0, active: true },
  { slotNumber: 3, slotName: "Mimar", currency: "TRY", amount: 0, active: true },
  { slotNumber: 4, slotName: "Bayi", currency: "TRY", amount: 0, active: true },
  { slotNumber: 5, slotName: "Kampanya", currency: "USD", amount: 0, active: false },
  { slotNumber: 6, slotName: "Ihracat", currency: "EUR", amount: 0, active: false }
];

export const demoCategorySlots: CategorySlotConfig[] = [
  { slotNumber: 1, slotName: "Doku", active: true },
  { slotNumber: 2, slotName: "Desen", active: true },
  { slotNumber: 3, slotName: "Renk", active: true },
  { slotNumber: 4, slotName: "Tema", active: true }
];

export const demoExchangeRates: ExchangeRate[] = [
  { currency: "USD", buyingRate: 38.2, sellingRate: 38.45, fetchedAt: "2026-04-28T09:20:00.000Z", source: "tcmb" },
  { currency: "EUR", buyingRate: 41.3, sellingRate: 41.6, fetchedAt: "2026-04-28T09:20:00.000Z", source: "tcmb" }
];

export const demoExchangeRatePolicy: ExchangeRatePolicy = {
  baseCurrency: "TRY",
  useSellingRateForOrder: true,
  additionalSpreadPercent: 0.5,
  roundingPrecision: 2,
  snapshotOnOrder: true
};

