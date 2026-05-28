import assert from "node:assert/strict";
import test from "node:test";
import { AiRuntimeService } from "../modules/ai-runtime/service";
import { validateAiConfig } from "../shared/service-config";
import type { RequestContext } from "../shared/request-context";
import { withEnv } from "./test-env";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo"
};

test("local AI config reads provider URL and timeout", async () => {
  await withEnv(
    {
      AI_PROVIDER: "local",
      LOCAL_AI_SERVICE_URL: "http://127.0.0.1:8008",
      LOCAL_AI_TIMEOUT_MS: "30000"
    },
    () => {
      const health = validateAiConfig();
      assert.equal(health.status, "healthy");
      assert.equal(health.mode, "live");
      assert.equal(health.details.primaryProvider, "local");
      assert.equal(health.details.localServiceUrl, "http://127.0.0.1:8008");
      assert.equal(health.details.localTimeoutMs, 30000);
    }
  );
});

test("local AI config reports invalid service URL as misconfigured", async () => {
  await withEnv(
    {
      AI_PROVIDER: "local",
      LOCAL_AI_SERVICE_URL: "not-a-url"
    },
    () => {
      const health = validateAiConfig();
      assert.equal(health.status, "misconfigured");
      assert.equal(health.configured, false);
      assert.deepEqual(health.details.missing, ["LOCAL_AI_SERVICE_URL"]);
    }
  );
});

test("local AI health fetch failure returns degraded result", async () => {
  await withEnv(
    {
      AI_PROVIDER: "local",
      LOCAL_AI_SERVICE_URL: "http://127.0.0.1:8008",
      LOCAL_AI_TIMEOUT_MS: "50"
    },
    async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (async () => {
        throw new Error("connection refused");
      }) as typeof fetch;
      try {
        const health = await new AiRuntimeService(context).checkLocalProviderHealth();
        assert.equal(health.status, "degraded");
        assert.match(health.reason, /connection refused/);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

test("local AI chat forwards text prompt to service", async () => {
  await withEnv(
    {
      AI_PROVIDER: "local",
      LOCAL_AI_SERVICE_URL: "http://127.0.0.1:8008"
    },
    async () => {
      const originalFetch = globalThis.fetch;
      let requestedUrl = "";
      globalThis.fetch = (async (input, init) => {
        requestedUrl = String(input);
        assert.equal(init?.method, "POST");
        assert.equal(JSON.parse(String(init?.body)).message, "Cari riskini ozetle");
        return new Response('{"type":"token","text":"Risk "}\n{"type":"token","text":"dusuk"}\n{"type":"done","text":"Risk dusuk"}\n', {
          status: 200,
          headers: { "content-type": "application/x-ndjson" }
        });
      }) as typeof fetch;
      try {
        const result = await new AiRuntimeService(context).chat("Cari riskini ozetle");
        assert.equal(requestedUrl, "http://127.0.0.1:8008/api/v1/chat/text-stream");
        assert.equal(result.provider, "local");
        assert.equal(result.mode, "live");
        assert.equal(result.message, "Risk dusuk");
      } finally {
        globalThis.fetch = originalFetch;
      }
    }
  );
});

test("mock AI provider keeps existing safe fallback behavior", async () => {
  await withEnv(
    {
      AI_PROVIDER: "mock",
      AI_LLM_PROVIDER: undefined,
      OPENAI_API_KEY: undefined
    },
    async () => {
      const result = await new AiRuntimeService(context).chat("Merhaba");
      assert.equal(result.provider, "mock");
      assert.equal(result.mode, "fallback");
      assert.match(result.message, /guvenli fallback/i);
    }
  );
});
