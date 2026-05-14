/** Demo / foundation — gercek log pipeline baglaninca API kaynakli olacaktir. */
export type OpsTracePreviewRow = {
  id: string;
  traceId: string;
  spanId: string;
  tenantId: string;
  principal: string;
  route: string;
  httpStatus: number;
  latencyMs: number;
  occurredAt: string;
};

export const OPS_TRACE_PREVIEW_ROWS: OpsTracePreviewRow[] = [
  {
    id: "ops_tr_1",
    traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    spanId: "00f067aa0ba902b7",
    tenantId: "tenant_1",
    principal: "user_admin",
    route: "POST /v1/orders",
    httpStatus: 201,
    latencyMs: 84,
    occurredAt: "2026-05-13T08:12:01.000Z"
  },
  {
    id: "ops_tr_2",
    traceId: "6ba7b8109dad11d180b400c04fd430c8",
    spanId: "11a5b3019dad11d180b400c04fd430c8",
    tenantId: "tenant_1",
    principal: "user_ops",
    route: "GET /v1/approvals",
    httpStatus: 200,
    latencyMs: 42,
    occurredAt: "2026-05-13T08:14:22.000Z"
  },
  {
    id: "ops_tr_3",
    traceId: "6ba7b8119dad11d180b400c04fd430c8",
    spanId: "22b6c4129dad11d180b400c04fd430c8",
    tenantId: "tenant_1",
    principal: "user_admin",
    route: "POST /v1/worker/outbox/dispatch",
    httpStatus: 202,
    latencyMs: 118,
    occurredAt: "2026-05-13T08:16:05.000Z"
  },
  {
    id: "ops_tr_4",
    traceId: "7c9e2aa19dad11d180b400c04fd430c8",
    spanId: "33c7d5239dad11d180b400c04fd430c8",
    tenantId: "tenant_2",
    principal: "user_tenant2",
    route: "GET /v1/customers",
    httpStatus: 200,
    latencyMs: 31,
    occurredAt: "2026-05-13T08:18:40.000Z"
  },
  {
    id: "ops_tr_5",
    traceId: "8daf3bb29dad11d180b400c04fd430c8",
    spanId: "44d8e6349dad11d180b400c04fd430c8",
    tenantId: "tenant_1",
    principal: "user_admin",
    route: "POST /v1/whatsapp/webhook",
    httpStatus: 200,
    latencyMs: 56,
    occurredAt: "2026-05-13T08:19:11.000Z"
  }
];
