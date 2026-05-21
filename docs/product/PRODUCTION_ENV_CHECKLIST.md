# Production Environment Checklist

| Alan | Değer |
|------|--------|
| Release commit | `2d2430f` |
| Reference | `.env.example`, `WHATSAPP_READINESS.md`, `LOCAL_AI_READINESS.md` |
| Rule | **Env key names only** — never commit secret values |

## Sign-off

| Role | Sign-off | Date |
|------|----------|------|
| Ops / platform | ☐ | |
| Security | ☐ | |
| Engineering | ☐ | |

---

## General application

| Variable / item | Required prod | Notes | ☐ |
|---------------|---------------|-------|---|
| `NODE_ENV` | `production` | | |
| `APP_BASE_URL` | Set | Public app origin | |
| `NEXT_PUBLIC_APP_URL` | Set | Web canonical URL | |
| `NEXT_PUBLIC_API_BASE_URL` | Set | Must match API deployment | |
| `API_BASE_URL` / server API URL | Set | Server-side fetch | |
| Deployment target URL | Documented | Platform ticket | |
| Build artifact location | Documented | CI output or image tag | |
| CORS / allowed origins | Restricted | No `*` in prod | |
| Rate limit / security headers | Enabled | Per platform | |
| Logging / monitoring | Configured | APM, log drain | |
| Backup / restore access | Verified | DB + secrets | |

---

## Database and persistence

| Variable / item | Required prod | Notes | ☐ |
|---------------|---------------|-------|---|
| `DATABASE_URL` or `POSTGRES_URL` | Set | Secret manager | |
| `PERSISTENCE_MODE` | `postgres` | Not in-memory demo | |
| Migration status | Applied | Owner runs migration command | |
| Seed / demo mode | **Disabled** | No prod demo seed without approval | |
| Connection pool limits | Set | Per ops standard | |

---

## Auth and session

| Variable / item | Required prod | Notes | ☐ |
|---------------|---------------|-------|---|
| Session / JWT secrets | Set | Secret manager only | |
| `DEMO_AUTH_ENABLED` | `false` | Fail-closed prod | |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | `false` | | |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `false` | Unless explicit pilot | |
| Tenant / org config | Set | `NEXT_PUBLIC_TENANT_ID` not relied on for security | |
| Passive user / permission deny | Verified | Policy unchanged | |

---

## WhatsApp (configured-pending until smoke pass)

| Variable | Required for live | ☐ |
|----------|-------------------|---|
| `WHATSAPP_PROVIDER` | `live` or `meta` (repo standard) | |
| `WHATSAPP_PHONE_NUMBER_ID` | Set | |
| `WHATSAPP_API_TOKEN` or `WHATSAPP_ACCESS_TOKEN` | Set (secret) | |
| `WHATSAPP_API_BASE_URL` | Verified (default Graph v21) | |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Set | |
| `WHATSAPP_WEBHOOK_APP_SECRET` | Set | |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | If used by tenant | |
| `WHATSAPP_TEST_RECIPIENT` | Staging/test only — not prod blast | |
| `OMNICHANNEL_ALLOW_MOCK_PROVIDERS` | **Must be false / unset** | |

### WhatsApp operational

| Check | ☐ |
|-------|---|
| Meta WhatsApp Cloud API app / business account ready | |
| Webhook public URL registered in Meta | |
| Webhook verify challenge manual pass | |
| Signature validation enabled on webhook route | |
| Health does not expose tokens | |
| UI does not show fake “connected” without env | |
| Outbound 503 when not ready (expected until configured) | |

---

## Local AI (configured-pending until smoke pass)

| Variable | Required for local-first | ☐ |
|----------|--------------------------|---|
| `AI_PROVIDER` | `ollama` or `openai-compatible` | |
| `AI_LOCAL_ENABLED` | `true` | |
| `OLLAMA_BASE_URL` or `AI_LOCAL_BASE_URL` | Reachable from API | |
| `OLLAMA_MODEL` or `AI_LOCAL_MODEL` | Pulled / available | |
| `AI_LOCAL_TIMEOUT_MS` | Set (e.g. 20000) | |
| `OPENAI_COMPATIBLE_BASE_URL` | If using compatible server | |
| `LOCAL_AI_ALLOW_PUBLIC_URLS` | `false` unless secured network | |
| `LOCAL_AI_SERVICE_URL` | If voice/STT stack used | |

### Local AI operational

| Check | ☐ |
|-------|---|
| `ollama serve` running (or compatible server) | |
| `ollama pull <model>` completed | |
| `GET /api/tags` health (Ollama) | |
| `GET /health/local-ai` returns expected state | |
| Sales assistant health endpoint OK | |
| Review-only UI — no auto-mutation copy | |
| No fake AI output when disabled | |
| Tokens/secrets not in health JSON | |

---

## Security checks

| Check | ☐ |
|-------|---|
| No `.env` with real secrets in repo | |
| Secret rotation procedure documented | |
| Webhook secrets rotated from dev values | |
| Production DB credentials unique | |
| `LOCAL_AI_ALLOW_PUBLIC_URLS` not true on public internet | |
| Fail-closed: missing integration config → 503 / not_configured | |

---

## Monitoring and logging

| Check | ☐ |
|-------|---|
| Structured logs shipping | |
| Error alerting (5xx, auth spike) | |
| Integration readiness metrics tagged | |
| Audit/timeline writes monitored | |

---

## Configured-pending summary

Until manual smoke completes, treat as **configured-pending**:

- WhatsApp live credentials + webhook
- Local AI endpoint + model
- Viewport screenshot QA (see smoke checklist)
- Real-data detail route QA

These are **not** code blockers; they block **Production Go** decision.

---

## False positives (documentation)

- `.env.example` contains placeholder key names — not production secrets
- Docs mentioning “no fake” — policy text, not runtime fake
- Test file names containing `mock` — test-only
