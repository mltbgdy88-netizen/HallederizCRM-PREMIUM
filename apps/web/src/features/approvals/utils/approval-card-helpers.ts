import type { ApprovalInboxItem } from "../types";

export type ApprovalCardRiskLevel = "high" | "medium" | "low" | "neutral";

export type ApprovalSourceKey = "whatsapp" | "web" | "ai" | "platform";

export type ApprovalActionCategoryFilter =
  | "all"
  | "order"
  | "payment"
  | "settings"
  | "users"
  | "delivery"
  | "invoice"
  | "return"
  | "document"
  | "ai"
  | "other";

export interface ApprovalAdvancedFilterState {
  actionCategory: ApprovalActionCategoryFilter;
  risk: "all" | ApprovalCardRiskLevel;
  source: "all" | ApprovalSourceKey;
  timePreset: "all" | "24h" | "7d";
}

export const DEFAULT_APPROVAL_ADVANCED_FILTERS: ApprovalAdvancedFilterState = {
  actionCategory: "all",
  risk: "all",
  source: "all",
  timePreset: "all"
};

const TITLE_MAP: Record<string, string> = {
  "platform.settings.update": "Ayar güncelleme onayı",
  "platform.users.create": "Kullanıcı oluşturma onayı",
  "sales.order.approve": "Sipariş onayı",
  create_order: "Sipariş onayı",
  create_payment: "Tahsilat onayı",
  create_invoice: "Fatura onayı",
  complete_delivery: "Teslim tamamlama onayı",
  create_return: "İade onayı",
  send_document_whatsapp: "WhatsApp belge gönderimi onayı",
  queue_document_save: "Belge kaydetme kuyruğu onayı",
  queue_document_print: "Belge yazdırma kuyruğu onayı",
  ai_plan_approval: "AI plan onayı"
};

const TAG_MAP: Record<string, string> = {
  "platform.settings.update": "Ayarlar",
  "platform.users.create": "Kullanıcı",
  "sales.order.approve": "Sipariş",
  create_order: "Sipariş",
  create_payment: "Tahsilat",
  create_invoice: "Fatura",
  complete_delivery: "Teslimat",
  create_return: "İade",
  send_document_whatsapp: "WhatsApp belge",
  queue_document_save: "Belge kayıt",
  queue_document_print: "Belge yazdırma",
  ai_plan_approval: "AI plan"
};

function readStringField(record: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** İnsan okunur başlık; bilinmeyen actionKey için jenerik metin. */
export function mapApprovalCardTitle(actionKey: string): string {
  const direct = TITLE_MAP[actionKey];
  if (direct) return direct;
  const lower = actionKey.toLowerCase();
  for (const [k, v] of Object.entries(TITLE_MAP)) {
    if (lower === k || lower.endsWith(`.${k}`) || lower.includes(k)) return v;
  }
  if (lower.includes("order") || lower.includes("siparis")) return "Sipariş onayı";
  if (lower.includes("payment") || lower.includes("tahsilat")) return "Tahsilat onayı";
  if (lower.includes("invoice") || lower.includes("fatura")) return "Fatura onayı";
  if (lower.includes("return") || lower.includes("iade")) return "İade onayı";
  if (lower.includes("whatsapp")) return "WhatsApp kanalı onayı";
  if (lower.includes("ai")) return "AI onayı";
  return "Onay gerektiren işlem";
}

/** Kart etiketi (chip); actionKey veya payload ipuçlarından. */
export function mapApprovalCardTag(item: ApprovalInboxItem): string {
  const key = item.actionKey;
  const lower = key.toLowerCase();
  const discount = readStringField(item.payload, ["discountType", "approvalKind"]);
  if (discount && /iskonto|discount/i.test(discount)) return "İndirim onayı";
  if (lower.includes("price") || lower.includes("fiyat")) return "Fiyat teklifi onayı";
  if (lower.includes("stock") || lower.includes("stok")) return "Stok onayı";
  const direct = TAG_MAP[key];
  if (direct) return direct;
  for (const [k, v] of Object.entries(TAG_MAP)) {
    if (lower === k || lower.endsWith(`.${k}`) || lower.includes(k)) return v;
  }
  if (lower.includes("payment")) return "Tahsilat onayı";
  if (lower.includes("order")) return "Sipariş onayı";
  return "Genel onay";
}

function readPayloadRisk(payload?: Record<string, unknown>): ApprovalCardRiskLevel | undefined {
  if (!payload) return undefined;
  const raw = payload.riskLevel ?? payload.risk ?? payload.severity;
  if (typeof raw !== "string") return undefined;
  const v = raw.toLowerCase();
  if (v === "high" || v === "yüksek" || v === "yuksek") return "high";
  if (v === "medium" || v === "orta") return "medium";
  if (v === "low" || v === "düşük" || v === "dusuk") return "low";
  return undefined;
}

/** Risk: önce payload/gate; sonra reasons/actionKey ipucu; sahte sayı üretmez. */
export function mapApprovalRiskLevel(item: ApprovalInboxItem): ApprovalCardRiskLevel {
  const fromPayload = readPayloadRisk(item.payload);
  if (fromPayload) return fromPayload;
  const gate = item.gateDecision;
  if (gate && typeof gate === "object") {
    const sev = (gate as Record<string, unknown>).severity ?? (gate as Record<string, unknown>).riskLevel;
    if (typeof sev === "string") {
      const mapped = readPayloadRisk({ riskLevel: sev });
      if (mapped) return mapped;
    }
  }
  const haystack = [...item.reasons, item.actionKey].join(" ").toLowerCase();
  if (/risk\s*high|yüksek|yuksek|critical|kritik/i.test(haystack)) return "high";
  if (/risk\s*medium|orta|warning|uyari|dikkat/i.test(haystack)) return "medium";
  if (/risk\s*low|düşük|dusuk|düşük\s*risk/i.test(haystack)) return "low";
  const key = item.actionKey.toLowerCase();
  if (/payment|invoice|tahsilat|fatura|financial/i.test(key)) return "medium";
  if (/settings|users|platform\.|delete|remove/i.test(key)) return "medium";
  return "neutral";
}

export function mapApprovalRiskLabel(level: ApprovalCardRiskLevel): string {
  switch (level) {
    case "high":
      return "YÜKSEK";
    case "medium":
      return "ORTA";
    case "low":
      return "DÜŞÜK";
    default:
      return "NÖTR";
  }
}

function inferSourceKeyFromStrings(...parts: string[]): ApprovalSourceKey {
  const blob = parts.join(" ").toLowerCase();
  if (/whatsapp|wa\b|waba/.test(blob)) return "whatsapp";
  if (/openai|anthropic|gpt|claude|ai[_-]?plan|ai\b/.test(blob)) return "ai";
  if (/web|browser|portal|http/.test(blob)) return "web";
  return "platform";
}

export function getApprovalSourceKey(item: ApprovalInboxItem): ApprovalSourceKey {
  const p = item.payload ?? {};
  const channel = readStringField(p, ["channel", "source", "origin", "requestChannel", "messageChannel", "ingress", "trigger"]);
  const blob = [channel, item.actionKey, ...item.reasons].filter(Boolean).join(" ");
  return inferSourceKeyFromStrings(blob);
}

export function getApprovalSourceLabel(item: ApprovalInboxItem): { key: ApprovalSourceKey; label: string } {
  const key = getApprovalSourceKey(item);
  switch (key) {
    case "whatsapp":
      return { key, label: "WhatsApp" };
    case "web":
      return { key, label: "Web" };
    case "ai":
      return { key, label: "AI" };
    default:
      return { key, label: "Platform" };
  }
}

/** Kısa iş bağlamı; veri yoksa jenerik metin (sahte müşteri adı üretmez). */
export function summarizeApprovalBusinessContext(item: ApprovalInboxItem): string {
  const p = item.payload ?? {};
  const company =
    readStringField(p, ["companyName", "tenantName", "customerName", "accountName", "cariName", "businessName"]) ??
    readStringField(p, ["company", "customer", "account"]);
  const person = readStringField(p, ["contactName", "personName", "requesterName", "userName"]);
  if (company && person) return `${company} · ${person}`;
  if (company) return company;
  if (person) return person;
  if (item.actorId && item.actorId !== "system") return `Talep eden: ${item.actorId}`;
  return "Kayıt bağlamı yok";
}

/** Tutar / adet özeti; yoksa "—". */
export function summarizeApprovalAmount(item: ApprovalInboxItem): string {
  const p = item.payload ?? {};
  const amount = p.amount ?? p.total ?? p.totalAmount ?? p.grandTotal;
  const qty = p.quantity ?? p.qty ?? p.lineCount;
  const cur = readStringField(p, ["currency", "ccy"]);
  if (typeof amount === "number" && Number.isFinite(amount)) {
    const curPart = cur ? ` ${cur}` : "";
    if (typeof qty === "number" && Number.isFinite(qty)) {
      return `${amount.toLocaleString("tr-TR")}${curPart} · ${qty.toLocaleString("tr-TR")} adet`;
    }
    return `${amount.toLocaleString("tr-TR")}${curPart}`;
  }
  if (typeof qty === "number" && Number.isFinite(qty)) {
    return `${qty.toLocaleString("tr-TR")} adet`;
  }
  return "—";
}

/** Kısa açıklama: reasons veya payload özetinden. */
export function summarizeApprovalCardDescription(item: ApprovalInboxItem): string {
  if (item.reasons.length) return item.reasons.slice(0, 2).join(" · ");
  const p = item.payload;
  if (!p) return "Açıklama API yanıtında yok.";
  const note = readStringField(p, ["note", "summary", "description", "message", "title"]);
  if (note && note.length <= 200) return note;
  try {
    const s = JSON.stringify(p);
    return s.length > 160 ? `${s.slice(0, 157)}…` : s;
  } catch {
    return "Özet üretilemedi.";
  }
}

/** Liste / kart için kısa id. */
export function formatApprovalDisplayId(approvalRequestId: string): string {
  if (approvalRequestId.startsWith("apr_")) {
    return `#ONAY-${approvalRequestId.slice(4, 16)}`;
  }
  return `#ONAY-${approvalRequestId.slice(0, 10)}`;
}

/**
 * Göreli zaman; `nowMs` testlerde sabitlenebilir.
 */
export function formatApprovalRelativeTime(iso: string, nowMs: number = Date.now()): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "—";
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 45) return "Az önce";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} dk önce`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} saat önce`;
  }
  const d = Math.floor(diffSec / 86400);
  if (d === 1) return "Dün";
  if (d < 14) return `${d} gün önce`;
  return new Date(ts).toLocaleDateString("tr-TR");
}

function readGateSteps(gate?: Record<string, unknown> | null): number | undefined {
  if (!gate || typeof gate !== "object") return undefined;
  const steps = (gate as Record<string, unknown>).steps;
  if (Array.isArray(steps) && steps.length > 0) return steps.length;
  const sc = (gate as Record<string, unknown>).stepCount ?? (gate as Record<string, unknown>).totalSteps;
  if (typeof sc === "number" && sc > 0 && Number.isFinite(sc)) return sc;
  return undefined;
}

function readPayloadSteps(payload?: Record<string, unknown>): number | undefined {
  if (!payload) return undefined;
  const sc = payload.stepCount ?? payload.totalSteps ?? payload.flowSteps;
  if (typeof sc === "number" && sc > 0 && Number.isFinite(sc)) return sc;
  const arr = payload.steps;
  if (Array.isArray(arr) && arr.length > 0) return arr.length;
  return undefined;
}

/**
 * Adım bilgisi: API metadata varsa sayı; yoksa olay sayımı veya bekleyen metin (uydurma adım yok).
 */
export function describeApprovalFlowSteps(item: ApprovalInboxItem): string {
  const fromGate = readGateSteps(item.gateDecision);
  if (fromGate) return `${fromGate} adım`;
  const fromPayload = readPayloadSteps(item.payload);
  if (fromPayload) return `${fromPayload} adım`;
  const milestones = [item.approvedAt, item.rejectedAt, item.executionId].filter(Boolean).length;
  const hasRequest = Boolean(item.requestedAt);
  const count = milestones + (hasRequest ? 1 : 0);
  if (count > 1) return `${count} olay kaydı`;
  return "Akış bekliyor";
}

export function classifyActionCategory(item: ApprovalInboxItem): ApprovalActionCategoryFilter {
  const k = item.actionKey.toLowerCase();
  if (/order|siparis|sales\.order/.test(k)) return "order";
  if (/payment|tahsilat/.test(k)) return "payment";
  if (/settings|config/.test(k)) return "settings";
  if (/users|kullanici|user\./.test(k)) return "users";
  if (/deliver|teslim/.test(k)) return "delivery";
  if (/invoice|fatura/.test(k)) return "invoice";
  if (/return|iade/.test(k)) return "return";
  if (/document|belge|whatsapp/.test(k)) return "document";
  if (/ai/.test(k)) return "ai";
  return "other";
}

function matchesTimePreset(item: ApprovalInboxItem, preset: "24h" | "7d", nowMs: number): boolean {
  const t = Date.parse(item.requestedAt || item.createdAt);
  if (!Number.isFinite(t)) return false;
  const windowMs = preset === "24h" ? 86400000 : 7 * 86400000;
  return nowMs - t <= windowMs;
}

/** Durum + arama + sıralama sonrası gelen listeye istemci tarafı ek filtre. */
export function applyAdvancedInboxFilters(
  items: ApprovalInboxItem[],
  filters: ApprovalAdvancedFilterState,
  nowMs: number = Date.now()
): ApprovalInboxItem[] {
  return items.filter((item) => {
    if (filters.actionCategory !== "all" && classifyActionCategory(item) !== filters.actionCategory) {
      return false;
    }
    if (filters.risk !== "all" && mapApprovalRiskLevel(item) !== filters.risk) {
      return false;
    }
    if (filters.source !== "all" && getApprovalSourceKey(item) !== filters.source) {
      return false;
    }
    if (filters.timePreset === "24h" || filters.timePreset === "7d") {
      if (!matchesTimePreset(item, filters.timePreset, nowMs)) return false;
    }
    return true;
  });
}

/** Bugün tamamlanan (onay veya red, yerel gün sınırı). */
export function computeCompletedTodayCount(items: ApprovalInboxItem[], now: Date = new Date()): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const a = start.getTime();
  const b = end.getTime();
  let n = 0;
  for (const item of items) {
    const at = item.approvedAt ?? item.rejectedAt;
    if (!at) continue;
    const t = Date.parse(at);
    if (Number.isFinite(t) && t >= a && t < b) n += 1;
  }
  return n;
}
