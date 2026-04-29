import { defaultPlatformSettings, type PlatformSettings, type RolePresetItem, type User } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { getPilotTemplateApi, getPlatformSettingsApi, listImportHistoryApi, listRolePresetsApi, listUsersApi } from "../../../services/api";

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

  const importedTypes = new Set(importHistory.filter((item) => item.status === "applied").map((item) => item.type));
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

