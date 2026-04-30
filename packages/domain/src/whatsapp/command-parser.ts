export type WhatsAppApprovalCommand = "approve" | "reject" | "review";

export type WhatsAppCommandParseError = "not_command" | "missing_reference" | "missing_token";

export type WhatsAppCommandParseResult = {
  command?: WhatsAppApprovalCommand;
  referenceCode?: string;
  rawToken?: string;
  normalizedText: string;
  parseError?: WhatsAppCommandParseError;
};

function normalizeCommandText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .toLocaleLowerCase("tr-TR");
}

function resolveCommand(value: string): WhatsAppApprovalCommand | null {
  const normalized = normalizeCommandText(value);
  if (["onay", "onayla", "approve"].includes(normalized)) return "approve";
  if (["red", "reddet", "reject"].includes(normalized)) return "reject";
  if (["incele", "review"].includes(normalized)) return "review";
  return null;
}

export function parseWhatsAppApprovalCommand(text: string): WhatsAppCommandParseResult {
  const normalizedText = normalizeCommandText(text);
  if (!normalizedText) return { normalizedText, parseError: "not_command" };

  const parts = normalizedText.split(" ");
  const command = resolveCommand(parts[0] ?? "");
  if (!command) return { normalizedText, parseError: "not_command" };

  const referenceCode = parts[1]?.trim();
  if (!referenceCode) return { command, normalizedText, parseError: "missing_reference" };

  const rawToken = parts[2]?.trim();
  if (!rawToken) return { command, normalizedText, referenceCode, parseError: "missing_token" };

  return {
    command,
    normalizedText,
    rawToken,
    referenceCode
  };
}
