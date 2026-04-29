import type { PlatformSettings, User } from "@hallederiz/types";
import { defaultPlatformSettings } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { createUserApi, patchPlatformSettingsApi } from "../../../services/api";

export async function savePlatformSettings(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
  if (dataSourceConfig.useDemoData) {
    return {
      ...defaultPlatformSettings,
      ...patch,
      company: {
        ...defaultPlatformSettings.company,
        ...(patch.company ?? {})
      },
      exchangeRate: {
        ...defaultPlatformSettings.exchangeRate,
        ...(patch.exchangeRate ?? {})
      },
      priceSlots: {
        ...defaultPlatformSettings.priceSlots,
        ...(patch.priceSlots ?? {})
      },
      categorySlots: {
        ...defaultPlatformSettings.categorySlots,
        ...(patch.categorySlots ?? {})
      },
      pilotSetup: {
        ...defaultPlatformSettings.pilotSetup,
        ...(patch.pilotSetup ?? {})
      }
    };
  }
  return patchPlatformSettingsApi(patch);
}

export async function quickCreateUser(payload: Partial<User> & { roleCode?: string }): Promise<User> {
  if (dataSourceConfig.useDemoData) {
    return {
      id: `demo-user-${Date.now()}`,
      tenantId: dataSourceConfig.tenantId,
      email: payload.email ?? "demo@hallederiz.local",
      fullName: payload.fullName ?? "Demo Kullanici",
      status: payload.status ?? "active",
      title: payload.title,
      directPermissions: payload.directPermissions ?? [],
      lastLoginAt: payload.lastLoginAt
    };
  }

  return createUserApi(payload);
}

