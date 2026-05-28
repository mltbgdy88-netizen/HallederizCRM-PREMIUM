import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import {
  applyWhatsAppTicketCommand,
  createEmptyWhatsAppWorkflowStore,
  createWhatsAppApprovalTicket,
  hashInboundMessageContent,
  hashToken
} from "@hallederiz/domain";
import { registerIntegrationRoutes } from "../integrations/routes";
import { whatsAppWorkflowStoreService } from "../modules/whatsapp-workflow/store";
import { signHmacSha256Payload } from "../shared/webhook-security";
import { withEnv } from "./test-env";

function storeWithTicket(options: { expiresAt?: string; allowedCommands?: string[]; payload?: Record<string, unknown> } = {}) {
  const createdAt = new Date().toISOString();
  const defaultExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const ticket = createWhatsAppApprovalTicket({
    allowedCommands: options.allowedCommands ?? ["approve", "reject", "review"],
    createdAt,
    customerName: "Musteri Firma",
    customerPhone: "905321112233",
    expiresAt: options.expiresAt ?? defaultExpiresAt,
    id: "ticket_approval_1",
    payload: options.payload,
    rawToken: "secret-token",
    referenceCode: "SO-2026-0038",
    tenantId: "tenant_1",
    type: "order_decision"
  });
  return { store: { ...createEmptyWhatsAppWorkflowStore(), tickets: [ticket] }, ticket };
}

test("valid approve command applies ticket and writes audit", () => {
  const { store, ticket } = storeWithTicket();
  const now = new Date().toISOString();
  const result = applyWhatsAppTicketCommand({
    command: "approve",
    fromPhone: "905321112233",
    now,
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, "applied");
  assert.equal(result.store.tickets[0]?.status, "applied");
  assert.equal(result.store.tickets[0]?.usedByPhone, "905321112233");
  assert.equal(result.store.tickets[0]?.resolvedCommand, "approve");
  assert.equal(result.store.commandAudit[0]?.result, "accepted");
  assert.equal(Object.values(result.store.tickets[0] ?? {}).includes("secret-token"), false);
});

test("valid reject command rejects ticket", () => {
  const { store, ticket } = storeWithTicket();
  const now = new Date().toISOString();
  const result = applyWhatsAppTicketCommand({
    command: "reject",
    fromPhone: "905321112233",
    now,
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store
  });

  assert.equal(result.ok, true);
  assert.equal(result.store.tickets[0]?.status, "rejected");
});

test("review command keeps ticket pending and writes accepted audit", () => {
  const { store, ticket } = storeWithTicket();
  const now = new Date().toISOString();
  const result = applyWhatsAppTicketCommand({
    command: "review",
    fromPhone: "905321112233",
    now,
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store
  });

  assert.equal(result.ok, true);
  assert.equal(result.store.tickets[0]?.status, "pending");
  assert.equal(result.store.commandAudit[0]?.reason, "review_requested");
});

test("invalid token writes rejected audit without storing raw token", () => {
  const { store, ticket } = storeWithTicket();
  const now = new Date().toISOString();
  const result = applyWhatsAppTicketCommand({
    command: "approve",
    fromPhone: "905321112233",
    now,
    rawToken: "wrong-token",
    referenceCode: ticket.referenceCode,
    store
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "token_invalid");
  assert.equal(result.store.commandAudit[0]?.result, "rejected");
  assert.equal(JSON.stringify(result.store).includes("wrong-token"), false);
});

test("expired ticket is marked expired and already resolved command is duplicate", () => {
  const { store, ticket } = storeWithTicket({ expiresAt: new Date(Date.now() - 60_000).toISOString() });
  const now = new Date().toISOString();
  const expired = applyWhatsAppTicketCommand({
    command: "approve",
    fromPhone: "905321112233",
    now,
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store
  });
  assert.equal(expired.ok, false);
  assert.ok(expired.reason === "ticket_expired" || expired.reason === "ticket_already_resolved");
  assert.equal(expired.store.tickets[0]?.status, "expired");

  const duplicate = applyWhatsAppTicketCommand({
    command: "approve",
    fromPhone: "905321112233",
    now: new Date(Date.now() + 60_000).toISOString(),
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store: expired.store
  });
  assert.equal(duplicate.reason, "ticket_already_resolved");
  assert.equal(duplicate.store.commandAudit.at(-1)?.result, "duplicate");
});

test("unauthorized phone is rejected when ticket payload has approver phones", () => {
  const { store, ticket } = storeWithTicket({ payload: { approverPhones: ["905551112233"] } });
  const now = new Date().toISOString();
  const result = applyWhatsAppTicketCommand({
    command: "approve",
    fromPhone: "905321112233",
    now,
    rawToken: "secret-token",
    referenceCode: ticket.referenceCode,
    store
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "approver_not_allowed");
});

test("signed webhook command updates ticket state and duplicate retry stays idempotent", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_WEBHOOK_APP_SECRET: "command-secret"
    },
    async () => {
      whatsAppWorkflowStoreService.clear("tenant_command_route");
      const ticket = createWhatsAppApprovalTicket({
        allowedCommands: ["approve"],
        createdAt: new Date().toISOString(),
        customerName: "Musteri Firma",
        customerPhone: "905321112233",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        rawToken: "route-token",
        referenceCode: "SO-ROUTE-1",
        tenantId: "tenant_command_route",
        type: "order_decision"
      });
      await whatsAppWorkflowStoreService.appendTicket("tenant_command_route", ticket);

      const server = Fastify();
      await registerIntegrationRoutes(server);
      const rawBody = JSON.stringify({
        tenantId: "tenant_command_route",
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "905321112233",
                      id: "wamid.command.1",
                      text: { body: "ONAY SO-ROUTE-1 route-token" },
                      type: "text"
                    }
                  ]
                }
              }
            ]
          }
        ]
      });
      const signature = `sha256=${signHmacSha256Payload(rawBody, "command-secret")}`;

      const first = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json", "x-hub-signature-256": signature },
        payload: rawBody
      });
      assert.equal(first.statusCode, 200);
      assert.equal(first.json().commandResult.ok, true);
      assert.equal(first.json().commandResult.status, "applied");

      const persisted = await whatsAppWorkflowStoreService.load("tenant_command_route");
      assert.equal(persisted.tickets[0]?.status, "applied");
      assert.equal(persisted.tickets[0]?.tokenHash, hashToken("route-token"));

      const second = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json", "x-hub-signature-256": signature },
        payload: rawBody
      });
      assert.equal(second.statusCode, 200);
      assert.equal(second.json().duplicate, true);

      assert.equal(hashInboundMessageContent({ from: "905321112233", text: "ONAY SO-ROUTE-1 route-token" }).length, 64);
      await server.close();
      whatsAppWorkflowStoreService.clear("tenant_command_route");
    }
  );
});
