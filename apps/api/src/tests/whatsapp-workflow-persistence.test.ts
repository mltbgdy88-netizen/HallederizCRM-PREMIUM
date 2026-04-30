import assert from "node:assert/strict";
import test from "node:test";
import { hashInboundMessageContent, normalizeTenantWhatsAppWorkflowStore } from "@hallederiz/domain";
import { WhatsAppWorkflowStoreService } from "../modules/whatsapp-workflow/store";
import { createWhatsAppWorkflowRepository } from "../modules/whatsapp-workflow/repository";
import { getPersistencePolicy } from "../shared/persistence-policy";
import { withEnv } from "./test-env";

function message(id: string, text = "Siparis durumu") {
  return {
    at: "2026-04-30T10:00:00.000Z",
    contentHash: hashInboundMessageContent({ from: "905321112233", text }),
    from: "905321112233",
    id
  };
}

test("WhatsApp workflow demo mode keeps memory store behavior", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      ALLOW_DEMO_FALLBACK: "false"
    },
    async () => {
      const service = new WhatsAppWorkflowStoreService(createWhatsAppWorkflowRepository(process.env));
      service.clear("tenant_memory");

      const first = await service.reserveInboundMessage("tenant_memory", message("wamid.memory.1"));
      const second = await service.reserveInboundMessage("tenant_memory", message("wamid.memory.1"));

      assert.equal(first.reserved, true);
      assert.equal(second.reserved, false);
      if (!second.reserved) assert.equal(second.reason, "same_message_processing");
      service.clear("tenant_memory");
    }
  );
});

test("WhatsApp workflow postgres mode without DB fails closed when fallback is disabled", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      ALLOW_DEMO_FALLBACK: "false"
    },
    async () => {
      const service = new WhatsAppWorkflowStoreService(createWhatsAppWorkflowRepository(process.env));

      await assert.rejects(() => service.reserveInboundMessage("tenant_pg_fail", message("wamid.pg.fail")), (error: unknown) => {
        assert.equal((error as { code?: string }).code, "persistence_unavailable");
        return true;
      });
    }
  );
});

test("WhatsApp workflow postgres mode can fallback only with explicit development flag", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      ALLOW_DEMO_FALLBACK: "true"
    },
    async () => {
      const policy = getPersistencePolicy();
      assert.equal(policy.dbFallbackAllowed, true);

      const service = new WhatsAppWorkflowStoreService(createWhatsAppWorkflowRepository(process.env));
      service.clear("tenant_pg_fallback");
      const first = await service.reserveInboundMessage("tenant_pg_fallback", message("wamid.pg.fallback"));
      const second = await service.reserveInboundMessage("tenant_pg_fallback", message("wamid.pg.fallback"));

      assert.equal(first.reserved, true);
      assert.equal(second.reserved, false);
      service.clear("tenant_pg_fallback");
    }
  );
});

test("WhatsApp workflow store serialization fills missing arrays", () => {
  const store = normalizeTenantWhatsAppWorkflowStore({
    tickets: [
      {
        allowedCommands: ["ONAYLA"],
        createdAt: "2026-04-30T10:00:00.000Z",
        customerPhone: "+90 532 111 22 33",
        expiresAt: "2026-04-30T11:00:00.000Z",
        id: "ticket_1",
        referenceCode: "SO-2026-0038",
        tenantId: "tenant_1",
        tokenHash: "hash",
        type: "order_decision"
      }
    ]
  });

  assert.deepEqual(store.processedMessages, []);
  assert.deepEqual(store.processingMessages, []);
  assert.deepEqual(store.commandAudit, []);
  assert.equal(store.tickets[0]?.customerPhone, "905321112233");
});
