import type { PlatformSettings, RolePresetItem, User } from "@hallederiz/types";
import { sdk } from "../../lib/data-source";

export async function getPlatformSettingsApi(): Promise<PlatformSettings> {
  const response = await sdk.platform.getSettings();
  return response.data;
}

export async function patchPlatformSettingsApi(payload: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const response = await sdk.platform.patchSettings(payload);
  return response.item;
}

export async function getPilotTemplateApi() {
  return sdk.platform.getPilotTemplate();
}

export async function listUsersApi(): Promise<User[]> {
  const response = await sdk.platform.listUsers();
  return response.items;
}

export async function createUserApi(payload: Partial<User> & { roleCode?: string }): Promise<User> {
  const response = await sdk.platform.createUser(payload);
  return response.item;
}

export async function listRolePresetsApi(): Promise<RolePresetItem[]> {
  const response = await sdk.platform.listRolePresets();
  return response.items;
}

