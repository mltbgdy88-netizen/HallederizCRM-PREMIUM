import { ApiClient, createHallederizSdk, type ApiClientOptions } from "@hallederiz/sdk";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const dataSourceConfig = {
  useDemoData: readBoolean(process.env.NEXT_PUBLIC_USE_DEMO_DATA, true),
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID ?? "tenant_1",
  userId: process.env.NEXT_PUBLIC_USER_ID ?? "user_admin",
  sessionToken: process.env.NEXT_PUBLIC_SESSION_TOKEN
};

let runtimeAccessToken: string | undefined = dataSourceConfig.sessionToken;

/** Live API oturum token'ını SDK isteklerine bağlar (cookie yedek kalır). */
export function setSdkAccessToken(token: string | null | undefined): void {
  runtimeAccessToken = token ?? undefined;
}

function buildSdkClientOptions(): ApiClientOptions {
  const base: ApiClientOptions = {
    baseUrl: dataSourceConfig.apiBaseUrl,
    resolveSessionToken: () => runtimeAccessToken
  };

  if (dataSourceConfig.useDemoData) {
    return {
      ...base,
      tenantId: dataSourceConfig.tenantId,
      userId: dataSourceConfig.userId,
      sessionToken: dataSourceConfig.sessionToken
    };
  }

  const explicitTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();
  const explicitUserId = process.env.NEXT_PUBLIC_USER_ID?.trim();
  return {
    ...base,
    ...(explicitTenantId ? { tenantId: explicitTenantId } : {}),
    ...(explicitUserId ? { userId: explicitUserId } : {}),
    ...(dataSourceConfig.sessionToken ? { sessionToken: dataSourceConfig.sessionToken } : {})
  };
}

const sdkClientOptions = buildSdkClientOptions();

export const sdk = createHallederizSdk(sdkClientOptions);

/** services/api mutation katmanı için merkezi istemci (tenant header oturumla uyumlu). */
export const apiClient = new ApiClient(sdkClientOptions);
