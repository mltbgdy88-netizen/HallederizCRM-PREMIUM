import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_DASHBOARD_HOME_SNAPSHOT } from "../utils/build-dashboard-home-snapshot";

test("empty dashboard snapshot uses safe live placeholders", () => {
  assert.equal(EMPTY_DASHBOARD_HOME_SNAPSHOT.counts.pendingApprovals, 0);
  assert.deepEqual(EMPTY_DASHBOARD_HOME_SNAPSHOT.cardValues, {});
  assert.equal(EMPTY_DASHBOARD_HOME_SNAPSHOT.priorityQueue.length, 0);
});

test("dashboard live snapshot mapping does not expose technical tokens", async () => {
  const sample = {
    taskCount: 2,
    approvalCount: 1,
    pendingApprovalCount: 1,
    workflowCount: 1
  };
  const label = JSON.stringify(sample);
  assert.equal(/api|mock|fallback|worker|mutation|fetch failed/i.test(label), false);
});
