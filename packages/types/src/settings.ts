import type { TenantModuleCode } from "./tenant";
import type { CategorySlotConfig, PriceSlotConfig } from "./product-stock-pricing";

export type ThemeMode = "light" | "dark" | "system";

export interface CompanySettings {
  legalName: string;
  tradeName: string;
  taxNumber: string;
  defaultCurrency: string;
  countryCode: string;
}

export interface ThemeSettings {
  defaultMode: ThemeMode;
  allowUserOverride: boolean;
  compactDensity: boolean;
}

export interface ExchangeRateSettings {
  baseCurrency: string;
  provider: "manual" | "api";
  autoUpdateEnabled: boolean;
  updateIntervalMinutes: number;
  additionalSpreadPercent?: number;
}

export interface PriceSlotSettings {
  slots: PriceSlotConfig[];
}

export interface CategorySlotSettings {
  slots: CategorySlotConfig[];
}

export interface WhatsAppSettings {
  enabled: boolean;
  provider: "meta" | "twilio" | "custom";
  defaultSenderName: string;
  approvalRequired: boolean;
}

export interface AiSettings {
  enabled: boolean;
  localInferenceEnabled: boolean;
  humanApprovalRequired: boolean;
  defaultModel: string;
}

export interface ErpSettings {
  enabled: boolean;
  provider: "none" | "netsis" | "sap" | "custom";
  syncIntervalMinutes: number;
}

export interface PrintSaveSettings {
  defaultPrintTemplate: string;
  autoPdfArchiveEnabled: boolean;
  storageProvider: "local" | "s3" | "custom";
}

export interface PlatformSettings {
  company: CompanySettings;
  theme: ThemeSettings;
  exchangeRate: ExchangeRateSettings;
  priceSlots: PriceSlotSettings;
  categorySlots: CategorySlotSettings;
  whatsapp: WhatsAppSettings;
  ai: AiSettings;
  erp: ErpSettings;
  printSave: PrintSaveSettings;
}

export interface SettingsSchemaField {
  key: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
}

export type SettingsSchema = Record<TenantModuleCode | "platform", SettingsSchemaField[]>;

export const platformSettingsSchema: SettingsSchema = {
  platform: [
    { key: "company", type: "object", required: true },
    { key: "theme", type: "object", required: true },
    { key: "exchangeRate", type: "object", required: true },
    { key: "priceSlots", type: "object", required: true },
    { key: "categorySlots", type: "object", required: true },
    { key: "printSave", type: "object", required: true }
  ],
  core: [],
  users: [],
  settings: [],
  whatsapp: [{ key: "whatsapp", type: "object", required: false }],
  ai: [{ key: "ai", type: "object", required: false }],
  erp: [{ key: "erp", type: "object", required: false }],
  reporting: []
};

export const defaultPlatformSettings: PlatformSettings = {
  company: {
    legalName: "Hallederiz A.S.",
    tradeName: "Hallederiz",
    taxNumber: "0000000000",
    defaultCurrency: "TRY",
    countryCode: "TR"
  },
  theme: {
    defaultMode: "light",
    allowUserOverride: true,
    compactDensity: false
  },
  exchangeRate: {
    baseCurrency: "TRY",
    provider: "manual",
    autoUpdateEnabled: false,
    updateIntervalMinutes: 60,
    additionalSpreadPercent: 0
  },
  priceSlots: {
    slots: [
      { slotNumber: 1, slotName: "Fiyat 1", currency: "TRY", amount: 0, active: true },
      { slotNumber: 2, slotName: "Fiyat 2", currency: "TRY", amount: 0, active: true },
      { slotNumber: 3, slotName: "Fiyat 3", currency: "TRY", amount: 0, active: true },
      { slotNumber: 4, slotName: "Fiyat 4", currency: "TRY", amount: 0, active: true },
      { slotNumber: 5, slotName: "Fiyat 5", currency: "TRY", amount: 0, active: false },
      { slotNumber: 6, slotName: "Fiyat 6", currency: "TRY", amount: 0, active: false }
    ]
  },
  categorySlots: {
    slots: [
      { slotNumber: 1, slotName: "Kategori 1", active: true },
      { slotNumber: 2, slotName: "Kategori 2", active: true },
      { slotNumber: 3, slotName: "Kategori 3", active: true },
      { slotNumber: 4, slotName: "Kategori 4", active: true }
    ]
  },
  whatsapp: {
    enabled: false,
    provider: "meta",
    defaultSenderName: "",
    approvalRequired: true
  },
  ai: {
    enabled: false,
    localInferenceEnabled: true,
    humanApprovalRequired: true,
    defaultModel: "local-default"
  },
  erp: {
    enabled: false,
    provider: "none",
    syncIntervalMinutes: 30
  },
  printSave: {
    defaultPrintTemplate: "default-a4",
    autoPdfArchiveEnabled: false,
    storageProvider: "local"
  }
};
