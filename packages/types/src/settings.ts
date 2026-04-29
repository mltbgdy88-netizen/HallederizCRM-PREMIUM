import type { TenantModuleCode } from "./tenant";
import type { CategorySlotConfig, PriceSlotConfig } from "./product-stock-pricing";

export type ThemeMode = "light" | "dark" | "system";

export interface CompanySettings {
  companyName: string;
  legalName: string;
  tradeName: string;
  taxOffice: string;
  taxNumber: string;
  mersisNo: string;
  phone: string;
  email: string;
  address: string;
  defaultCurrency: string;
  iban: string;
  accountingYearStart: string;
  defaultDueDay: number;
  defaultVatRate: number;
  defaultDeliveryMethod: string;
  defaultWarehouseId: string;
  defaultPriceSlotNo: 1 | 2 | 3 | 4 | 5 | 6;
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
  pricingRateMode?: "mb_satis" | "mb_satis_ek_kur";
  roundingType?: "matematiksel" | "yukari" | "asagi";
  spreadFixedAmount?: number;
  lastUpdatedAt?: string;
  sourceLabel?: string;
}

export interface PriceSlotSettings {
  slots: PriceSlotConfig[];
}

export interface CategorySlotSettings {
  slots: CategorySlotConfig[];
}

export type WarehouseType = "center" | "branch" | "transfer";

export interface WarehouseSetupItem {
  id: string;
  code: string;
  name: string;
  warehouseType: WarehouseType;
  active: boolean;
  sortOrder: number;
  isDefault: boolean;
}

export interface RolePresetItem {
  id: string;
  code: string;
  name: string;
  description: string;
  moduleAccess: string[];
  approvalEnabled: boolean;
}

export interface PilotSetupChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  note?: string;
}

export interface PilotSetupState {
  templateName: string;
  importReady: boolean;
  checklist: PilotSetupChecklistItem[];
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
  warehouses: WarehouseSetupItem[];
  rolePresets: RolePresetItem[];
  pilotSetup: PilotSetupState;
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
    companyName: "Hallederiz",
    legalName: "Hallederiz A.S.",
    tradeName: "Hallederiz",
    taxOffice: "Kadikoy",
    taxNumber: "0000000000",
    mersisNo: "0000000000000000",
    phone: "+90 216 555 00 00",
    email: "info@hallederiz.com",
    address: "Istanbul / Turkiye",
    defaultCurrency: "TRY",
    iban: "TR000000000000000000000000",
    accountingYearStart: "2026-01-01",
    defaultDueDay: 30,
    defaultVatRate: 20,
    defaultDeliveryMethod: "Kendi Aracimiz",
    defaultWarehouseId: "wh_1",
    defaultPriceSlotNo: 1,
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
    additionalSpreadPercent: 0,
    pricingRateMode: "mb_satis",
    roundingType: "matematiksel",
    spreadFixedAmount: 0,
    lastUpdatedAt: new Date().toISOString(),
    sourceLabel: "Merkez Bankasi"
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
  warehouses: [
    {
      id: "wh_1",
      code: "MERKEZ",
      name: "Merkez Depo",
      warehouseType: "center",
      active: true,
      sortOrder: 1,
      isDefault: true
    },
    {
      id: "wh_2",
      code: "AVRUPA",
      name: "Avrupa Depo",
      warehouseType: "branch",
      active: true,
      sortOrder: 2,
      isDefault: false
    },
    {
      id: "wh_3",
      code: "ANADOLU",
      name: "Anadolu Depo",
      warehouseType: "branch",
      active: true,
      sortOrder: 3,
      isDefault: false
    }
  ],
  rolePresets: [
    {
      id: "role_preset_1",
      code: "yonetici",
      name: "Yonetici",
      description: "Tum modullere yonetsel erisim.",
      moduleAccess: ["cariler", "stok", "teklifler", "siparisler", "tahsilatlar", "depo", "teslimatlar", "faturalar", "erp", "ai", "ayarlar"],
      approvalEnabled: true
    },
    {
      id: "role_preset_2",
      code: "satis",
      name: "Satis",
      description: "Musteri, teklif ve siparis odakli rol.",
      moduleAccess: ["cariler", "teklifler", "siparisler", "belgeler", "whatsapp"],
      approvalEnabled: false
    },
    {
      id: "role_preset_3",
      code: "muhasebe",
      name: "Muhasebe",
      description: "Tahsilat, fatura ve ekstre islemleri.",
      moduleAccess: ["cariler", "tahsilatlar", "faturalar", "raporlar", "belgeler"],
      approvalEnabled: true
    },
    {
      id: "role_preset_4",
      code: "depo",
      name: "Depo",
      description: "Depo gorev, hazirlik ve teslim koordinasyonu.",
      moduleAccess: ["stok", "depo", "teslimatlar", "fabrikalar"],
      approvalEnabled: false
    },
    {
      id: "role_preset_5",
      code: "pazarlama",
      name: "Pazarlama",
      description: "Kampanya ve musteri kazanimi odakli rol.",
      moduleAccess: ["cariler", "raporlar", "whatsapp", "ai"],
      approvalEnabled: false
    }
  ],
  pilotSetup: {
    templateName: "pilot-tenant-template",
    importReady: false,
    checklist: [
      { id: "company", title: "Sirket bilgileri", completed: false },
      { id: "warehouses", title: "Depo tanimlari", completed: false },
      { id: "price-slots", title: "Fiyat slotlari", completed: false },
      { id: "category-slots", title: "Kategori slotlari", completed: false },
      { id: "customers-import", title: "Cari import", completed: false },
      { id: "products-import", title: "Urun import", completed: false },
      { id: "stocks-import", title: "Stok import", completed: false },
      { id: "erp-test", title: "ERP baglanti testi", completed: false },
      { id: "factory-test", title: "Fabrika baglanti testi", completed: false },
      { id: "whatsapp-check", title: "WhatsApp business kontrolu", completed: false },
      { id: "ai-check", title: "AI provider kontrolu", completed: false },
      { id: "print-check", title: "Yazdirma/kayit kontrolu", completed: false },
      { id: "users-roles", title: "Kullanici ve rol kurulumu", completed: false }
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
