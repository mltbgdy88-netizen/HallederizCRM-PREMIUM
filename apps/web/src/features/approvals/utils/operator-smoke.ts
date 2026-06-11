import type { ApprovalActionResponse, ApprovalClientError, ApprovalInboxItem, ApprovalSandboxAvailabilityResponse, WorkerHealthResponse } from "../types";

export type OperatorSmokeStepId =
  | "routeAvailable"
  | "sandboxAvailable"
  | "seedCreatedPendingApprovals"
  | "listShowsPendingApproval"
  | "approvalDetailLoads"
  | "approveReturnsExecutionMetadata"
  | "rejectRequiresReason"
  | "workerHealthAvailable"
  | "noApiPath404"
  | "providerWritesDisabled"
  | "realUserCreateDisabled";

export type OperatorSmokeStatus = "ok" | "warning" | "fail" | "skipped" | "neutral";

export interface OperatorSmokeStep {
  id: OperatorSmokeStepId;
  label: string;
  status: OperatorSmokeStatus;
  detail?: string;
}

export type OperatorSmokeOverall = "success" | "partial" | "blocked";

export interface OperatorSmokeSummary {
  overall: OperatorSmokeOverall;
  steps: OperatorSmokeStep[];
  okCount: number;
  warningCount: number;
  failCount: number;
  skippedCount: number;
  neutralCount: number;
}

export interface OperatorSmokeContext {
  nodeEnv: string | undefined;
  listLoading: boolean;
  listError: ApprovalClientError | null;
  items: ApprovalInboxItem[];
  detailLoading: boolean;
  detailError: ApprovalClientError | null;
  selectedId: string | null;
  detail: ApprovalInboxItem | null;
  sandboxAvailability: ApprovalSandboxAvailabilityResponse | null;
  workerHealth: WorkerHealthResponse | null;
  workerSafety: WorkerHealthResponse | null;
  /** Last sandbox seed counts (successful POST only) */
  lastSeedCounts: { created: number; skipped: number } | null;
  /** True after at least one successful approve in session (incl. duplicate idempotent) */
  lastApproveOk: boolean;
  /** Last approve response had execution/outbox metadata or was duplicate idempotent */
  lastApproveHadBridgeSignal: boolean;
}

export interface LastApprovalActionSummary {
  at: string;
  duplicate?: boolean;
  executionId?: string;
  outboxJobId?: string;
  bridgeLine: string;
  auditTimelineWritebackQueued?: boolean;
  gateLine: string;
}

function isNotFound(err: ApprovalClientError | null | undefined): boolean {
  return err?.kind === "not_found";
}

function readSafetyBoolean(worker: WorkerHealthResponse | null | undefined, key: "providerWritesEnabled" | "realExecutionEnabled"): boolean | undefined {
  if (!worker || typeof worker !== "object") return undefined;
  const w = worker as unknown as Record<string, unknown>;
  const v = w[key];
  return typeof v === "boolean" ? v : undefined;
}

/** Human-readable seed outcome; idempotent-only is safe info, not an error. */
export function formatSandboxSeedOutcome(created: number, skipped: number): { message: string; tone: "created" | "idempotent" | "mixed" } {
  if (created > 0 && skipped === 0) {
    return { message: `${created} yeni demo onay kaydi olusturuldu.`, tone: "created" };
  }
  if (created > 0 && skipped > 0) {
    return {
      message: `${created} yeni kayit eklendi; ${skipped} sablon zaten vardi (idempotent atlandi).`,
      tone: "mixed"
    };
  }
  if (created === 0 && skipped > 0) {
    return {
      message: `Yeni kayit yok: ${skipped} sablon zaten mevcut (idempotent). Bu bir hata degil; repository tutarli.`,
      tone: "idempotent"
    };
  }
  return { message: "Seed tamamlandi; olusturulan veya atlanan kayit sayisi raporlanmadi.", tone: "idempotent" };
}

export function summarizeGateDecisionShort(gate?: Record<string, unknown> | null): string {
  if (!gate || typeof gate !== "object") return "Gate: (yanitta yok)";
  const allowed = gate.allowed;
  const mode = gate.mode;
  const parts: string[] = [];
  if (typeof allowed === "boolean") parts.push(`allowed=${allowed}`);
  if (typeof mode === "string") parts.push(`mode=${mode}`);
  return parts.length ? `Gate: ${parts.join(", ")}` : "Gate: (detay yok)";
}

export function buildLastApprovalActionSummary(response: ApprovalActionResponse, atIso: string): LastApprovalActionSummary {
  const br = response.bridgeResult;
  const bridgeParts: string[] = [];
  if (response.bridgeMode) bridgeParts.push(`bridgeMode=${response.bridgeMode}`);
  if (br?.transactionMode) bridgeParts.push(`tx=${br.transactionMode}`);
  if (br?.persistenceMode) bridgeParts.push(`persist=${br.persistenceMode}`);
  if (typeof br?.outboxJobEnqueued === "boolean") bridgeParts.push(`outboxJobEnqueued=${br.outboxJobEnqueued}`);
  if (typeof br?.outboxDuplicate === "boolean") bridgeParts.push(`outboxDuplicate=${br.outboxDuplicate}`);
  const bridgeLine = bridgeParts.length ? bridgeParts.join(" · ") : response.bridgeMode ?? "(bridge ozeti yok)";

  return {
    at: atIso,
    duplicate: response.duplicate === true,
    executionId: response.executionId,
    outboxJobId: response.outboxJobId,
    bridgeLine,
    auditTimelineWritebackQueued: response.auditTimelineWritebackQueued,
    gateLine: summarizeGateDecisionShort(response.gateDecision ?? null)
  };
}

export function buildOperatorSmokeChecklist(ctx: OperatorSmokeContext): OperatorSmokeStep[] {
  const isProd = ctx.nodeEnv === "production";
  const listReady = !ctx.listLoading;
  const listOk = listReady && !ctx.listError;
  const any404 = isNotFound(ctx.listError) || isNotFound(ctx.detailError);

  const routeAvailable: OperatorSmokeStep = {
    id: "routeAvailable",
    label: "Onay listesi rotası",
    status: !listReady ? "neutral" : listOk ? "ok" : "fail",
    detail: !listReady ? "Liste yükleniyor…" : listOk ? "/platform/approvals erişilebilir." : ctx.listError?.message
  };

  const sandboxAvailable: OperatorSmokeStep = {
    id: "sandboxAvailable",
    label: "Test ortamı örnek veri (yerel/demo)",
    status: isProd ? "skipped" : ctx.sandboxAvailability?.sandboxSeedAvailable ? "ok" : ctx.sandboxAvailability ? "warning" : "neutral",
    detail: isProd
      ? "Canlı ortam derlemesinde test ortamı araçları gösterilmez."
      : ctx.sandboxAvailability?.sandboxSeedAvailable
        ? "Test ortamı örnek veri API hazır."
        : ctx.sandboxAvailability
          ? "Test ortamı kapalı veya depo hazır değil."
          : "Test ortamı durumu henüz alınamadı."
  };

  const pendingCount = ctx.items.filter((i) => i.status === "pending").length;
  const seedCreatedPendingApprovals: OperatorSmokeStep = {
    id: "seedCreatedPendingApprovals",
    label: "Örnek veri → bekleyen onay",
    status: isProd
      ? "skipped"
      : ctx.lastSeedCounts === null
        ? "neutral"
        : ctx.lastSeedCounts.created > 0
          ? "ok"
          : ctx.lastSeedCounts.skipped > 0
            ? "ok"
            : "warning",
    detail: isProd
      ? "Canlı ortam."
      : ctx.lastSeedCounts === null
        ? "Henüz örnek veri çalıştırılmadı veya sonuç yok."
        : formatSandboxSeedOutcome(ctx.lastSeedCounts.created, ctx.lastSeedCounts.skipped).message
  };

  const listShowsPendingApproval: OperatorSmokeStep = {
    id: "listShowsPendingApproval",
    label: "Listede bekleyen",
    status: !listOk ? "neutral" : pendingCount > 0 ? "ok" : "warning",
    detail: !listOk ? "Liste hatası var." : pendingCount > 0 ? `${pendingCount} bekleyen kayıt.` : "Bekleyen yok; filtre veya örnek veriyi kontrol edin."
  };

  const detailLoads =
    Boolean(ctx.selectedId) &&
    !ctx.detailLoading &&
    !ctx.detailError &&
    Boolean(ctx.detail) &&
    ctx.detail?.approvalRequestId === ctx.selectedId;

  const approvalDetailLoads: OperatorSmokeStep = {
    id: "approvalDetailLoads",
    label: "Detay yükleme",
    status: !ctx.selectedId ? "neutral" : ctx.detailLoading ? "neutral" : ctx.detailError ? "fail" : detailLoads ? "ok" : "warning",
    detail: ctx.detailError?.message ?? (detailLoads ? "Detay API tamam." : "Detay bekleniyor veya boş.")
  };

  const approveMeta: OperatorSmokeStep = {
    id: "approveReturnsExecutionMetadata",
    label: "Onay → çalıştırma / iş kuyruğu sinyali",
    status: !ctx.lastApproveOk ? "neutral" : ctx.lastApproveHadBridgeSignal ? "ok" : "warning",
    detail: !ctx.lastApproveOk
      ? "Bu oturumda henüz başarılı onay çağrılmadı."
      : ctx.lastApproveHadBridgeSignal
        ? "Son onay yanıtında çalıştırma/iş kuyruğu veya tekrar güvenli yinelenen sinyal alındı."
        : "Son onay başarılı ama çalıştırma/iş kuyruğu alanları boş; API sürümünü kontrol edin."
  };

  const rejectRequiresReason: OperatorSmokeStep = {
    id: "rejectRequiresReason",
    label: "Red → neden (arayüz doğrulama)",
    status: "ok",
    detail: "Reddetme boş nedenle gönderilmez; istemci tarafında engellenir."
  };

  const workerHealthAvailable: OperatorSmokeStep = {
    id: "workerHealthAvailable",
    label: "Çalışan servis sağlığı",
    status: ctx.workerHealth?.ok === true && ctx.workerHealth.health?.ok === true ? "ok" : ctx.workerHealth?.ok === false ? "warning" : "neutral",
    detail:
      ctx.workerHealth?.ok === true && ctx.workerHealth.health?.ok === true
        ? "Çalışan servis sağlığı yanıtı başarılı."
        : ctx.workerHealth?.message || ctx.workerHealth?.error || "Çalışan servis sağlığı henüz alınamadı veya hata."
  };

  const noApiPath404: OperatorSmokeStep = {
    id: "noApiPath404",
    label: "Onay API path 404 yok",
    status: any404 ? "fail" : listReady && listOk ? "ok" : "neutral",
    detail: any404 ? "List veya detay istegi 404 dondu; route eslemesini kontrol edin." : "Yayinlanan path ile 404 gozlenmedi."
  };

  const providerWrites =
    readSafetyBoolean(ctx.workerSafety, "providerWritesEnabled") ??
    readSafetyBoolean(ctx.workerHealth, "providerWritesEnabled");

  const providerWritesDisabled: OperatorSmokeStep = {
    id: "providerWritesDisabled",
    label: "Sağlayıcı yazımları kapalı",
    status: providerWrites === false ? "ok" : providerWrites === true ? "fail" : ctx.workerSafety || ctx.workerHealth ? "warning" : "neutral",
    detail:
      providerWrites === false
        ? "Çalışan güvenlik: sağlayıcı yazımları devre dışı."
        : providerWrites === true
          ? "Uyarı: sağlayıcı yazımları etkin — beklenmeyen güvenlik sinyali."
          : "Çalışan/güvenlik veya sağlık yanıtında sağlayıcı yazım alanı yok."
  };

  const realExec = readSafetyBoolean(ctx.workerSafety, "realExecutionEnabled") ?? readSafetyBoolean(ctx.workerHealth, "realExecutionEnabled");

  const realUserCreateDisabled: OperatorSmokeStep = {
    id: "realUserCreateDisabled",
    label: "Gerçek çalıştırma kapalı",
    status: realExec === false ? "ok" : realExec === true ? "fail" : ctx.workerSafety || ctx.workerHealth ? "warning" : "neutral",
    detail:
      realExec === false
        ? "Gerçek çalıştırma devre dışı (kontrollü temel mod)."
        : realExec === true
          ? "Uyarı: gerçek çalıştırma etkin — operatör test ortamı doğrulaması için kontrol edin."
          : "Gerçek çalıştırma alanı yanıtta yok."
  };

  return [
    routeAvailable,
    sandboxAvailable,
    seedCreatedPendingApprovals,
    listShowsPendingApproval,
    approvalDetailLoads,
    approveMeta,
    rejectRequiresReason,
    workerHealthAvailable,
    noApiPath404,
    providerWritesDisabled,
    realUserCreateDisabled
  ];
}

export function summarizeOperatorSmokeResult(steps: OperatorSmokeStep[]): OperatorSmokeSummary {
  let okCount = 0;
  let warningCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  let neutralCount = 0;
  for (const s of steps) {
    if (s.status === "ok") okCount += 1;
    else if (s.status === "warning") warningCount += 1;
    else if (s.status === "fail") failCount += 1;
    else if (s.status === "skipped") skippedCount += 1;
    else neutralCount += 1;
  }
  let overall: OperatorSmokeOverall = "success";
  if (failCount > 0) overall = "blocked";
  else if (warningCount > 0) overall = "partial";
  return { overall, steps, okCount, warningCount, failCount, skippedCount, neutralCount };
}
