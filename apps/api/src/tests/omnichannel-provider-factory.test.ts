import assert from "node:assert/strict";
import test from "node:test";
import { createProviderAdapters } from "@hallederiz/domain";
import { withEnv } from "./test-env";

test("production provider factory does not silently fallback to live send", async () => {
  await withEnv({ NODE_ENV: "production", OMNICHANNEL_ALLOW_MOCK_PROVIDERS: "false" }, async () => {
    const providers = createProviderAdapters({
      isProduction: true,
      allowMock: false,
      accounts: [],
      metaAppSecret: undefined
    });
    const instagram = providers.get("instagram");
    assert.ok(instagram);
    const health = await instagram!.health();
    assert.equal(health.ok, false);
    assert.equal(health.mode, "degraded");

    const send = await instagram!.sendMessage({
      tenantId: "tenant_1",
      conversationId: "conv_1",
      channel: "instagram",
      text: "test",
      actorId: "user_1",
      source: "api"
    });
    assert.equal(send.ok, false);
    assert.equal(send.metadata?.providerCallExecuted, false);
  });
});

test("disconnected provider send denied without live credentials", async () => {
  const providers = createProviderAdapters({
    isProduction: false,
    allowMock: false,
    accounts: []
  });
  const facebook = providers.get("facebook");
  const send = await facebook!.sendMessage({
    tenantId: "tenant_1",
    conversationId: "conv_1",
    channel: "facebook",
    text: "hello",
    actorId: "user_1",
    source: "api"
  });
  assert.equal(send.ok, false);
  assert.notEqual(send.status, "sent");
});
