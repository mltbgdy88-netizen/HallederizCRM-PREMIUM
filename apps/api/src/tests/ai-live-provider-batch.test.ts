import assert from "node:assert/strict";
import test from "node:test";
import { createSession } from "../shared/session-store";
import { buildRequestContext } from "../shared/request-context";
import { validateAiConfig } from "../shared/service-config";
import { AiRuntimeService } from "../modules/ai-runtime/service";

function withEnv(env: Record<string, string | undefined>, run: () => Promise<void> | void) {
  const snapshot: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    snapshot[key] = process.env[key];
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const key of Object.keys(env)) {
        const value = snapshot[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });
}

function buildAuthedContext() {
  const login = createSession({
    tenantSlug: "hallederiz",
    email: "admin@hallederiz.com",
    password: "demo"
  });
  return buildRequestContext({
    headers: {
      "x-session-token": login.accessToken,
      authorization: `Bearer ${login.accessToken}`
    }
  } as never);
}

test("ai config validator marks missing key as misconfigured in live mode", async () => {
  await withEnv(
    {
      AI_LLM_PROVIDER: "openai",
      AI_STT_PROVIDER: "openai",
      AI_TTS_PROVIDER: "openai",
      OPENAI_API_KEY: undefined
    },
    () => {
      const health = validateAiConfig();
      assert.equal(health.status, "misconfigured");
      assert.equal(health.mode, "fallback");
    }
  );
});

test("ai runtime chat falls back safely when provider is not live", async () => {
  await withEnv(
    {
      AI_LLM_PROVIDER: "mock",
      OPENAI_API_KEY: undefined
    },
    async () => {
      const service = new AiRuntimeService(buildAuthedContext());
      const result = await service.chat("Merhaba");
      assert.equal(result.mode, "fallback");
      assert.equal(result.provider, "mock");
    }
  );
});

test("proposal generation keeps fallback operations when live parse fails", async () => {
  await withEnv(
    {
      AI_LLM_PROVIDER: "openai",
      OPENAI_API_KEY: "test-key",
      AI_MODEL: "gpt-test"
    },
    async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        ({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "JSON olmayan cevap" } }]
          })
        }) as never) as typeof fetch;
      try {
        const service = new AiRuntimeService(buildAuthedContext());
        const result = await service.generateProposal({
          prompt: "Yarin icin siparis olustur",
          inputMode: "text",
          targetType: "order",
          targetId: "order_1",
          targetNo: "SO-1"
        });
        assert.equal(result.proposal.operations.length > 0, true);
        assert.equal(result.proposal.summary.includes("fallback"), true);
      } finally {
        global.fetch = originalFetch;
      }
    }
  );
});
