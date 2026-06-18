import { evaluateProductionSafety, normalizeWorkerMode } from "@hallederiz/domain";
import { getAuthMode } from "./auth-mode";
import { resolveOmnichannelRuntime } from "./omnichannel-runtime";
import { resolvePendingApprovalRepository } from "./approval-repository-runtime";
import { resolveTenantUsageLedger } from "./tenant-usage-runtime";
import type { RequestContext } from "./request-context";

export type ProductionReadinessStatus = "ready" | "degraded" | "blocked";

export interface ProductionReadinessReport {
  overallStatus: ProductionReadinessStatus;
  environment: {
    nodeEnv: string;
    isProduction: boolean;
    persistenceMode: string;
  };
  persistence: {
    mode: string;
    databaseConfigured: boolean;
  };
  auth: {
    sessionSecretConfigured: boolean;
    demoAuthEnabled: boolean;
    headerFallbackEnabled: boolean;
  };
  database: {
    configured: boolean;
    urlSource: "POSTGRES_URL" | "DATABASE_URL" | "missing";
  };
  approvalExecution: {
    mode: string;
    pendingApprovalPersistenceMode: string;
    ready: boolean;
  };
  workerOutbox: {
    workerMode: string;
    ready: boolean;
  };
  tenantUsage: {
    persistenceMode: string;
    ready: boolean;
  };
  omnichannel: {
    persistenceMode: string;
    ready: boolean;
    providerModes: Array<{ kind: string; mode: string; ok: boolean }>;
  };
  whatsapp: {
    liveEnvConfigured: boolean;
  };
  localAi: {
    configured: boolean;
  };
  localAgent: {
    configured: boolean;
  };
  documentGeneration: {
    localOutputConfigured: boolean;
  };
  billingUsage: {
    dbBacked: boolean;
  };
  blockers: string[];
  warnings: string[];
  requiredEnv: string[];
  missingEnv: string[];
  unsafeFallbacks: string[];
  nextActions: string[];
  mutationSafe: boolean;
  readOnlySafe: boolean;
  workerSafe: boolean;
  providerSafe: boolean;
  checks: Array<{ id: string; ok: boolean; severity: "blocker" | "warning" }>;
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function addMissingEnv(
  name: string,
  blockers: string[],
  missingEnv: string[],
  requiredEnv: string[],
  warnings: string[],
  isProduction: boolean
) {
  requiredEnv.push(name);
  missingEnv.push(name);
  if (isProduction) {
    blockers.push(`missing_env_${name.toLowerCase()}`);
  } else {
    warnings.push(`missing_env_${name.toLowerCase()}`);
  }
}

export async function evaluateProductionReadiness(context: RequestContext): Promise<ProductionReadinessReport> {
  const authMode = getAuthMode();
  const isProduction = authMode.isProduction;
  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredEnv: string[] = [];
  const missingEnv: string[] = [];
  const unsafeFallbacks: string[] = [];

  const postgresUrl = process.env.POSTGRES_URL;
  const databaseUrl = process.env.DATABASE_URL;
  const databaseConfigured = hasText(postgresUrl) || hasText(databaseUrl);
  const urlSource: "POSTGRES_URL" | "DATABASE_URL" | "missing" = hasText(postgresUrl)
    ? "POSTGRES_URL"
    : hasText(databaseUrl)
      ? "DATABASE_URL"
      : "missing";

  if (!databaseConfigured) {
    addMissingEnv("DATABASE_URL", blockers, missingEnv, requiredEnv, warnings, isProduction);
  }

  if (!hasText(process.env.AUTH_SESSION_SECRET)) {
    addMissingEnv("AUTH_SESSION_SECRET", blockers, missingEnv, requiredEnv, warnings, isProduction);
  }
  if (!hasText(process.env.APP_BASE_URL)) {
    addMissingEnv("APP_BASE_URL", blockers, missingEnv, requiredEnv, warnings, isProduction);
  }
  if (!hasText(process.env.API_BASE_URL)) {
    addMissingEnv("API_BASE_URL", blockers, missingEnv, requiredEnv, warnings, isProduction);
  }

  const pendingApproval = resolvePendingApprovalRepository(context);
  const usageLedger = resolveTenantUsageLedger(context);
  const omnichannel = resolveOmnichannelRuntime(context);
  const workerMode = process.env.WORKER_MODE?.trim() || "foundation";
  const resolvedWorkerMode =
    workerMode === "foundation" ? "foundation" : normalizeWorkerMode(workerMode);
  const approvalExecutionMode = process.env.APPROVAL_EXECUTION_MODE?.trim() || "foundation";

  if (process.env.PERSISTENCE_MODE === "demo") {
    blockers.push("persistence_mode_demo_blocked");
    unsafeFallbacks.push("PERSISTENCE_MODE=demo");
  }
  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA === "true") {
    blockers.push("demo_data_flag_blocked");
    unsafeFallbacks.push("NEXT_PUBLIC_USE_DEMO_DATA=true");
  }
  if (process.env.ALLOW_DEMO_FALLBACK === "true") {
    blockers.push("demo_fallback_blocked");
    unsafeFallbacks.push("ALLOW_DEMO_FALLBACK=true");
  }
  if (process.env.DEMO_AUTH_ENABLED === "true" || process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true") {
    blockers.push("demo_auth_blocked");
    unsafeFallbacks.push("demo_auth_enabled");
  }
  if (process.env.OMNICHANNEL_ALLOW_MOCK_PROVIDERS === "true") {
    blockers.push("mock_provider_flag_blocked");
    unsafeFallbacks.push("OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true");
  }

  if (isProduction && authMode.persistenceMode !== "postgres") {
    blockers.push("production_requires_postgres_persistence_mode");
    unsafeFallbacks.push("persistence_mode_demo_in_production");
  }
  if (isProduction && authMode.demoAuthEnabled) {
    blockers.push("demo_auth_enabled_in_production");
    unsafeFallbacks.push("demo_auth_fallback");
  }
  if (isProduction && authMode.allowHeaderPrincipalFallback) {
    blockers.push("header_principal_fallback_enabled_in_production");
    unsafeFallbacks.push("header_permission_fallback");
  }

  if (!pendingApproval.repository) {
    blockers.push("pending_approval_repository_unavailable");
    unsafeFallbacks.push(...pendingApproval.reasons);
  }
  if (!usageLedger.ledger) {
    blockers.push("tenant_usage_ledger_unavailable");
    unsafeFallbacks.push(...usageLedger.reasons);
  }
  if (!omnichannel.conversationRepository || !omnichannel.messageRepository) {
    blockers.push("omnichannel_repository_unavailable");
    unsafeFallbacks.push(...omnichannel.reasons);
  }

  if (isProduction && resolvedWorkerMode !== "production") {
    blockers.push("worker_mode_not_durable");
    unsafeFallbacks.push("worker_mode_foundation");
  }
  if (isProduction && approvalExecutionMode === "foundation") {
    blockers.push("approval_execution_mode_foundation");
    unsafeFallbacks.push("approval_execution_foundation_mode");
  }

  const whatsappRequired = [
    "WHATSAPP_WEBHOOK_SECRET",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_ACCESS_TOKEN"
  ];
  const missingWhatsApp = whatsappRequired.filter((name) => !hasText(process.env[name]));
  for (const key of whatsappRequired) {
    requiredEnv.push(key);
  }
  missingEnv.push(...missingWhatsApp);
  if (isProduction && missingWhatsApp.length > 0) {
    blockers.push("whatsapp_live_env_missing");
  } else if (missingWhatsApp.length > 0) {
    warnings.push("whatsapp_live_env_missing");
  }

  const localAiConfigured = hasText(process.env.LOCAL_AI_SERVICE_URL);
  if (!localAiConfigured) {
    warnings.push("local_ai_service_not_configured");
  }
  const localAgentConfigured = hasText(process.env.LOCAL_AGENT_SHARED_SECRET) && hasText(process.env.LOCAL_AGENT_OUTPUT_DIR);
  if (!localAgentConfigured) {
    warnings.push("local_agent_not_configured");
  }

  const providerModes = await Promise.all(
    [...omnichannel.providers.values()].map(async (provider) => {
      const health = await provider.health();
      return { kind: provider.kind, mode: health.mode, ok: health.ok };
    })
  );

  if (isProduction && providerModes.some((item) => item.mode === "mock")) {
    blockers.push("mock_providers_detected_in_production");
    unsafeFallbacks.push("mock_provider_live_send_forbidden");
  }

  const safety = evaluateProductionSafety({
    mode: isProduction ? "production" : "foundation",
    approvalRuntimeMode: pendingApproval.mode,
    workerRuntimeMode: workerMode,
    pendingApprovalRepositoryMode: pendingApproval.mode,
    workerRepositoryMode: workerMode,
    realExecutionEnabled: process.env.REAL_EXECUTION_ENABLED === "true",
    providerWritesEnabled: process.env.PROVIDER_WRITES_ENABLED === "true",
    workerAutoStartEnabled: process.env.WORKER_AUTOSTART_ENABLED === "true",
    repositoryUnsupportedFailsClosed: true
  });
  blockers.push(...safety.blockers);
  warnings.push(...safety.warnings);

  const uniqueBlockers = [...new Set(blockers)];
  const uniqueWarnings = [...new Set(warnings)];
  const uniqueMissingEnv = [...new Set(missingEnv)];
  const uniqueRequiredEnv = [...new Set(requiredEnv)];
  const uniqueUnsafeFallbacks = [...new Set(unsafeFallbacks)];

  const overallStatus: ProductionReadinessStatus =
    uniqueBlockers.length > 0 ? "blocked" : uniqueWarnings.length > 0 ? "degraded" : "ready";

  const workerSafe = resolvedWorkerMode === "production" && authMode.persistenceMode === "postgres";
  const providerSafe = !providerModes.some((item) => item.mode === "mock");
  const mutationSafe =
    overallStatus !== "blocked" &&
    databaseConfigured &&
    pendingApproval.mode === "postgres" &&
    approvalExecutionMode !== "foundation" &&
    workerSafe;
  const readOnlySafe = databaseConfigured && hasText(process.env.AUTH_SESSION_SECRET);

  const checks: Array<{ id: string; ok: boolean; severity: "blocker" | "warning" }> = [
    { id: "database_configured", ok: databaseConfigured, severity: databaseConfigured ? "warning" : "blocker" },
    { id: "postgres_persistence", ok: authMode.persistenceMode === "postgres", severity: "blocker" },
    { id: "pending_approval_repository", ok: Boolean(pendingApproval.repository), severity: "blocker" },
    { id: "worker_durable", ok: workerSafe, severity: "blocker" },
    { id: "approval_execution_live", ok: approvalExecutionMode !== "foundation", severity: "blocker" },
    { id: "providers_non_mock", ok: providerSafe, severity: "blocker" }
  ];

  return {
    overallStatus,
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      isProduction,
      persistenceMode: authMode.persistenceMode
    },
    persistence: {
      mode: authMode.persistenceMode,
      databaseConfigured
    },
    auth: {
      sessionSecretConfigured: hasText(process.env.AUTH_SESSION_SECRET),
      demoAuthEnabled: authMode.demoAuthEnabled,
      headerFallbackEnabled: authMode.allowHeaderPrincipalFallback
    },
    database: {
      configured: databaseConfigured,
      urlSource
    },
    approvalExecution: {
      mode: approvalExecutionMode,
      pendingApprovalPersistenceMode: pendingApproval.mode,
      ready: pendingApproval.mode === "postgres" && approvalExecutionMode !== "foundation"
    },
    workerOutbox: {
      workerMode,
      ready: workerMode === "durable" && authMode.persistenceMode === "postgres"
    },
    tenantUsage: {
      persistenceMode: usageLedger.mode,
      ready: usageLedger.mode === "postgres"
    },
    omnichannel: {
      persistenceMode: omnichannel.mode,
      ready: omnichannel.mode === "postgres",
      providerModes
    },
    whatsapp: {
      liveEnvConfigured: missingWhatsApp.length === 0
    },
    localAi: {
      configured: localAiConfigured
    },
    localAgent: {
      configured: localAgentConfigured
    },
    documentGeneration: {
      localOutputConfigured: localAgentConfigured
    },
    billingUsage: {
      dbBacked: usageLedger.mode === "postgres"
    },
    blockers: uniqueBlockers,
    warnings: uniqueWarnings,
    requiredEnv: uniqueRequiredEnv,
    missingEnv: uniqueMissingEnv,
    unsafeFallbacks: uniqueUnsafeFallbacks,
    nextActions: [
      "Eksik env degiskenlerini production secret manager uzerinden tamamla.",
      "PERSISTENCE_MODE=postgres ve WORKER_MODE=durable (veya production) ile canli acilisi dogrula.",
      "Mock/provider foundation modlarini canli entegrasyonla degistirmeden ready bekleme.",
      "Approval ve worker akislari icin dry_run sonucunu canli basari gibi raporlama."
    ],
    mutationSafe,
    readOnlySafe,
    workerSafe,
    providerSafe,
    checks
  };
}

