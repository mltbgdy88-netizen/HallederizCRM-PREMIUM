# WhatsApp Integration Readiness

## Current architecture

- **API adapter:** `apps/api/src/modules/integrations/adapters/whatsapp-adapter.ts`
- **Readiness resolver:** `apps/api/src/shared/integration-readiness.ts` → `resolveWhatsAppReadiness()`
- **Health:** `GET /health/whatsapp` → `IntegrationsService.getWhatsAppHealth()`
- **Session:** `GET /whatsapp/session` (connected only when `ready` + `state=ready`)
- **Outbound:** `POST /whatsapp/outbound` → 503 when provider not ready (no fake sent)
- **Web:** `/whatsapp` → `WhatsAppPage` + `mapWhatsAppChannelHealthView()`
- **SDK:** `packages/sdk/src/clients/whatsapp.client.ts`

## Provider status states

| State | Meaning |
|-------|---------|
| `disabled` | `WHATSAPP_PROVIDER=disabled` |
| `not_configured` | Live/meta requested but env incomplete |
| `configured` | Reserved for partial setup |
| `ready` | Live env complete; outbound may call Meta Graph API |
| `error` | Reserved for runtime probe failures |

`mock` provider is **not** treated as live. In production, mock is never ready. In development, mock is only informational when `OMNICHANNEL_ALLOW_MOCK_PROVIDERS=true`.

## Env variables

| Variable | Required for live | Notes |
|----------|-------------------|-------|
| `WHATSAPP_PROVIDER` | Yes | `disabled`, `live`, or `meta` |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | |
| `WHATSAPP_API_TOKEN` or `WHATSAPP_ACCESS_TOKEN` | Yes | Alias supported |
| `WHATSAPP_API_BASE_URL` | No | Defaults to `https://graph.facebook.com/v21.0` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Webhook verify | No fake verify without secret |
| `WHATSAPP_WEBHOOK_APP_SECRET` | Signature | Fail-closed when missing |
| `WHATSAPP_TEST_RECIPIENT` | Test send only | Required for `/health/whatsapp/test-send` live path |

## Disabled / unconfigured behavior

- No runtime fake provider.
- No fake “connected” UI when env missing.
- Outbound returns **503** with Turkish user message (no stack trace).
- Demo UI (`useDemoData`) shows preview-only copy; send disabled.

## Local dev

1. Copy `.env.example` → `.env.local`
2. For live API test (optional):

```env
WHATSAPP_PROVIDER=live
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_TOKEN=your_meta_token
WHATSAPP_TEST_RECIPIENT=90XXXXXXXXXX
```

3. Start API + web; open `/whatsapp` — provider card shows configuration state.

## Production checklist

- [ ] `WHATSAPP_PROVIDER=live` or `meta`
- [ ] Secrets in secret manager (not repo)
- [ ] Webhook verify token + app secret configured
- [ ] Signature validation enabled on webhook route
- [ ] `OMNICHANNEL_ALLOW_MOCK_PROVIDERS` **not** true in production
- [ ] Smoke: `pnpm --filter @hallederiz/api test` (integration-readiness)

## Security notes

- Tokens never returned in health/session responses.
- Provider errors normalized; raw Graph API body not exposed to UI.
- Approval/policy gates unchanged on outbound route.

## Test plan

```bash
pnpm --filter @hallederiz/api test -- integration-readiness
pnpm --filter @hallederiz/web typecheck
pnpm smoke:navigation
```

## Known gaps

- QR pairing flow not implemented; session `connected` reflects env readiness, not Meta device link.
- In-memory demo store still seeds sample conversations when persistence is demo (UI demo flag separate).
