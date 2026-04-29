import type { PlatformSettings } from "@hallederiz/types";
import { defaultPlatformSettings } from "@hallederiz/types";
import { mockSettings } from "./mock-data";

let tenantSettingsState: PlatformSettings = {
  ...defaultPlatformSettings,
  ...mockSettings
};

export function getTenantSettingsState(): PlatformSettings {
  return tenantSettingsState;
}

export function setTenantSettingsState(next: PlatformSettings) {
  tenantSettingsState = next;
}
