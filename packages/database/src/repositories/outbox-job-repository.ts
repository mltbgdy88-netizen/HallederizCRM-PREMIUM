import type { QueryExecutor, QueryResultRow } from "../types";

export type DbWorkerJobStatus = "pending" | "processing" | "completed" | "failed" | "dead_letter";

export interface DbWorkerJobRecord {
  jobId: string;
  tenantId: string;
  jobType: string;
  actionKey?: string;
  payload: Record<string, unknown>;
  status: DbWorkerJobStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  availableAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  deadLetterReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  leaseExpiresAt?: string;
}

interface OutboxJobRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  job_type: string;
  action_key: string | null;
  payload: unknown;
  status: DbWorkerJobStatus;
  attempts: number;
  max_attempts: number;
  idempotency_key: string;
  available_at: string;
  created_at: string;
  updated_at: string;
  last_error: string | null;
  dead_letter_reason: string | null;
  locked_at: string | null;
  locked_by: string | null;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

export interface OutboxClaimLeaseOptions {
  workerId?: string;
  claimLeaseMs?: number;
}

export function normalizeOutboxClaimLeaseOptions(options?: OutboxClaimLeaseOptions): Required<OutboxClaimLeaseOptions> {
  return {
    workerId: options?.workerId ?? "worker.foundation",
    claimLeaseMs: Math.max(1000, options?.claimLeaseMs ?? 5 * 60 * 1000)
  };
}

export function mapOutboxClaimLeaseParams(nowIso: string, options?: OutboxClaimLeaseOptions): {
  nowIso: string;
  workerId: string;
  claimLeaseMs: number;
  leaseExpiredBeforeIso: string;
} {
  const normalized = normalizeOutboxClaimLeaseOptions(options);
  const cutoff = new Date(new Date(nowIso).getTime() - normalized.claimLeaseMs).toISOString();
  return {
    nowIso,
    workerId: normalized.workerId,
    claimLeaseMs: normalized.claimLeaseMs,
    leaseExpiredBeforeIso: cutoff
  };
}

export const OUTBOX_ATOMIC_CLAIM_FOUNDATION_METADATA = {
  level: "foundation",
  productionDistributedLock: false,
  usesPostgresSkipLocked: true,
  leaseStorage: "locked_at_locked_by",
  leaseExpiresAtDerived: true,
  claimableStatuses: ["pending", "failed"] as const,
  claimEligibility: {
    availableAtLteNow: true,
    lockedAtNullOrLeaseExpired: true,
    activeLeaseBlocksClaim: true
  }
} as const;

export function buildClaimNextOutboxJobSql(): string {
  return `WITH picked AS (
        SELECT id
        FROM outbox_jobs
        WHERE status IN ('pending', 'failed')
          AND available_at <= $1::timestamptz
          AND (locked_at IS NULL OR locked_at <= $3::timestamptz)
        ORDER BY available_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox_jobs AS jobs
      SET
        status = 'processing',
        attempts = jobs.attempts + 1,
        updated_at = $1::timestamptz,
        locked_at = $1::timestamptz,
        locked_by = $2
      FROM picked
      WHERE jobs.id = picked.id
      RETURNING
        jobs.id, jobs.tenant_id, jobs.job_type, jobs.action_key, jobs.payload, jobs.status, jobs.attempts, jobs.max_attempts,
        jobs.idempotency_key, jobs.available_at, jobs.created_at, jobs.updated_at, jobs.last_error, NULL::text AS dead_letter_reason,
        jobs.locked_at, jobs.locked_by`;
}

export function calculateLeaseExpiresAt(lockedAt: string, claimLeaseMs: number): string {
  return new Date(new Date(lockedAt).getTime() + Math.max(0, claimLeaseMs)).toISOString();
}

export interface OutboxJobClaimEligibilityInput {
  status: DbWorkerJobStatus;
  availableAt: string;
  lockedAt?: string | null;
  nowIso: string;
  leaseExpiredBeforeIso: string;
}

export function isOutboxJobClaimEligible(input: OutboxJobClaimEligibilityInput): boolean {
  return (
    (input.status === "pending" || input.status === "failed") &&
    input.availableAt <= input.nowIso &&
    (input.lockedAt == null || input.lockedAt <= input.leaseExpiredBeforeIso)
  );
}

export function mapClaimedOutboxJobRow(row: OutboxJobRow, claimLeaseMs: number): DbWorkerJobRecord {
  const record = mapOutboxRowToDomainRecord(row);
  if (!record.lockedAt) {
    return record;
  }
  return {
    ...record,
    leaseExpiresAt: calculateLeaseExpiresAt(record.lockedAt, claimLeaseMs)
  };
}

export interface FoundationOutboxClaimableJob {
  jobId: string;
  status: DbWorkerJobStatus;
  availableAt: string;
  lockedAt?: string | null;
  lockedBy?: string | null;
}

export class FoundationOutboxClaimSimulator {
  private readonly jobs: Map<string, FoundationOutboxClaimableJob>;

  constructor(seed: FoundationOutboxClaimableJob[]) {
    this.jobs = new Map(seed.map((job) => [job.jobId, { ...job }]));
  }

  claimNext(now = new Date().toISOString(), options?: OutboxClaimLeaseOptions): FoundationOutboxClaimableJob | undefined {
    const claimParams = mapOutboxClaimLeaseParams(now, options);
    const candidates = [...this.jobs.values()]
      .filter((job) =>
        isOutboxJobClaimEligible({
          status: job.status,
          availableAt: job.availableAt,
          lockedAt: job.lockedAt,
          nowIso: claimParams.nowIso,
          leaseExpiredBeforeIso: claimParams.leaseExpiredBeforeIso
        })
      )
      .sort((a, b) => a.availableAt.localeCompare(b.availableAt));
    const next = candidates[0];
    if (!next) {
      return undefined;
    }
    const claimed: FoundationOutboxClaimableJob = {
      ...next,
      status: "processing",
      lockedAt: claimParams.nowIso,
      lockedBy: claimParams.workerId
    };
    this.jobs.set(claimed.jobId, claimed);
    return claimed;
  }
}

function assertNonEmpty(value: string, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function parseObjectPayload(value: unknown): Record<string, unknown> {
  if (!value) {
    return {};
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

export function mapOutboxRowToDomainRecord(row: OutboxJobRow): DbWorkerJobRecord {
  return {
    jobId: row.id,
    tenantId: row.tenant_id,
    jobType: row.job_type,
    actionKey: row.action_key ?? undefined,
    payload: parseObjectPayload(row.payload),
    status: row.status,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    idempotencyKey: row.idempotency_key,
    availableAt: row.available_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastError: row.last_error ?? undefined,
    deadLetterReason: row.dead_letter_reason ?? undefined,
    lockedAt: row.locked_at ?? undefined,
    lockedBy: row.locked_by ?? undefined
  };
}

export function mapOutboxDomainRecordToSqlParams(job: DbWorkerJobRecord): unknown[] {
  assertNonEmpty(job.jobId, "job_id");
  assertNonEmpty(job.tenantId, "tenant_id");
  assertNonEmpty(job.jobType, "job_type");
  assertNonEmpty(job.idempotencyKey, "idempotency_key");
  return [
    job.jobId,
    job.tenantId,
    job.jobType,
    job.actionKey ?? null,
    stringifyJson(job.payload),
    job.status,
    job.attempts,
    job.maxAttempts,
    job.idempotencyKey,
    job.availableAt,
    job.createdAt,
    job.updatedAt,
    job.lastError ?? null,
    job.lockedAt ?? null,
    job.lockedBy ?? null
  ];
}

export class DatabaseOutboxJobRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("db_repository_postgres_mode_required");
    }
  }

  async enqueue(job: DbWorkerJobRecord): Promise<DbWorkerJobRecord> {
    this.assertPersistenceSupported();
    const params = mapOutboxDomainRecordToSqlParams(job);
    const rows = await this.executor.query<OutboxJobRow>(
      `INSERT INTO outbox_jobs (
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, locked_at, locked_by
      )
      VALUES (
        $1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10::timestamptz,$11::timestamptz,$12::timestamptz,$13,$14::timestamptz,$15
      )
      ON CONFLICT (tenant_id, idempotency_key)
      DO UPDATE SET
        job_type = EXCLUDED.job_type,
        action_key = EXCLUDED.action_key,
        payload = EXCLUDED.payload,
        status = EXCLUDED.status,
        attempts = EXCLUDED.attempts,
        max_attempts = EXCLUDED.max_attempts,
        available_at = EXCLUDED.available_at,
        updated_at = EXCLUDED.updated_at,
        last_error = EXCLUDED.last_error,
        locked_at = EXCLUDED.locked_at,
        locked_by = EXCLUDED.locked_by
      RETURNING
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by`,
      params
    );
    if (!rows[0]) {
      throw new Error("outbox_enqueue_failed");
    }
    return mapOutboxRowToDomainRecord(rows[0]);
  }

  async claimNext(
    now = new Date().toISOString(),
    claimOptions?: string | OutboxClaimLeaseOptions
  ): Promise<DbWorkerJobRecord | undefined> {
    this.assertPersistenceSupported();
    const resolvedOptions =
      typeof claimOptions === "string" ? normalizeOutboxClaimLeaseOptions({ workerId: claimOptions }) : claimOptions;
    const claimParams = mapOutboxClaimLeaseParams(now, resolvedOptions);
    const rows = await this.executor.query<OutboxJobRow>(buildClaimNextOutboxJobSql(), [
      claimParams.nowIso,
      claimParams.workerId,
      claimParams.leaseExpiredBeforeIso
    ]);
    return rows[0] ? mapClaimedOutboxJobRow(rows[0], claimParams.claimLeaseMs) : undefined;
  }

  async complete(jobId: string, completedAt = new Date().toISOString()): Promise<DbWorkerJobRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(jobId, "job_id");
    const rows = await this.executor.query<OutboxJobRow>(
      `UPDATE outbox_jobs
      SET status = 'completed', updated_at = $2::timestamptz, locked_at = NULL, locked_by = NULL
      WHERE id = $1
      RETURNING
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by`,
      [jobId, completedAt]
    );
    return rows[0] ? mapOutboxRowToDomainRecord(rows[0]) : undefined;
  }

  async fail(
    jobId: string,
    errorMessage: string,
    nextAvailableAt: string,
    failedAt = new Date().toISOString()
  ): Promise<DbWorkerJobRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(jobId, "job_id");
    const rows = await this.executor.query<OutboxJobRow>(
      `UPDATE outbox_jobs
      SET
        status = 'failed',
        updated_at = $2::timestamptz,
        last_error = $3,
        available_at = $4::timestamptz,
        locked_at = NULL,
        locked_by = NULL
      WHERE id = $1
      RETURNING
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by`,
      [jobId, failedAt, errorMessage, nextAvailableAt]
    );
    return rows[0] ? mapOutboxRowToDomainRecord(rows[0]) : undefined;
  }

  async moveToDeadLetter(jobId: string, reason: string, movedAt = new Date().toISOString()): Promise<DbWorkerJobRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(jobId, "job_id");
    const movedRows = await this.executor.query<OutboxJobRow>(
      `UPDATE outbox_jobs
      SET
        status = 'dead_letter',
        updated_at = $2::timestamptz,
        locked_at = NULL,
        locked_by = NULL
      WHERE id = $1
      RETURNING
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, $3::text AS dead_letter_reason, locked_at, locked_by`,
      [jobId, movedAt, reason]
    );
    const moved = movedRows[0];
    if (!moved) {
      return undefined;
    }

    await this.executor.query(
      `INSERT INTO dead_letter_jobs (
        id, tenant_id, original_job_id, job_type, action_key, payload, attempts, max_attempts, idempotency_key,
        dead_letter_reason, last_error, created_at, moved_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12::timestamptz,$13::timestamptz
      )`,
      [
        `dlq_${moved.id}`,
        moved.tenant_id,
        moved.id,
        moved.job_type,
        moved.action_key,
        stringifyJson(parseObjectPayload(moved.payload)),
        moved.attempts,
        moved.max_attempts,
        moved.idempotency_key,
        reason,
        moved.last_error,
        moved.created_at,
        movedAt
      ]
    );

    return mapOutboxRowToDomainRecord(moved);
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<DbWorkerJobRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(idempotencyKey, "idempotency_key");
    const activeRows = await this.executor.query<OutboxJobRow>(
      `SELECT
        id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
        created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by
      FROM outbox_jobs
      WHERE tenant_id = $1 AND idempotency_key = $2
      LIMIT 1`,
      [tenantId, idempotencyKey]
    );
    if (activeRows[0]) {
      return mapOutboxRowToDomainRecord(activeRows[0]);
    }

    const deadRows = await this.executor.query<OutboxJobRow>(
      `SELECT
        id AS id,
        tenant_id,
        job_type,
        action_key,
        payload,
        'dead_letter'::text AS status,
        attempts,
        max_attempts,
        idempotency_key,
        moved_at AS available_at,
        created_at,
        moved_at AS updated_at,
        last_error,
        dead_letter_reason,
        NULL::timestamptz AS locked_at,
        NULL::text AS locked_by
      FROM dead_letter_jobs
      WHERE tenant_id = $1 AND idempotency_key = $2
      ORDER BY moved_at DESC
      LIMIT 1`,
      [tenantId, idempotencyKey]
    );
    return deadRows[0] ? mapOutboxRowToDomainRecord(deadRows[0]) : undefined;
  }

  async listJobs(tenantId?: string): Promise<DbWorkerJobRecord[]> {
    this.assertPersistenceSupported();
    const outboxRows = tenantId
      ? await this.executor.query<OutboxJobRow>(
          `SELECT
            id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
            created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by
          FROM outbox_jobs
          WHERE tenant_id = $1
          ORDER BY created_at ASC`,
          [tenantId]
        )
      : await this.executor.query<OutboxJobRow>(
          `SELECT
            id, tenant_id, job_type, action_key, payload, status, attempts, max_attempts, idempotency_key, available_at,
            created_at, updated_at, last_error, NULL::text AS dead_letter_reason, locked_at, locked_by
          FROM outbox_jobs
          ORDER BY created_at ASC`
        );

    const deadRows = tenantId
      ? await this.executor.query<OutboxJobRow>(
          `SELECT
            id,
            tenant_id,
            job_type,
            action_key,
            payload,
            'dead_letter'::text AS status,
            attempts,
            max_attempts,
            idempotency_key,
            moved_at AS available_at,
            created_at,
            moved_at AS updated_at,
            last_error,
            dead_letter_reason,
            NULL::timestamptz AS locked_at,
            NULL::text AS locked_by
          FROM dead_letter_jobs
          WHERE tenant_id = $1
          ORDER BY moved_at ASC`,
          [tenantId]
        )
      : await this.executor.query<OutboxJobRow>(
          `SELECT
            id,
            tenant_id,
            job_type,
            action_key,
            payload,
            'dead_letter'::text AS status,
            attempts,
            max_attempts,
            idempotency_key,
            moved_at AS available_at,
            created_at,
            moved_at AS updated_at,
            last_error,
            dead_letter_reason,
            NULL::timestamptz AS locked_at,
            NULL::text AS locked_by
          FROM dead_letter_jobs
          ORDER BY moved_at ASC`
        );

    return [...outboxRows, ...deadRows]
      .map((row) => mapOutboxRowToDomainRecord(row))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
