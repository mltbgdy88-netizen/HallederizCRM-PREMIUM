import type { PlatformSettings, RolePresetItem, User } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class PlatformClient {
  constructor(private readonly api: ApiClient) {}

  getSettings() {
    return this.api.get<{ schema: unknown; data: PlatformSettings }>("/settings");
  }

  patchSettings(payload: Partial<PlatformSettings>) {
    return this.api.patch<ItemResponse<PlatformSettings>>("/settings", payload);
  }

  getPilotTemplate() {
    return this.api.get<{
      tenantId: string;
      template: {
        key: string;
        importPlaceholdersKey: string;
        companyFields: string[];
        importModules: string[];
        integrationChecks: string[];
      };
    }>("/settings/pilot-template");
  }

  listUsers() {
    return this.api.get<ListResponse<User>>("/users");
  }

  createUser(payload: Partial<User> & { roleCode?: string }) {
    return this.api.post<ItemResponse<User>>("/users", payload);
  }

  listRolePresets() {
    return this.api.get<ListResponse<RolePresetItem>>("/roles/presets");
  }
}

