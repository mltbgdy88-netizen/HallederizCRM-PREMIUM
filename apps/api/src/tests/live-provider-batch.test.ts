import test from "node:test";
import assert from "node:assert/strict";
import { AiRuntimeService } from "../modules/ai-runtime/service";
import { IntegrationsService } from "../modules/integrations/service";
import type { RequestContext } from "../shared/request-context";

const context: RequestContext = {
  tenantId: "tenant_1",
  userId: "user_admin",
  persistenceMode: "demo"
};

test("AI health returns degraded live mode when openai provider requested without key", async () => {
  const oldProvider = process.env.AI_LLM_PROVIDER;
  const oldKey = process.env.OPENAI_API_KEY;
  process.env.AI_LLM_PROVIDER = "openai";
  delete process.env.OPENAI_API_KEY;
  try {
    const health = new AiRuntimeService(context).getHealth();
    assert.equal(health.status, "degraded");
    assert.equal(health.mode, "live");
  } finally {
    if (oldProvider === undefined) delete process.env.AI_LLM_PROVIDER;
    else process.env.AI_LLM_PROVIDER = oldProvider;
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = oldKey;
  }
});

test("Integration health reports misconfigured when live env missing", async () => {
  const oldWhatsappProvider = process.env.WHATSAPP_PROVIDER;
  const oldWhatsappBase = process.env.WHATSAPP_API_BASE_URL;
  const oldErpProvider = process.env.ERP_PROVIDER;
  const oldErpBase = process.env.ERP_API_BASE_URL;
  const oldFactoryProvider = process.env.FACTORY_PROVIDER;
  const oldFactoryBase = process.env.FACTORY_API_BASE_URL;
  process.env.WHATSAPP_PROVIDER = "live";
  delete process.env.WHATSAPP_API_BASE_URL;
  process.env.ERP_PROVIDER = "live";
  delete process.env.ERP_API_BASE_URL;
  process.env.FACTORY_PROVIDER = "live";
  delete process.env.FACTORY_API_BASE_URL;

  try {
    const service = new IntegrationsService(context);
    assert.equal(service.getWhatsAppHealth().status, "misconfigured");
    assert.equal(service.getErpHealth().status, "misconfigured");
    const factory = service.getFactoryHealth();
    assert.equal(factory.status, "misconfigured");
  } finally {
    if (oldWhatsappProvider === undefined) delete process.env.WHATSAPP_PROVIDER;
    else process.env.WHATSAPP_PROVIDER = oldWhatsappProvider;
    if (oldWhatsappBase === undefined) delete process.env.WHATSAPP_API_BASE_URL;
    else process.env.WHATSAPP_API_BASE_URL = oldWhatsappBase;
    if (oldErpProvider === undefined) delete process.env.ERP_PROVIDER;
    else process.env.ERP_PROVIDER = oldErpProvider;
    if (oldErpBase === undefined) delete process.env.ERP_API_BASE_URL;
    else process.env.ERP_API_BASE_URL = oldErpBase;
    if (oldFactoryProvider === undefined) delete process.env.FACTORY_PROVIDER;
    else process.env.FACTORY_PROVIDER = oldFactoryProvider;
    if (oldFactoryBase === undefined) delete process.env.FACTORY_API_BASE_URL;
    else process.env.FACTORY_API_BASE_URL = oldFactoryBase;
  }
});
