export interface PilotTenantTemplate {
  key: "pilot-tenant-template";
  companyProfile: {
    companyName: string;
    legalName: string;
    taxOffice: string;
    taxNumber: string;
    mersisNo: string;
    phone: string;
    email: string;
    address: string;
    iban: string;
  };
  suggestedPriceSlots: string[];
  suggestedCategorySlots: string[];
  warehouseTemplate: Array<{
    code: string;
    name: string;
    warehouseType: "center" | "branch" | "transfer";
    isDefault: boolean;
  }>;
}

export const pilotTenantTemplate: PilotTenantTemplate = {
  key: "pilot-tenant-template",
  companyProfile: {
    companyName: "",
    legalName: "",
    taxOffice: "",
    taxNumber: "",
    mersisNo: "",
    phone: "",
    email: "",
    address: "",
    iban: ""
  },
  suggestedPriceSlots: ["Bayi", "Perakende", "Mimar", "Usta", "Proje", "Ihracat"],
  suggestedCategorySlots: ["Marka", "Koleksiyon", "Model / Grup", "Renk / Desen"],
  warehouseTemplate: [
    { code: "MERKEZ", name: "Merkez Depo", warehouseType: "center", isDefault: true },
    { code: "AVRUPA", name: "Avrupa Depo", warehouseType: "branch", isDefault: false },
    { code: "ANADOLU", name: "Anadolu Depo", warehouseType: "branch", isDefault: false }
  ]
};

export interface PilotImportPlaceholder {
  moduleKey:
    | "customers"
    | "products"
    | "stocks"
    | "prices"
    | "warehouses"
    | "erp"
    | "factories"
    | "whatsapp"
    | "ai"
    | "local-output";
  title: string;
  description: string;
}

export const pilotImportPlaceholders: PilotImportPlaceholder[] = [
  { moduleKey: "customers", title: "Cari Import", description: "CSV/Excel ile cari kartlari yukleme." },
  { moduleKey: "products", title: "Urun Import", description: "Urun, barkod ve kategori alanlarini yukleme." },
  { moduleKey: "stocks", title: "Stok Import", description: "Depo bazli stok bakiyelerini yukleme." },
  { moduleKey: "prices", title: "Fiyat Import", description: "Fiyat slot bazli urun fiyatlarini yukleme." },
  { moduleKey: "warehouses", title: "Depo Import", description: "Depo, raf ve lokasyon listesini yukleme." },
  { moduleKey: "erp", title: "ERP Baglanti Testi", description: "ERP baglantisi ve temel mapping kontrolu." },
  { moduleKey: "factories", title: "Fabrika Baglanti Testi", description: "Fabrika stok/siparis baglantisi kontrolu." },
  { moduleKey: "whatsapp", title: "WhatsApp Ayar Kontrolu", description: "Business numara ve webhook dogrulamasi." },
  { moduleKey: "ai", title: "AI Provider Kontrolu", description: "Provider/model/stt/tts konfig kontrolu." },
  { moduleKey: "local-output", title: "Yazdirma/Kayit Kontrolu", description: "Local agent, klasor ve yazici kontrolu." }
];

