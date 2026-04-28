import type { TenantContext } from "@hallederiz/types";

export interface HallederizSdkOptions {
  baseUrl: string;
  tenant: TenantContext;
}

export class HallederizSdk {
  constructor(private readonly options: HallederizSdkOptions) {}

  async health(): Promise<unknown> {
    // TODO: Add auth headers, retry policies, and typed response contracts.
    const response = await fetch(`${this.options.baseUrl}/health`, {
      headers: {
        "x-tenant-id": this.options.tenant.tenantId
      }
    });

    return response.json();
  }
}
