import assert from "node:assert/strict";
import test from "node:test";
import { runStagingIntegrationServiceTest } from "./run-staging-integration-test";

test("runStagingIntegrationServiceTest rejects unknown service keys", async () => {
  await assert.rejects(() => runStagingIntegrationServiceTest("unknown"), /Bilinmeyen servis/);
});
