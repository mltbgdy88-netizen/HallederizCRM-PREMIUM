import type { PendingApprovalRepository, PendingApprovalRequest } from "@hallederiz/domain";
import { getAuthMode } from "./auth-mode";
import type { RequestContext } from "./request-context";

export const APPROVAL_SANDBOX_IDEMPOTENCY = {
  settingsUpdate: "operator_sandbox_v1_platform_settings_update",
  usersCreate: "operator_sandbox_v1_platform_users_create"
} as const;

const SANDBOX_REASONS_BASE = [
  "operator_sandbox_seed",
  "local_demo_controlled_payload",
  "no_external_provider_call"
] as const;

export function isApprovalSandboxSeedRouteEnabled(): boolean {
  const mode = getAuthMode();
  if (mode.isProduction || process.env.NODE_ENV === "production") {
    return false;
  }
  if (process.env.NODE_ENV === "test") {
    return true;
  }
  return mode.persistenceMode === "demo";
}

export interface ApprovalSandboxSeedResult {
  created: PendingApprovalRequest[];
  skipped: Array<{ idempotencyKey: string; approvalRequestId: string; status: string }>;
}

export async function runApprovalSandboxSeed(
  repository: PendingApprovalRepository,
  context: RequestContext
): Promise<ApprovalSandboxSeedResult> {
  const created: PendingApprovalRequest[] = [];
  const skipped: Array<{ idempotencyKey: string; approvalRequestId: string; status: string }> = [];

  const specs: Array<{
    idempotencyKey: string;
    actionKey: string;
    reasons: string[];
    payload: Record<string, unknown>;
  }> = [
    {
      idempotencyKey: APPROVAL_SANDBOX_IDEMPOTENCY.settingsUpdate,
      actionKey: "platform.settings.update",
      reasons: [...SANDBOX_REASONS_BASE, "audit_required:true", "timeline_required:true"],
      payload: {
        sandbox: true,
        summary: "Demo ayar guncelleme talebi (DB mutation yok; dry-run handler).",
        changeSet: { theme: "demo", locale: "tr-TR" }
      }
    },
    {
      idempotencyKey: APPROVAL_SANDBOX_IDEMPOTENCY.usersCreate,
      actionKey: "platform.users.create",
      reasons: [...SANDBOX_REASONS_BASE, "dry_run_only_handler", "real_user_create_disabled"],
      payload: {
        sandbox: true,
        summary: "Demo kullanici olusturma talebi (gercek execution kapali).",
        draftUser: { email: "sandbox.operator@local.invalid", role: "operator_readonly" }
      }
    }
  ];

  for (const spec of specs) {
    const existing = await repository.findByIdempotencyKey(context.tenantId, spec.idempotencyKey);
    if (existing) {
      skipped.push({
        idempotencyKey: spec.idempotencyKey,
        approvalRequestId: existing.approvalRequestId,
        status: existing.status
      });
      continue;
    }

    const item = await repository.createPendingApprovalRequest({
      tenantId: context.tenantId,
      actorId: context.userId,
      actionKey: spec.actionKey,
      reasons: spec.reasons,
      payload: spec.payload,
      idempotencyKey: spec.idempotencyKey,
      auditRequired: true,
      timelineRequired: true
    });
    created.push(item);
  }

  return { created, skipped };
}
