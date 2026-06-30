import { apiClient, dataSourceConfig } from "../../lib/data-source";

export interface ServiceHealthRecord {
  service: string;
  status: "healthy" | "degraded" | "fallback" | "disabled" | "misconfigured" | "error";
  mode: "live" | "fallback" | "disabled" | "mock";
  configured: boolean;
  reason: string;
  lastCheckedAt: string;
  details: Record<string, unknown>;
}

export interface IntegrationsHealthSummary {
  status: ServiceHealthRecord["status"];
  configuredCount: number;
  liveCount: number;
  fallbackCount: number;
  disabledCount: number;
  lastCheckedAt: string;
  services: ServiceHealthRecord[];
}

function demoHealth(service: string): ServiceHealthRecord {
  return {
    service,
    status: "fallback",
    mode: "mock",
    configured: false,
    reason: "Demo modunda canli baglanti testi yapilmaz.",
    lastCheckedAt: new Date().toISOString(),
    details: { demo: true }
  };
}

export async function getAiHealthApi() {
  if (dataSourceConfig.useDemoData) return demoHealth("ai");
  const response = await apiClient.get<{ item: ServiceHealthRecord }>("/health/ai");
  return response.item;
}

export async function getWhatsAppHealthApi() {
  if (dataSourceConfig.useDemoData) return demoHealth("whatsapp");
  const response = await apiClient.get<{ item: ServiceHealthRecord }>("/health/whatsapp");
  return response.item;
}

export async function getErpHealthApi() {
  if (dataSourceConfig.useDemoData) return demoHealth("erp");
  const response = await apiClient.get<{ item: ServiceHealthRecord }>("/health/erp");
  return response.item;
}

export async function getFactoryHealthApi() {
  if (dataSourceConfig.useDemoData) return demoHealth("factory");
  const response = await apiClient.get<{ item: ServiceHealthRecord }>("/health/factory");
  return response.item;
}

export async function getLocalAgentHealthApi() {
  if (dataSourceConfig.useDemoData) return demoHealth("local-agent");
  const response = await apiClient.get<{ item: ServiceHealthRecord }>("/health/local-agent");
  return response.item;
}

export async function getIntegrationHealthSummaryApi() {
  if (dataSourceConfig.useDemoData) {
    const services = ["ai", "whatsapp", "erp", "factory", "local-agent"].map(demoHealth);
    return {
      status: "fallback",
      configuredCount: 0,
      liveCount: 0,
      fallbackCount: services.length,
      disabledCount: 0,
      lastCheckedAt: new Date().toISOString(),
      services
    } satisfies IntegrationsHealthSummary;
  }
  const response = await apiClient.get<{ item: IntegrationsHealthSummary }>("/health/integrations");
  return response.item;
}

export async function runAiTestChatApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/ai/test-chat", {});
  return response.item;
}

export async function runAiTestSttApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/ai/test-stt", {});
  return response.item;
}

export async function runAiTestTtsApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/ai/test-tts", {});
  return response.item;
}

export async function runWhatsAppTestSendApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/whatsapp/test-send", {});
  return response.item;
}

export async function runErpTestApi(connectionId = "erp_conn_1") {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/erp/test", { connectionId });
  return response.item;
}

export async function runFactoryTestSyncApi(factoryId = "factory_1") {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/factory/test-sync", { factoryId });
  return response.item;
}

export async function runLocalAgentSaveDryRunApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/local-agent/test-save-dry-run", {});
  return response.item;
}

export async function runLocalAgentPrintDryRunApi() {
  const response = await apiClient.post<{ item: Record<string, unknown> }>("/health/local-agent/test-print-dry-run", {});
  return response.item;
}
