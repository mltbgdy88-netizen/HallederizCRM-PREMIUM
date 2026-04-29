import type { LocalOutputRule } from "@hallederiz/types";

export interface LocalAgentSettings {
  mode: "enabled" | "disabled";
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
  const mode = (process.env.LOCAL_AGENT_MODE ?? "enabled") as LocalAgentSettings["mode"];
  const rootOutputFolder = process.env.LOCAL_OUTPUT_ROOT ?? "C:\\HallederizCRM\\Belgeler";
  const autoPrintEnabled = String(process.env.LOCAL_AGENT_AUTO_PRINT ?? "false").toLowerCase() === "true";
  const safeMode = String(process.env.LOCAL_AGENT_SAFE_MODE ?? "true").toLowerCase() === "true";
  const defaultPrinter = process.env.DEFAULT_PRINTER_NAME ?? "Ofis-Laser-01";

  return {
    mode,
    rootOutputFolder,
    autoPrintEnabled,
    safeMode,
    documentFolders: {
      invoice_pdf: process.env.LOCAL_SUBFOLDER_INVOICE ?? "Faturalar",
      offer_pdf: process.env.LOCAL_SUBFOLDER_OFFER ?? "Teklifler",
      delivery_note_pdf: process.env.LOCAL_SUBFOLDER_DELIVERY ?? "Teslimatlar"
    },
    printerMapping: {
      invoice_pdf: defaultPrinter,
      offer_pdf: defaultPrinter,
      delivery_note_pdf: defaultPrinter
    },
    copies: Number(process.env.LOCAL_AGENT_COPIES ?? 1),
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
