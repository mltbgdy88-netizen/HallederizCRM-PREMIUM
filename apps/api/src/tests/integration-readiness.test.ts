import assert from "node:assert/strict";
import test from "node:test";
import {
  assertWhatsAppReady,
  IntegrationNotReadyError,
  resolveLocalAiReadinessBase,
  resolveWhatsAppReadiness
} from "../shared/integration-readiness";
import { validateWhatsAppConfig } from "../shared/service-config";
import { IntegrationsService } from "../modules/integrations/service";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo"
};

function withEnv(env: Record<string, string | undefined>, run: () => void | Promise<void>) {
  const snapshot: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    snapshot[key] = process.env[key];
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const key of Object.keys(env)) {
      const value = snapshot[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("resolveWhatsAppReadiness returns disabled when provider disabled", () => {
  withEnv({ WHATSAPP_PROVIDER: "disabled" }, () => {
    const view = resolveWhatsAppReadiness();
    assert.equal(view.state, "disabled");
    assert.equal(view.ready, false);
    assert.equal(validateWhatsAppConfig().status, "disabled");
  });
});

test("resolveWhatsAppReadiness returns not_configured when live env missing", () => {
  withEnv(
    {
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_PHONE_NUMBER_ID: undefined,
      WHATSAPP_API_TOKEN: undefined,
      WHATSAPP_ACCESS_TOKEN: undefined
    },
    () => {
      const view = resolveWhatsAppReadiness();
      assert.equal(view.state, "not_configured");
      assert.equal(view.ready, false);
      assert.equal(validateWhatsAppConfig().status, "misconfigured");
    }
  );
});

test("resolveWhatsAppReadiness returns ready when live env complete", () => {
  withEnv(
    {
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_PHONE_NUMBER_ID: "123",
      WHATSAPP_API_TOKEN: "token",
      WHATSAPP_API_BASE_URL: "https://graph.facebook.com/v21.0"
    },
    () => {
      const view = resolveWhatsAppReadiness();
      assert.equal(view.state, "ready");
      assert.equal(view.ready, true);
    }
  );
});

test("assertWhatsAppReady throws when not configured", () => {
  withEnv({ WHATSAPP_PROVIDER: "disabled" }, () => {
    assert.throws(() => assertWhatsAppReady(), IntegrationNotReadyError);
  });
});

test("getWhatsAppSession connected only when readiness ready", () => {
  withEnv(
    {
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_PHONE_NUMBER_ID: "123",
      WHATSAPP_API_TOKEN: "token",
      WHATSAPP_API_BASE_URL: "https://graph.facebook.com/v21.0"
    },
    () => {
      const session = new IntegrationsService(context).getWhatsAppSession();
      assert.equal(session.connectionStatus, "connected");
    }
  );
  withEnv({ WHATSAPP_PROVIDER: "disabled" }, () => {
    const session = new IntegrationsService(context).getWhatsAppSession();
    assert.equal(session.connectionStatus, "disconnected");
  });
});

test("resolveLocalAiReadinessBase disabled when AI_PROVIDER disabled", () => {
  withEnv({ AI_PROVIDER: "disabled", AI_LOCAL_ENABLED: "false" }, () => {
    const view = resolveLocalAiReadinessBase();
    assert.equal(view.state, "disabled");
    assert.equal(view.ready, false);
  });
});

test("resolveWhatsAppReadiness accepts WHATSAPP_ACCESS_TOKEN alias", () => {
  withEnv(
    {
      WHATSAPP_PROVIDER: "meta",
      WHATSAPP_PHONE_NUMBER_ID: "pn",
      WHATSAPP_ACCESS_TOKEN: "secret",
      WHATSAPP_API_BASE_URL: undefined
    },
    () => {
      const view = resolveWhatsAppReadiness();
      assert.equal(view.ready, true);
    }
  );
});
