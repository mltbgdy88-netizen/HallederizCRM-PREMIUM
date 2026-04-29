import assert from "node:assert/strict";
import test from "node:test";
import {
  buildIntegrationsHealthSummary,
  validateAiConfig,
  validateErpConfig,
  validateFactoryConfig,
  validateLocalAgentConfig,
  validateWhatsAppConfig
} from "../shared/service-config";

function withEnv(env: Record<string, string | undefined>, run: () => void) {
  const snapshot: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    snapshot[key] = process.env[key];
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const key of Object.keys(env)) {
      const value = snapshot[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("service config validators return misconfigured when live env is missing", () => {
  withEnv(
    {
      AI_LLM_PROVIDER: "openai",
      AI_STT_PROVIDER: "openai",
      AI_TTS_PROVIDER: "openai",
      OPENAI_API_KEY: undefined,
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_API_BASE_URL: undefined,
      ERP_PROVIDER: "live",
      ERP_API_BASE_URL: undefined,
      FACTORY_PROVIDER: "live",
      FACTORY_API_BASE_URL: undefined,
      LOCAL_AGENT_MODE: "enabled",
      LOCAL_OUTPUT_ROOT: undefined
    },
    () => {
      assert.equal(validateAiConfig().status, "misconfigured");
      assert.equal(validateWhatsAppConfig().status, "misconfigured");
      assert.equal(validateErpConfig().status, "misconfigured");
      assert.equal(validateFactoryConfig().status, "misconfigured");
      assert.equal(validateLocalAgentConfig().status, "misconfigured");
    }
  );
});

test("integration health summary returns aggregate counts", () => {
  const summary = buildIntegrationsHealthSummary([
    {
      service: "ai",
      status: "healthy",
      mode: "live",
      configured: true,
      reason: "ok",
      lastCheckedAt: new Date().toISOString(),
      details: {}
    },
    {
      service: "whatsapp",
      status: "fallback",
      mode: "mock",
      configured: true,
      reason: "mock",
      lastCheckedAt: new Date().toISOString(),
      details: {}
    },
    {
      service: "local-agent",
      status: "disabled",
      mode: "disabled",
      configured: true,
      reason: "disabled",
      lastCheckedAt: new Date().toISOString(),
      details: {}
    }
  ]);

  assert.equal(summary.liveCount, 1);
  assert.equal(summary.fallbackCount, 1);
  assert.equal(summary.disabledCount, 1);
  assert.equal(summary.configuredCount, 3);
});

