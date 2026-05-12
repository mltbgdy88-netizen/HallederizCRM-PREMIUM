import type { FastifyInstance } from "fastify";
import {
  InMemoryOutboxJobRepository,
  createWorkerRuntimeApp,
  evaluateProductionSafety,
  type WorkerJob
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  DatabaseOutboxJobRepository,
  type DbWorkerJobRecord
} from "@hallederiz/database";
import { assertAnyPermission, assertAuthenticated, withGuards } from "../../shared/auth-guards";
import type { RequestContext } from "../../shared/request-context";

const workerReadPermissions = ["worker.read", "worker.manage", "platform.settings.read"] as const;
const workerReplayPermissions = ["worker.replay", "worker.manage", "platform.settings.write"] as const;

export interface WorkerRouteRepository {
  mode: string;
  repository: InMemoryOutboxJobRepository;
}

export interface WorkerRouteDeps {
  workerRepository?: WorkerRouteRepository | null;
  runtimeApp?: ReturnType<typeof createWorkerRuntimeApp>;
}

function mapDbWorkerJobRecord(record: DbWorkerJobRecord): WorkerJob {
  return {
    jobId: record.jobId,
    tenantId: record.tenantId,
    jobType: record.jobType,
    actionKey: record.actionKey,
    payload: record.payload,
    status: record.status,
    attempts: record.attempts,
    maxAttempts: record.maxAttempts,
    idempotencyKey: record.idempotencyKey,
    availableAt: record.availableAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastError: record.lastError,
    deadLetterReason: record.deadLetterReason,
    lockedAt: record.lockedAt,
    lockedBy: record.lockedBy,
    leaseExpiresAt: record.leaseExpiresAt
  };
}

function resolveFoundationRepository(context: RequestContext): {
  repository: InMemoryOutboxJobRepository | null;
  mode: string;
  reasons: string[];
} {
  if (process.env.NODE_ENV === "production" && context.persistenceMode !== "postgres") {
    return {
      repository: null,
      mode: "unsupported",
      reasons: ["worker_repository_unsupported_in_production"]
    };
  }

  return {
    repository: new InMemoryOutboxJobRepository(),
    mode: "foundation_memory",
    reasons: []
  };
}

async function listOutboxJobsForTenant(
  context: RequestContext,
  foundationRepository: InMemoryOutboxJobRepository
): Promise<WorkerJob[]> {
  if (context.persistenceMode === "postgres") {
    const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!postgresUrl) {
      throw new Error("postgres_config_missing");
    }
    const repository = new DatabaseOutboxJobRepository({
      executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
      persistenceMode: "postgres"
    });
    return (await repository.listJobs(context.tenantId))
      .map(mapDbWorkerJobRecord)
      .filter((job) => job.status !== "dead_letter");
  }

  return foundationRepository.listOutboxJobs(context.tenantId);
}

async function listDeadLetterJobsForTenant(
  context: RequestContext,
  foundationRepository: InMemoryOutboxJobRepository
): Promise<WorkerJob[]> {
  if (context.persistenceMode === "postgres") {
    const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!postgresUrl) {
      throw new Error("postgres_config_missing");
    }
    const repository = new DatabaseOutboxJobRepository({
      executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
      persistenceMode: "postgres"
    });
    return (await repository.listJobs(context.tenantId))
      .map(mapDbWorkerJobRecord)
      .filter((job) => job.status === "dead_letter");
  }

  return foundationRepository.listDeadLetterJobs(context.tenantId);
}

export async function registerWorkerRoutes(server: FastifyInstance, deps: WorkerRouteDeps = {}) {
  const runtimeApp = deps.runtimeApp ?? createWorkerRuntimeApp({ persistenceMode: "foundation_memory" });

  function resolveRepository(context: RequestContext) {
    if (deps.workerRepository === null) {
      return {
        repository: null,
        mode: "none",
        reasons: ["worker_repository_dependency_missing"]
      };
    }
    if (deps.workerRepository) {
      return {
        repository: deps.workerRepository.repository,
        mode: deps.workerRepository.mode,
        reasons: [] as string[]
      };
    }
    return resolveFoundationRepository(context);
  }

  server.get("/worker/health", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, workerReadPermissions)],
      async (context) => {
        const repositoryResolution = resolveRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: repositoryResolution.mode,
            reasons: repositoryResolution.reasons
          });
        }

        const health = runtimeApp.dryRunHealthCheck({
          dryRun: true,
          maxJobsPerTick: 1
        });

        return {
          ok: true,
          tenantId: context.tenantId,
          workerPersistenceMode: repositoryResolution.mode,
          health,
          productionSafety: evaluateProductionSafety({
            mode: process.env.NODE_ENV === "production" ? "production" : "foundation",
            approvalRuntimeMode: context.persistenceMode,
            workerRuntimeMode: repositoryResolution.mode,
            pendingApprovalRepositoryMode: context.persistenceMode,
            workerRepositoryMode: repositoryResolution.mode,
            realExecutionEnabled: false,
            providerWritesEnabled: false,
            workerAutoStartEnabled: false,
            repositoryUnsupportedFailsClosed: true
          })
        };
      }
    )
  );

  server.get("/worker/safety", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, workerReadPermissions)],
      async (context) => {
        const repositoryResolution = resolveRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: repositoryResolution.mode,
            reasons: repositoryResolution.reasons,
            productionSafety: evaluateProductionSafety({
              mode: process.env.NODE_ENV === "production" ? "production" : "foundation",
              approvalRuntimeMode: context.persistenceMode,
              workerRuntimeMode: repositoryResolution.mode,
              pendingApprovalRepositoryMode: context.persistenceMode,
              workerRepositoryMode: repositoryResolution.mode,
              repositoryUnsupportedFailsClosed: true
            })
          });
        }

        const productionSafety = evaluateProductionSafety({
          mode: process.env.NODE_ENV === "production" ? "production" : "foundation",
          approvalRuntimeMode: context.persistenceMode,
          workerRuntimeMode: repositoryResolution.mode,
          pendingApprovalRepositoryMode: context.persistenceMode,
          workerRepositoryMode: repositoryResolution.mode,
          realExecutionEnabled: false,
          providerWritesEnabled: false,
          workerAutoStartEnabled: false,
          repositoryUnsupportedFailsClosed: true
        });

        return {
          ok: productionSafety.ok,
          tenantId: context.tenantId,
          productionSafety,
          approvalRuntimeMode: context.persistenceMode,
          workerRuntimeMode: repositoryResolution.mode,
          realExecutionEnabled: productionSafety.realExecutionEnabled,
          providerWritesEnabled: productionSafety.providerWritesEnabled,
          unsafeBlockers: productionSafety.blockers
        };
      }
    )
  );

  server.get("/worker/outbox", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, workerReadPermissions)],
      async (context) => {
        const repositoryResolution = resolveRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: repositoryResolution.mode,
            reasons: repositoryResolution.reasons
          });
        }

        try {
          const items = await listOutboxJobsForTenant(context, repositoryResolution.repository);
          return {
            items,
            total: items.length,
            workerPersistenceMode: repositoryResolution.mode
          };
        } catch (error) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: context.persistenceMode,
            reasons: [error instanceof Error ? error.message : "worker_repository_error"]
          });
        }
      }
    )
  );

  server.get("/worker/dead-letter", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, workerReadPermissions)],
      async (context) => {
        const repositoryResolution = resolveRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: repositoryResolution.mode,
            reasons: repositoryResolution.reasons
          });
        }

        try {
          const items = await listDeadLetterJobsForTenant(context, repositoryResolution.repository);
          return {
            items,
            total: items.length,
            workerPersistenceMode: repositoryResolution.mode
          };
        } catch (error) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: context.persistenceMode,
            reasons: [error instanceof Error ? error.message : "worker_repository_error"]
          });
        }
      }
    )
  );

  server.post<{ Params: { jobId: string } }>("/worker/dead-letter/:jobId/replay", async (request, reply) =>
    withGuards(
      request,
      reply,
      [assertAuthenticated, (context) => assertAnyPermission(context, workerReplayPermissions)],
      async (context) => {
        const repositoryResolution = resolveRepository(context);
        if (!repositoryResolution.repository) {
          return reply.status(503).send({
            ok: false,
            error: "worker_repository_unavailable",
            message: "Worker repository foundation baglantisi mevcut degil.",
            workerPersistenceMode: repositoryResolution.mode,
            reasons: repositoryResolution.reasons
          });
        }

        if (context.persistenceMode === "postgres") {
          return reply.status(503).send({
            ok: false,
            error: "worker_replay_unsupported",
            message: "DLQ replay foundation bu persistence modunda desteklenmiyor.",
            workerPersistenceMode: repositoryResolution.mode
          });
        }

        const replayed = repositoryResolution.repository.replayDeadLetterJob(
          request.params.jobId,
          context.tenantId
        );
        if (!replayed) {
          return reply.status(404).send({
            ok: false,
            error: "not_found",
            message: "Dead-letter job bulunamadi."
          });
        }

        return {
          ok: true,
          replayed,
          workerPersistenceMode: repositoryResolution.mode,
          reasons: ["dead_letter_replayed_to_pending_foundation"]
        };
      }
    )
  );
}
