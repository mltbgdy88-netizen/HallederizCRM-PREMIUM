"use client";

import type { ApprovalClientError, WorkerHealthResponse, WorkerJobListResponse } from "../types";
import { summarizeWorkerHealth } from "../utils/inbox-helpers";
import { formatJobAttempts, formatWorkerQueueHeadline, takeJobsPreview } from "../utils/worker-queue-observability";

const ROW_LIMIT = 8;

function mapClientError(error: ApprovalClientError | null | undefined): string | null {
  if (!error) return null;
  return error.message?.trim() || error.kind;
}

export function WorkerQueueObservabilityPanel({
  workerHealth,
  outbox,
  deadLetter,
  outboxError,
  deadLetterError,
  loading
}: {
  workerHealth: WorkerHealthResponse | null;
  outbox: WorkerJobListResponse | null;
  deadLetter: WorkerJobListResponse | null;
  outboxError: ApprovalClientError | null;
  deadLetterError: ApprovalClientError | null;
  loading: boolean;
}) {
  const outboxRows = takeJobsPreview(outbox?.items, ROW_LIMIT);
  const dlqRows = takeJobsPreview(deadLetter?.items, ROW_LIMIT);
  const oErr = mapClientError(outboxError);
  const dErr = mapClientError(deadLetterError);
  const headline = formatWorkerQueueHeadline(workerHealth, outbox?.total, deadLetter?.total, loading);

  return (
    <details className="hz-approvals-worker-observe-details">
      <summary className="hz-approvals-worker-observe-summary-row">
        <span className="hz-approvals-worker-observe-summary-title">Worker kuyrugu / DLQ</span>
        <span className="hz-approvals-worker-observe-summary-meta" title={loading ? undefined : summarizeWorkerHealth(workerHealth)}>
          {headline}
        </span>
      </summary>

      <div className="hz-approvals-worker-observe hz-approvals-worker-observe--inner">
        <p className="hz-approvals-inbox-muted hz-approvals-worker-observe-lead">
          Salt okunur: `/worker/health` sayimlari, `/worker/outbox` ve `/worker/dead-letter` listeleri. Idempotency anahtari
          islerin tekrarlanabilirligini izlemek icin listelenir.
        </p>

        <p className="hz-approvals-worker-observe-summary" role="status">
          {loading ? "Kuyruk verileri yukleniyor..." : summarizeWorkerHealth(workerHealth)}
        </p>

        {(oErr || dErr) && (
          <p className="hz-approvals-worker-observe-warn" role="alert">
            {[oErr && `Outbox: ${oErr}`, dErr && `DLQ: ${dErr}`].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="hz-approvals-worker-observe-grid">
          <div className="hz-approvals-worker-observe-card">
            <h5 className="hz-approvals-worker-observe-card-title">Outbox ({outbox?.total ?? "—"})</h5>
            {outboxRows.length === 0 ? (
              <p className="hz-approvals-inbox-muted">Gosterilecek is yok veya liste alinamadi.</p>
            ) : (
              <div className="hz-approvals-worker-observe-table-wrap">
                <table className="hz-approvals-worker-observe-table">
                  <thead>
                    <tr>
                      <th scope="col">Is</th>
                      <th scope="col">Durum</th>
                      <th scope="col">Deneme</th>
                      <th scope="col">Idempotency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outboxRows.map((job) => (
                      <tr key={job.jobId}>
                        <td className="hz-approvals-worker-observe-mono">{job.jobId}</td>
                        <td>{job.status}</td>
                        <td>{formatJobAttempts(job)}</td>
                        <td className="hz-approvals-worker-observe-mono">{job.idempotencyKey ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="hz-approvals-worker-observe-card hz-approvals-worker-observe-card--dlq">
            <h5 className="hz-approvals-worker-observe-card-title">Dead letter ({deadLetter?.total ?? "—"})</h5>
            {dlqRows.length === 0 ? (
              <p className="hz-approvals-inbox-muted">DLQ kaydi yok veya liste alinamadi.</p>
            ) : (
              <div className="hz-approvals-worker-observe-table-wrap">
                <table className="hz-approvals-worker-observe-table">
                  <thead>
                    <tr>
                      <th scope="col">Is</th>
                      <th scope="col">Deneme</th>
                      <th scope="col">Idempotency</th>
                      <th scope="col">Neden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dlqRows.map((job) => (
                      <tr key={job.jobId}>
                        <td className="hz-approvals-worker-observe-mono">{job.jobId}</td>
                        <td>{formatJobAttempts(job)}</td>
                        <td className="hz-approvals-worker-observe-mono">{job.idempotencyKey ?? "—"}</td>
                        <td className="hz-approvals-worker-observe-reason">{job.deadLetterReason ?? job.lastError ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
