import type { WorkerHealthResponse, WorkerOutboxJobSnapshot } from "../types";

/** Kapali `<details>` ozeti: outbox/DLQ toplamlari ve varsa repo sayimlari. */
export function formatWorkerQueueHeadline(
  workerHealth: WorkerHealthResponse | null | undefined,
  outboxTotal: number | undefined,
  dlqTotal: number | undefined,
  loading: boolean
): string {
  if (loading) return "Kuyruk verileri yukleniyor...";
  if (workerHealth?.ok === false) {
    return workerHealth.message || workerHealth.error || "Worker health alinamadi";
  }
  const bits: string[] = [];
  if (typeof outboxTotal === "number") bits.push(`outbox ${outboxTotal}`);
  if (typeof dlqTotal === "number") bits.push(`DLQ ${dlqTotal}`);
  const c = workerHealth?.counts;
  if (c) bits.push(`bekleyen ${c.pending} · claim ${c.claimed} · hata ${c.failed}`);
  if (!bits.length) return "Tablolari gormek icin acin";
  return bits.join(" · ");
}

export function takeJobsPreview(items: WorkerOutboxJobSnapshot[] | undefined, limit: number): WorkerOutboxJobSnapshot[] {
  if (!Array.isArray(items) || !items.length) return [];
  return items.slice(0, Math.max(0, limit));
}

export function formatJobAttempts(job: WorkerOutboxJobSnapshot): string {
  const a = job.attempts;
  const m = job.maxAttempts;
  if (typeof a === "number" && typeof m === "number") return `${a}/${m}`;
  if (typeof a === "number") return String(a);
  return "—";
}
