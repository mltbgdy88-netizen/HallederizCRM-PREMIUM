import type { FastifyInstance } from "fastify";
import {
  InMemoryApprovalExecutionLogRepository,
  InMemoryOutboxJobRepository,
  dispatchApprovedAction,
  type PendingApprovalRepository
} from "@hallederiz/domain";
import {
  createDatabaseTransactionRunner,
  createQueryExecutor,
  DatabaseApprovalExecutionLogRepository,
  DatabaseOutboxJobRepository,
  executeApprovalWithOutboxBridge,
  type ExecuteApprovalWithOutboxBridgeResult,
  type TransactionalApprovalExecutionRequest
} from "@hallederiz/database";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import { readPermissions, requireReadAccess } from "../../shared/read-guards";
import type { RequestContext } from "../../shared/request-context";
import {
  resolvePendingApprovalRepository,
  type PendingApprovalRepositoryResolution
} from "../../shared/approval-repository-runtime";

interface ApprovalPendingRepository {
  mode: string;
  repository: PendingApprovalRepository;
}

type ApprovalBridgeTrigger = (
  context: RequestContext,
  request: TransactionalApprovalExecutionRequest
) => Promise<ExecuteApprovalWithOutboxBridgeResult>;

export interface ApprovalRouteDeps {
  pendingRepository?: ApprovalPendingRepository | null;
  bridgeTrigger?: ApprovalBridgeTrigger | null;
}

function createDefaultBridgeTrigger(): ApprovalBridgeTrigger {
  const foundationRunner = createDatabaseTransactionRunner(createQueryExecutor({ mode: "demo" }));
  const foundationExecutionRepository = new InMemoryApprovalExecutionLogRepository();
  const foundationOutboxRepository = new InMemoryOutboxJobRepository();

  return async (context, request) => {
    if (context.persistenceMode === "postgres") {
      const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
      const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
      const runner = createDatabaseTransactionRunner(executor);
      const executionRepository = new DatabaseApprovalExecutionLogRepository({
        executor,
        persistenceMode: "postgres"
      });
      const outboxRepository = new DatabaseOutboxJobRepository({
        executor,
        persistenceMode: "postgres"
      });
      return executeApprovalWithOutboxBridge(request, {
        dispatchApprovedAction: dispatchApprovedAction,
        transactionRunner: runner,
        approvalExecutionRepository: executionRepository,
        outboxRepository,
        outboxJobConfig: {
          jobType: "approval.execution.dispatch",
          maxAttempts: 3
        }
      });
    }

    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        status: "unsupported",
        executionLogPersisted: false,
        auditEventPersisted: false,
        timelineEventPersisted: false,
        outboxJobEnqueued: false,
        outboxDuplicate: false,
        transactionMode: "unsupported",
        persistenceMode: "none",
        reasons: ["foundation_bridge_disabled_in_production"]
      };
    }

    return executeApprovalWithOutboxBridge(request, {
      dispatchApprovedAction: dispatchApprovedAction,
      transactionRunner: foundationRunner,
      approvalExecutionRepository: foundationExecutionRepository,
      outboxRepository: foundationOutboxRepository,
      outboxJobConfig: {
        jobType: "approval.execution.dispatch",
        maxAttempts: 3
      }
    });
  };
}

function mapDecisionFailure(reason: string): { statusCode: number; body: Record<string, unknown> } {
  if (reason === "tenant_mismatch") {
    return {
      statusCode: 404,
      body: { ok: false, error: "not_found", message: "Approval istegi bulunamadi." }
    };
  }
  if (reason === "approval_not_found") {
    return {
      statusCode: 404,
      body: { ok: false, error: "not_found", message: "Approval istegi bulunamadi." }
    };
  }
  if (reason === "approval_already_approved") {
    return {
      statusCode: 409,
      body: { ok: false, error: "already_approved", message: "Approval istegi zaten onaylanmis." }
    };
  }
  if (reason === "approval_already_rejected") {
    return {
      statusCode: 409,
      body: { ok: false, error: "already_rejected", message: "Approval istegi zaten reddedilmis." }
    };
  }
  return {
    statusCode: 409,
    body: { ok: false, error: "invalid_state", message: "Approval istegi bu durumda degistirilemez." }
  };
}

export async function registerApprovalRoutes(server: FastifyInstance, deps: ApprovalRouteDeps = {}) {
  const pendingRepository = deps.pendingRepository;
  const bridgeTrigger = deps.bridgeTrigger === undefined ? createDefaultBridgeTrigger() : deps.bridgeTrigger;

  function resolveRepository(context: RequestContext): PendingApprovalRepositoryResolution {
    if (pendingRepository === null) {
      return {
        repository: null,
        mode: "none",
        skipped: true,
        reasons: ["approval_repository_dependency_missing"]
      };
    }

    if (pendingRepository) {
      return {
        repository: pendingRepository.repository,
        mode: pendingRepository.mode as PendingApprovalRepositoryResolution["mode"],
        skipped: false,
        reasons: []
      };
    }

    return resolvePendingApprovalRepository(context);
  }

  server.get("/platform/approvals", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.approvals), async (context) => {
      const repositoryResolution = resolveRepository(context);
      if (!repositoryResolution.repository) {
        return reply.status(503).send({
          ok: false,
          error: "approval_repository_unavailable",
          message: "Approval repository foundation baglantisi mevcut degil.",
          approvalPersistenceMode: repositoryResolution.mode,
          reasons: repositoryResolution.reasons
        });
      }

      const items = await repositoryResolution.repository.listPendingApprovalRequests(context.tenantId);
      return {
        items,
        total: items.length,
        repositoryMode: repositoryResolution.mode
      };
    })
  );

  server.get<{ Params: { approvalRequestId: string } }>("/platform/approvals/:approvalRequestId", async (request, reply) =>
    withGuards(request, reply, requireReadAccess(readPermissions.approvals), async (context) => {
      const repositoryResolution = resolveRepository(context);
      if (!repositoryResolution.repository) {
        return reply.status(503).send({
          ok: false,
          error: "approval_repository_unavailable",
          message: "Approval repository foundation baglantisi mevcut degil.",
          approvalPersistenceMode: repositoryResolution.mode,
          reasons: repositoryResolution.reasons
        });
      }

      const item = await repositoryResolution.repository.getPendingApprovalRequest(
        request.params.approvalRequestId,
        context.tenantId
      );
      if (!item) {
        return reply.status(404).send({
          ok: false,
          error: "not_found",
          message: "Approval istegi bulunamadi."
        });
      }
      return { item };
    })
  );

  server.post<{ Params: { approvalRequestId: string } }>(
    "/platform/approvals/:approvalRequestId/approve",
    async (request, reply) =>
      withGuards(
        request,
        reply,
        [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.approve", "approvals.write", "approvals.manage"])],
        async (context) => {
          const repositoryResolution = resolveRepository(context);
          if (!repositoryResolution.repository) {
            return reply.status(503).send({
              ok: false,
              error: "approval_repository_unavailable",
              message: "Approval repository foundation baglantisi mevcut degil.",
              approvalPersistenceMode: repositoryResolution.mode,
              reasons: repositoryResolution.reasons
            });
          }
          if (!bridgeTrigger) {
            return reply.status(503).send({
              ok: false,
              error: "approval_bridge_unavailable",
              message: "Transactional approval bridge foundation baglantisi mevcut degil."
            });
          }

          const approvalRequest = await repositoryResolution.repository.getPendingApprovalRequest(
            request.params.approvalRequestId,
            context.tenantId
          );
          if (!approvalRequest) {
            return reply.status(404).send({
              ok: false,
              error: "not_found",
              message: "Approval istegi bulunamadi."
            });
          }

          if (approvalRequest.status === "approved") {
            return {
              ok: true,
              duplicate: true,
              approvalRequestId: approvalRequest.approvalRequestId,
              status: "approved",
              executionId: approvalRequest.executionId,
              outboxJobId: approvalRequest.outboxJobId,
              reasons: ["already_approved"]
            };
          }

          if (approvalRequest.status === "rejected") {
            return reply.status(409).send({
              ok: false,
              approvalRequestId: approvalRequest.approvalRequestId,
              status: "rejected",
              reasons: ["approval_already_rejected"]
            });
          }

          const bridgeRequest: TransactionalApprovalExecutionRequest = {
            tenantId: approvalRequest.tenantId,
            approvalRequestId: approvalRequest.approvalRequestId,
            actionKey: approvalRequest.actionKey,
            actorId: approvalRequest.actorId,
            approvedBy: context.userId,
            payload: approvalRequest.payload ?? {},
            idempotencyKey: approvalRequest.idempotencyKey,
            requestedAt: approvalRequest.requestedAt,
            approvedAt: new Date().toISOString()
          };

          const bridgeResult = await bridgeTrigger(context, bridgeRequest);
          if (!bridgeResult.ok || !bridgeResult.executionResult) {
            return reply.status(409).send({
              ok: false,
              approvalRequestId: approvalRequest.approvalRequestId,
              status: "pending",
              bridgeResult: {
                status: bridgeResult.status,
                reasons: bridgeResult.reasons,
                transactionMode: bridgeResult.transactionMode,
                persistenceMode: bridgeResult.persistenceMode
              }
            });
          }

          const decision = await repositoryResolution.repository.markPendingApprovalApproved({
            approvalRequestId: approvalRequest.approvalRequestId,
            tenantId: context.tenantId,
            approvedBy: context.userId,
            approvedAt: new Date().toISOString(),
            executionId: bridgeResult.executionResult.executionId,
            outboxJobId: bridgeResult.outboxJob?.jobId,
            bridgeReasons: bridgeResult.reasons,
            bridgeTransactionMode: bridgeResult.transactionMode,
            bridgePersistenceMode: bridgeResult.persistenceMode
          });

          if (!decision.ok) {
            const failure = mapDecisionFailure(decision.reason);
            return reply.status(failure.statusCode).send(failure.body);
          }

          return {
            ok: true,
            approvalRequestId: decision.item.approvalRequestId,
            status: decision.item.status,
            executionId: bridgeResult.executionResult.executionId,
            outboxJobId: bridgeResult.outboxJob?.jobId,
            executionResult: bridgeResult.executionResult,
            bridgeResult: {
              transactionMode: bridgeResult.transactionMode,
              persistenceMode: bridgeResult.persistenceMode,
              outboxJobEnqueued: bridgeResult.outboxJobEnqueued,
              outboxDuplicate: bridgeResult.outboxDuplicate,
              reasons: bridgeResult.reasons
            },
            approvalPersistenceMode: repositoryResolution.mode,
            auditMetadata: bridgeResult.executionResult.auditEvent,
            timelineMetadata: bridgeResult.executionResult.timelineEvent,
            reasons: bridgeResult.executionResult.reasons
          };
        }
      )
  );

  server.post<{ Params: { approvalRequestId: string }; Body: { reason?: string } }>(
    "/platform/approvals/:approvalRequestId/reject",
    async (request, reply) =>
      withGuards(
        request,
        reply,
        [assertAuthenticated, (context) => assertAnyPermission(context, ["approvals.reject", "approvals.write", "approvals.manage"])],
        async (context) => {
          const repositoryResolution = resolveRepository(context);
          if (!repositoryResolution.repository) {
            return reply.status(503).send({
              ok: false,
              error: "approval_repository_unavailable",
              message: "Approval repository foundation baglantisi mevcut degil.",
              approvalPersistenceMode: repositoryResolution.mode,
              reasons: repositoryResolution.reasons
            });
          }

          const approvalRequest = await repositoryResolution.repository.getPendingApprovalRequest(
            request.params.approvalRequestId,
            context.tenantId
          );
          if (!approvalRequest) {
            return reply.status(404).send({
              ok: false,
              error: "not_found",
              message: "Approval istegi bulunamadi."
            });
          }

          const decision = await repositoryResolution.repository.markPendingApprovalRejected({
            approvalRequestId: approvalRequest.approvalRequestId,
            tenantId: context.tenantId,
            rejectedBy: context.userId,
            rejectedAt: new Date().toISOString(),
            reason: request.body?.reason
          });

          if (!decision.ok) {
            const failure = mapDecisionFailure(decision.reason);
            return reply.status(failure.statusCode).send(failure.body);
          }

          return {
            ok: true,
            approvalRequestId: decision.item.approvalRequestId,
            status: decision.item.status,
            rejectedBy: decision.item.rejectedBy,
            rejectedAt: decision.item.rejectedAt,
            reason: decision.item.rejectReason,
            approvalPersistenceMode: repositoryResolution.mode
          };
        }
      )
  );
}
