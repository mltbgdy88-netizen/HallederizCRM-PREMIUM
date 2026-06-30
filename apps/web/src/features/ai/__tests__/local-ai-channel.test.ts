import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLocalAiHealthSnapshot } from "../utils/normalize-local-ai-health";
import { canRunLocalAiInsights, mapLocalAiChannelHealthView } from "../utils/map-local-ai-channel-view";
import { isAiRelatedApprovalAction } from "../utils/is-ai-related-approval";

test("normalizeLocalAiHealthSnapshot maps health item", () => {
  const snapshot = normalizeLocalAiHealthSnapshot({
    state: "ready",
    provider: "ollama",
    configured: true,
    ready: true,
    status: "healthy",
    message: "Model ready"
  });
  assert.ok(snapshot);
  assert.equal(snapshot?.ready, true);
  assert.equal(snapshot?.state, "ready");
});

test("normalizeLocalAiHealthSnapshot returns null for invalid payload", () => {
  assert.equal(normalizeLocalAiHealthSnapshot(null), null);
});

test("mapLocalAiChannelHealthView ready state", () => {
  const view = mapLocalAiChannelHealthView(
    {
      state: "ready",
      provider: "ollama",
      configured: true,
      ready: true,
      status: "healthy",
      message: "Hazır"
    },
    null,
    { useDemoData: false }
  );
  assert.equal(view.dotTone, "ok");
  assert.match(view.statusLine, /hazır/i);
});

test("canRunLocalAiInsights allows demo mode", () => {
  assert.equal(canRunLocalAiInsights(null, null, true), true);
});

test("isAiRelatedApprovalAction detects ai action keys", () => {
  assert.equal(isAiRelatedApprovalAction("platform.ai.proposal"), true);
  assert.equal(isAiRelatedApprovalAction("create_order"), false);
});
