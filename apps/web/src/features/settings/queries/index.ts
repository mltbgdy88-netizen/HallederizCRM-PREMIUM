import { defaultPlatformSettings, type PlatformSettings, type RolePresetItem, type User } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  getPilotReadinessApi,
  getPilotTemplateApi,
  getPlatformSettingsApi,
  listImportHistoryApi,
  listRolePresetsApi,
  listUsersApi,
  type PilotReadinessSummary
} from "../../../services/api";

export interface PilotSetupData {
  settings: PlatformSettings;
  rolePresets: RolePresetItem[];
  users: User[];
  pilotTemplate: Awaited<ReturnType<typeof getPilotTemplateApi>>;
}

export async function getPilotSetupData(): Promise<PilotSetupData> {
  if (dataSourceConfig.useDemoData) {
    return {
      settings: defaultPlatformSettings,
      rolePresets: defaultPlatformSettings.rolePresets,
      users: [],
      pilotTemplate: {
        tenantId: dataSourceConfig.tenantId,
        template: {
          key: "pilot-tenant-template",
          importPlaceholdersKey: "pilot-import-placeholders",
          companyFields: [
            "sirket_adi",
            "ticari_unvan",
            "vergi_dairesi",
            "vergi_numarasi",
            "mersis_no",
            "telefon",
            "eposta",
            "adres",
            "iban"
          ],
          importModules: ["cariler", "urunler", "stoklar", "fiyatlar", "depolar"],
          integrationChecks: ["erp", "fabrika", "whatsapp", "ai", "local_output"]
        }
      }
    };
  }

  const [settings, rolePresets, users, pilotTemplate, importHistory] = await Promise.all([
    getPlatformSettingsApi(),
    listRolePresetsApi(),
    listUsersApi(),
    getPilotTemplateApi(),
    listImportHistoryApi()
  ]);

  const importedTypes = new Set(
    importHistory.filter((item) => item.status === "applied" && item.successCount > 0).map((item) => item.type)
  );
  const enrichedSettings: PlatformSettings = {
    ...settings,
    pilotSetup: {
      ...settings.pilotSetup,
      checklist: settings.pilotSetup.checklist.map((item) => {
        if (item.id === "customers-import") return { ...item, completed: importedTypes.has("customers") };
        if (item.id === "products-import") return { ...item, completed: importedTypes.has("products") };
        if (item.id === "price-slots") return { ...item, completed: importedTypes.has("pricing") || item.completed };
        if (item.id === "warehouses") return { ...item, completed: importedTypes.has("warehouses") || item.completed };
        if (item.id === "stocks-import") return { ...item, completed: importedTypes.has("stock-locations") };
        return item;
      })
    }
  };

  return {
    settings: enrichedSettings,
    rolePresets,
    users,
    pilotTemplate
  };
}

export async function getPilotReadinessData(): Promise<PilotReadinessSummary> {
  if (dataSourceConfig.useDemoData) {
    return {
      completionRate: 42,
      completed: 5,
      warning: 4,
      missing: 3,
      total: 12,
      blockers: ["Cariler import edildi", "Urunler import edildi", "ERP baglanti hazirligi"],
      items: [
        {
          id: "company-profile",
          title: "Sirket profili",
          group: "company_tenant",
          status: "tamam",
          priority: "ready",
          readinessState: "ready",
          description: "Demo sirket profili hazir.",
          reason: "Temel alanlar doldurulmus.",
          actionLabel: "Ayarlari ac",
          actionHref: "/ayarlar",
          recommendedNextStep: "Pilot verilerine gore son guncellemeleri yapin.",
          blocking: false
        },
        {
          id: "import-customers",
          title: "Cariler import edildi",
          group: "data_import",
          status: "eksik",
          priority: "critical",
          readinessState: "go_live_blocker",
          description: "Demo modda import adimi bekleniyor.",
          reason: "Canliya yakin deneme icin cari importu gerekli.",
          actionLabel: "Veri yukleme merkezini ac",
          actionHref: "/kurulum/veri-yukleme",
          recommendedNextStep: "Cari import dosyasini yukleyip onizleme/apply tamamlayin.",
          blocking: true
        }
      ],
      onboardingCards: [
        {
          roleCode: "yonetici",
          roleName: "Yonetici",
          summary: "Genel pilot durumunu ve kritik eksikleri yonetir.",
          mustCheck: ["Kritik eksikler", "Servis health", "Onaylar"],
          firstScreens: [
            { label: "Pilot Hazirlik", href: "/ayarlar/pilot-hazirlik" },
            { label: "Staging Kontrol", href: "/ayarlar/staging-kontrol" }
          ],
          ownGaps: ["Cariler import edildi"]
        }
      ],
      integrationHealth: {
        status: "fallback",
        configuredCount: 0,
        liveCount: 0,
        fallbackCount: 5,
        disabledCount: 0,
        lastCheckedAt: new Date().toISOString(),
        services: [
          { service: "ai", status: "fallback", mode: "mock", configured: false, reason: "Demo fallback", lastCheckedAt: new Date().toISOString(), details: {} },
          { service: "whatsapp", status: "fallback", mode: "mock", configured: false, reason: "Demo fallback", lastCheckedAt: new Date().toISOString(), details: {} },
          { service: "erp", status: "fallback", mode: "mock", configured: false, reason: "Demo fallback", lastCheckedAt: new Date().toISOString(), details: {} },
          { service: "factory", status: "fallback", mode: "mock", configured: false, reason: "Demo fallback", lastCheckedAt: new Date().toISOString(), details: {} },
          { service: "local-agent", status: "fallback", mode: "mock", configured: false, reason: "Demo fallback", lastCheckedAt: new Date().toISOString(), details: {} }
        ]
      },
      consistencyWarnings: ["Demo modunda veri tutarliligi raporu sinirli gosterilir."],
      generatedAt: new Date().toISOString()
    };
  }

  return getPilotReadinessApi();
}
