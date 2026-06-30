import assert from "node:assert/strict";
import test from "node:test";
import type { WorkerHealthResponse } from "../types";
import { formatJobAttempts, formatWorkerQueueHeadline, takeJobsPreview } from "../utils/worker-queue-observability";

test("formatWorkerQueueHeadline shows totals and repo counts", () => {
  const health: WorkerHealthResponse = {
    ok: true,
    counts: { pending: 2, claimed: 1, failed: 0, deadLetter: 1 }
  };
  const line = formatWorkerQueueHeadline(health, 3, 1, false);
  assert.match(line, /outbox 3/);
  assert.match(line, /DLQ 1/);
  assert.match(line, /bekleyen 2/);
});

test("formatWorkerQueueHeadline loading", () => {
  assert.match(formatWorkerQueueHeadline(null, undefined, undefined, true), /yükleniyor|yukleniyor/i);
});

test("takeJobsPreview caps rows", () => {
  const jobs = [{ jobId: "a" }, { jobId: "b" }, { jobId: "c" }] as never[];
  assert.equal(takeJobsPreview(jobs, 2).length, 2);
  assert.equal(takeJobsPreview(undefined, 5).length, 0);
});

test("formatJobAttempts shows ratio or dash", () => {
  assert.equal(formatJobAttempts({ jobId: "x", jobType: "t", status: "pending", attempts: 2, maxAttempts: 5 }), "2/5");
  assert.equal(formatJobAttempts({ jobId: "x", jobType: "t", status: "pending", attempts: 1 }), "1");
  assert.equal(formatJobAttempts({ jobId: "x", jobType: "t", status: "pending" }), "—");
});
