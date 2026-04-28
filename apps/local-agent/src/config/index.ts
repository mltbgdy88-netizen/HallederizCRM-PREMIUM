import type { LocalOutputRule } from "@hallederiz/types";

export interface LocalAgentSettings {
  rootOutputFolder: string;
  autoPrintEnabled: boolean;
  safeMode: boolean;
  documentFolders: Record<string, string>;
  printerMapping: Record<string, string>;
  copies: number;
  apiBaseUrl: string;
  tenantId: string;
  userId: string;
  sessionToken?: string;
  pollIntervalMs: number;
}

export function loadSettings(): LocalAgentSettings {
  return {
    rootOutputFolder: "C:\\HallederizCRM\\Belgeler",
    autoPrintEnabled: false,
    safeMode: true,
    documentFolders: {
      invoice_pdf: "Faturalar",
      offer_pdf: "Teklifler",
      delivery_note_pdf: "Teslimatlar"
    },
    printerMapping: {
      invoice_pdf: "Ofis-Laser-01"
    },
    copies: 1,
    apiBaseUrl: process.env.LOCAL_AGENT_API_BASE_URL ?? "http://localhost:4000",
    tenantId: process.env.LOCAL_AGENT_TENANT_ID ?? "tenant_1",
    userId: process.env.LOCAL_AGENT_USER_ID ?? "user_local_agent",
    sessionToken: process.env.LOCAL_AGENT_SESSION_TOKEN,
    pollIntervalMs: Number(process.env.LOCAL_AGENT_POLL_INTERVAL_MS ?? 15000)
  };
}

export function mapRuleToSettings(rule: LocalOutputRule, settings = loadSettings()) {
  return {
    folder: `${settings.rootOutputFolder}\\${rule.subfolder}`,
    printer: rule.printerName ?? settings.printerMapping[rule.documentType],
    copies: rule.copies || settings.copies
  };
}
