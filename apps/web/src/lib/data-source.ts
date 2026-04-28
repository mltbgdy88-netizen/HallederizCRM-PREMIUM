import { createHallederizSdk } from "@hallederiz/sdk";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const dataSourceConfig = {
  useDemoData: readBoolean(process.env.NEXT_PUBLIC_USE_DEMO_DATA, true),
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID ?? "tenant_1",
  userId: process.env.NEXT_PUBLIC_USER_ID ?? "user_admin"
};

export const sdk = createHallederizSdk({
  baseUrl: dataSourceConfig.apiBaseUrl,
  tenantId: dataSourceConfig.tenantId,
  userId: dataSourceConfig.userId
});
