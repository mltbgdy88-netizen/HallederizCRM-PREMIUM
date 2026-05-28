import type { PlatformSettings } from "@hallederiz/types";
import { listImportHistory } from "../shared/import-history-store";
import {
  buildIntegrationsHealthSummary,
  validateAiConfig,
  validateErpConfig,
  validateFactoryConfig,
  validateLocalAgentConfig,
  validateWhatsAppConfig
} from "../shared/service-config";
import { listLocalOutputRules } from "../ai-local-output-store";

type PilotChecklistStatus = "tamam" | "eksik" | "uyari";
export type PilotReadinessPriority = "critical" | "warning" | "ready" | "info";
export type PilotReadinessState = "demo_gap" | "go_live_blocker" | "warning" | "ready";

export interface PilotReadinessItem {
  id: string;
  title: string;
  group:
    | "company_tenant"
    | "pricing_category_currency"
    | "warehouses_stock"
    | "users_roles"
    | "data_import"
    | "documents_print"
    | "integrations"
    | "ai_operations";
  status: PilotChecklistStatus;
  priority: PilotReadinessPriority;
  readinessState: PilotReadinessState;
  description: string;
  reason: string;
  actionLabel: string;
  actionHref: string;
  recommendedNextStep: string;
  blocking: boolean;
}

export interface PilotOnboardingCard {
  roleCode: "yonetici" | "satis" | "muhasebe" | "depo" | "pazarlama";
  roleName: string;
  summary: string;
  mustCheck: string[];
  firstScreens: Array<{ label: string; href: string }>;
  ownGaps: string[];
}

export interface PilotReadinessSummary {
  completionRate: number;
  completed: number;
  warning: number;
  missing: number;
  total: number;
  blockers: string[];
  items: PilotReadinessItem[];
  onboardingCards: PilotOnboardingCard[];
  integrationHealth: ReturnType<typeof buildIntegrationsHealthSummary>;
  consistencyWarnings: string[];
  generatedAt: string;
}

function isFilled(value: string | number | null | undefined): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(`${value ?? ""}`.trim());
}

function toPriority(status: PilotChecklistStatus, blocking = false): PilotReadinessPriority {
  if (blocking && status !== "tamam") return "critical";
  if (status === "eksik") return "warning";
  if (status === "uyari") return "warning";
  if (status === "tamam") return "ready";
  return "info";
}

function addItem(items: PilotReadinessItem[], item: Omit<PilotReadinessItem, "priority" | "readinessState"> & { priority?: PilotReadinessPriority; readinessState?: PilotReadinessState }) {
  const readinessState: PilotReadinessState = item.readinessState ??
    (
    item.status === "tamam"
      ? "ready"
      : item.blocking
        ? "go_live_blocker"
        : item.group === "data_import" || item.group === "documents_print"
          ? "demo_gap"
          : "warning"
    );
  items.push({
    ...item,
    priority: item.priority ?? toPriority(item.status, item.blocking),
    readinessState
  });
}

function findOpen(items: PilotReadinessItem[], ids: string[]): string[] {
  return items.filter((item) => ids.includes(item.id) && item.status !== "tamam").map((item) => item.title);
}

export function buildPilotReadiness(tenantId: string, settings: PlatformSettings): PilotReadinessSummary {
  const importHistory = listImportHistory(tenantId);
  const appliedByType = new Set(
    importHistory.filter((item) => item.status === "applied" && item.successCount > 0).map((item) => item.type)
  );

  const healthItems = [validateAiConfig(), validateWhatsAppConfig(), validateErpConfig(), validateFactoryConfig(), validateLocalAgentConfig()];
  const integrationHealth = buildIntegrationsHealthSummary(healthItems);
  const items: PilotReadinessItem[] = [];
  const consistencyWarnings: string[] = [];

  const companyReady =
    isFilled(settings.company.companyName) &&
    isFilled(settings.company.legalName) &&
    isFilled(settings.company.taxOffice) &&
    isFilled(settings.company.taxNumber) &&
    isFilled(settings.company.phone) &&
    isFilled(settings.company.email) &&
    isFilled(settings.company.address) &&
    isFilled(settings.company.iban);
  addItem(items, {
    id: "company-profile",
    title: "Sirket profili",
    group: "company_tenant",
    status: companyReady ? "tamam" : "eksik",
    description: "Sirket kimlik ve iletisim bilgileri pilotta zorunludur.",
    reason: companyReady ? "Sirket bilgileri pilot icin hazir." : "Sirket bilgileri eksik.",
    actionLabel: "Sirket ayarlarini ac",
    actionHref: "/ayarlar",
    recommendedNextStep: companyReady ? "Degisiklik varsa kaydedin." : "Vergi, IBAN ve iletisim alanlarini tamamlayin.",
    blocking: !companyReady
  });

  const activePriceSlots = settings.priceSlots.slots.filter((slot) => slot.active);
  const defaultPriceSlot = settings.priceSlots.slots.find((slot) => slot.slotNumber === settings.company.defaultPriceSlotNo);
  const priceSlotStatus: PilotChecklistStatus =
    activePriceSlots.length >= 4 && defaultPriceSlot?.active ? "tamam" : activePriceSlots.length > 0 ? "uyari" : "eksik";
  addItem(items, {
    id: "price-slots",
    title: "Fiyat slotlari",
    group: "pricing_category_currency",
    status: priceSlotStatus,
    description: "Satis ekiplerinin teklif/siparis acmasi icin fiyat slotlari aktif olmalidir.",
    reason:
      priceSlotStatus === "tamam"
        ? `${activePriceSlots.length} aktif fiyat slotu var.`
        : "Aktif slot sayisi veya varsayilan slot kontrol edilmeli.",
    actionLabel: "Fiyat slotlarini kontrol et",
    actionHref: "/ayarlar",
    recommendedNextStep: "Bayi/Perakende/Mimar gibi slot adlarini firma politikasina gore netlestirin.",
    blocking: priceSlotStatus === "eksik"
  });

  const activeCategorySlots = settings.categorySlots.slots.filter((slot) => slot.active);
  const categoryStatus: PilotChecklistStatus = activeCategorySlots.length >= 3 ? "tamam" : activeCategorySlots.length > 0 ? "uyari" : "eksik";
  addItem(items, {
    id: "category-slots",
    title: "Kategori alanlari",
    group: "pricing_category_currency",
    status: categoryStatus,
    description: "Urun filtreleme, raporlama ve import eslesmesi icin kategori slotlari kullanilir.",
    reason: categoryStatus === "tamam" ? `${activeCategorySlots.length} aktif kategori slotu var.` : "Kategori slotlari pilot ihtiyacina gore tamamlanmali.",
    actionLabel: "Kategori alanlarini ac",
    actionHref: "/ayarlar",
    recommendedNextStep: "Marka/Koleksiyon/Model-Renk yapisini operasyon ekibiyle netlestirin.",
    blocking: false
  });

  const activeWarehouses = settings.warehouses.filter((warehouse) => warehouse.active);
  const defaultWarehouse = settings.warehouses.find((warehouse) => warehouse.id === settings.company.defaultWarehouseId);
  const warehouseCodes = new Set(settings.warehouses.map((warehouse) => warehouse.code.trim().toLowerCase()));
  if (warehouseCodes.size !== settings.warehouses.length) {
    consistencyWarnings.push("Depo kodlarinda tekrar var.");
  }
  const warehouseStatus: PilotChecklistStatus =
    activeWarehouses.length >= 3 && defaultWarehouse?.active ? "tamam" : activeWarehouses.length > 0 ? "uyari" : "eksik";
  addItem(items, {
    id: "warehouses",
    title: "Depo kurulumu",
    group: "warehouses_stock",
    status: warehouseStatus,
    description: "Depo gorev ve teslimat akislarinin saglikli calismasi icin aktif depo seti gerekir.",
    reason: warehouseStatus === "tamam" ? `${activeWarehouses.length} aktif depo hazir.` : "Depo aktifligi veya varsayilan depo secimi eksik.",
    actionLabel: "Depolari duzenle",
    actionHref: "/ayarlar",
    recommendedNextStep: "Merkez depo varsayimini ve sube kodlarini dogrulayin.",
    blocking: warehouseStatus === "eksik"
  });

  const requiredRoleCodes = ["yonetici", "satis", "muhasebe", "depo", "pazarlama"];
  const availableRoleCodes = new Set(settings.rolePresets.map((role) => role.code));
  const missingRoles = requiredRoleCodes.filter((code) => !availableRoleCodes.has(code));
  addItem(items, {
    id: "roles-users",
    title: "Rol presetleri",
    group: "users_roles",
    status: missingRoles.length === 0 ? "tamam" : "uyari",
    description: "Rol seti tamam olursa personel onboarding daha hizli ilerler.",
    reason: missingRoles.length === 0 ? "Temel pilot roller hazir." : `Eksik roller: ${missingRoles.join(", ")}`,
    actionLabel: "Rolleri ac",
    actionHref: "/kullanicilar/roller",
    recommendedNextStep: "Pilot ekibi icin en az bir Yonetici + Satis + Depo kullanicisi acin.",
    blocking: false
  });

  const importChecks: Array<{ id: string; title: string; type: "customers" | "products" | "pricing" | "warehouses" | "stock-locations"; next: string }> = [
    { id: "import-customers", title: "Cariler import edildi", type: "customers", next: "Cari kodu ve fiyat grubu eslesmelerini kontrol edin." },
    { id: "import-products", title: "Urunler import edildi", type: "products", next: "Barkod ve kategori alanlarinda conflict raporunu gozden gecirin." },
    { id: "import-pricing", title: "Fiyatlar import edildi", type: "pricing", next: "Aktif slotlarda urun fiyatlarinin geldigini dogrulayin." },
    { id: "import-warehouses", title: "Depolar import edildi", type: "warehouses", next: "Depo kodlari ile varsayilan depo secimini eslestirin." },
    { id: "import-stock", title: "Stok/Lokasyon import edildi", type: "stock-locations", next: "Raf/lokasyon verisinin depo ekraninda gorundugunu teyit edin." }
  ];
  for (const check of importChecks) {
    const done = appliedByType.has(check.type);
    addItem(items, {
      id: check.id,
      title: check.title,
      group: "data_import",
      status: done ? "tamam" : "eksik",
      description: "Import merkezindeki onizleme + apply akisindan gelen durum.",
      reason: done ? "Import gecmisi olumlu." : "Bu veri tipi henuz import edilmedi.",
      actionLabel: "Veri yukleme merkezine git",
      actionHref: "/kurulum/veri-yukleme",
      recommendedNextStep: check.next,
      blocking: !done
    });
  }

  const serviceRouteMap: Record<string, string> = {
    ai: "/ayarlar/staging-kontrol",
    whatsapp: "/ayarlar/staging-kontrol",
    erp: "/ayarlar/staging-kontrol",
    factory: "/ayarlar/staging-kontrol",
    "local-agent": "/ayarlar/staging-kontrol"
  };
  for (const service of integrationHealth.services) {
    const status: PilotChecklistStatus =
      service.status === "healthy" ? "tamam" : service.status === "fallback" || service.status === "degraded" ? "uyari" : "eksik";
    addItem(items, {
      id: `service-${service.service}`,
      title: `${service.service.toUpperCase()} baglanti hazirligi`,
      group: service.service === "ai" ? "ai_operations" : "integrations",
      status,
      description: "Servis health ve config dogrulamasindan turetilen durum.",
      reason: service.reason,
      actionLabel: "Staging kontrolu ac",
      actionHref: serviceRouteMap[service.service] ?? "/ayarlar/staging-kontrol",
      recommendedNextStep: service.status === "healthy" ? "Baglanti testi periyodik olarak tekrar calistirin." : "Eksik env/config alanlarini tamamlayip tekrar test edin.",
      blocking: service.status === "misconfigured" || service.status === "error"
    });
  }

  const requiredDocumentTypes = [
    "offer_pdf",
    "order_pdf",
    "payment_receipt_pdf",
    "warehouse_note_pdf",
    "delivery_note_pdf",
    "dispatch_note_pdf",
    "invoice_pdf",
    "statement_pdf",
    "return_note_pdf"
  ];
  const ruleTypes = new Set(listLocalOutputRules().map((rule) => rule.documentType));
  const missingTemplateCoverage = requiredDocumentTypes.filter((type) => !ruleTypes.has(type as never));
  const documentStatus: PilotChecklistStatus =
    missingTemplateCoverage.length === 0 ? "tamam" : missingTemplateCoverage.length <= 3 ? "uyari" : "eksik";
  addItem(items, {
    id: "document-templates",
    title: "Belge ve cikti hazirligi",
    group: "documents_print",
    status: documentStatus,
    description: "Belge tiplerinin local save/print kurallari ile kapsanma durumu.",
    reason:
      missingTemplateCoverage.length === 0
        ? "Belge tipleri local output kurallariyla kapsaniyor."
        : `Eksik cikti kurali: ${missingTemplateCoverage.join(", ")}`,
    actionLabel: "Belge merkezini ac",
    actionHref: "/belgeler",
    recommendedNextStep: "Eksik belge tipleri icin yazdirma/kayit kurali tanimlayin.",
    blocking: documentStatus === "eksik"
  });

  if (!defaultPriceSlot?.active) {
    consistencyWarnings.push("Varsayilan fiyat slotu aktif degil.");
  }
  if (!defaultWarehouse?.active) {
    consistencyWarnings.push("Varsayilan depo aktif degil veya bulunamadi.");
  }
  if (activeCategorySlots.length === 0) {
    consistencyWarnings.push("Aktif kategori slotu yok.");
  }

  const completed = items.filter((item) => item.status === "tamam").length;
  const warning = items.filter((item) => item.status === "uyari").length;
  const missing = items.filter((item) => item.status === "eksik").length;
  const blockers = items.filter((item) => item.blocking && item.status !== "tamam").map((item) => item.title);
  const completionRate = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

  const onboardingCards: PilotOnboardingCard[] = [
    {
      roleCode: "yonetici",
      roleName: "Yonetici",
      summary: "Sistem genel saglik ve bloklayici eksikleri kapatir.",
      mustCheck: ["Kritik eksikler", "Onay bekleyenler", "Entegrasyon health"],
      firstScreens: [
        { label: "Gorev Merkezi", href: "/" },
        { label: "Pilot Hazirlik", href: "/ayarlar/pilot-hazirlik" },
        { label: "Staging Kontrol", href: "/ayarlar/staging-kontrol" },
        { label: "AI", href: "/ai" },
        { label: "Ayarlar", href: "/ayarlar" }
      ],
      ownGaps: findOpen(items, ["company-profile", "roles-users", "service-erp", "service-whatsapp", "service-ai"])
    },
    {
      roleCode: "satis",
      roleName: "Satis",
      summary: "Cari-fiyat-urun hazirligini dogrular, teklif/siparis akisina baslar.",
      mustCheck: ["Fiyat slotlari", "Cari import", "Urun ve fiyat import"],
      firstScreens: [
        { label: "Cariler", href: "/cariler" },
        { label: "Teklifler", href: "/teklifler" },
        { label: "Siparisler", href: "/siparisler" },
        { label: "WhatsApp", href: "/whatsapp" }
      ],
      ownGaps: findOpen(items, ["price-slots", "import-customers", "import-products", "import-pricing"])
    },
    {
      roleCode: "muhasebe",
      roleName: "Muhasebe",
      summary: "Tahsilat/fatura/belge akislarinin operasyona hazirligini kontrol eder.",
      mustCheck: ["Belge ve cikti", "Fiyatlar", "Cari verileri"],
      firstScreens: [
        { label: "Tahsilatlar", href: "/tahsilatlar" },
        { label: "Faturalar", href: "/faturalar" },
        { label: "Belgeler", href: "/belgeler" }
      ],
      ownGaps: findOpen(items, ["document-templates", "import-customers", "import-pricing"])
    },
    {
      roleCode: "depo",
      roleName: "Depo",
      summary: "Depo/stok/lokasyon verisinin sahada kullanima uygunlugunu dogrular.",
      mustCheck: ["Depo kurulumu", "Stok-lokasyon import", "Local output"],
      firstScreens: [
        { label: "Depo", href: "/depo" },
        { label: "Teslimatlar", href: "/teslimatlar" },
        { label: "Belgeler", href: "/belgeler" }
      ],
      ownGaps: findOpen(items, ["warehouses", "import-stock", "document-templates", "service-local-agent"])
    },
    {
      roleCode: "pazarlama",
      roleName: "Pazarlama",
      summary: "Iletisim kanallari ve analiz ekranlarinin pilotta kullanima hazirligini izler.",
      mustCheck: ["WhatsApp baglantisi", "AI baglantisi", "Rapor ve belge erisimi"],
      firstScreens: [
        { label: "Belgeler", href: "/belgeler" },
        { label: "Raporlar", href: "/raporlar" },
        { label: "WhatsApp", href: "/whatsapp" },
        { label: "AI", href: "/ai" }
      ],
      ownGaps: findOpen(items, ["service-whatsapp", "service-ai", "document-templates"])
    }
  ];

  return {
    completionRate,
    completed,
    warning,
    missing,
    total: items.length,
    blockers,
    items,
    onboardingCards,
    integrationHealth,
    consistencyWarnings,
    generatedAt: new Date().toISOString()
  };
}
