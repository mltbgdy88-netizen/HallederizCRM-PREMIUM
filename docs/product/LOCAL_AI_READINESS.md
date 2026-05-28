# Local AI Integration Readiness

## Current architecture

- **Runtime:** `apps/api/src/modules/ai-runtime/service.ts` (Ollama generate, sales assistant health)
- **Readiness:** `apps/api/src/shared/integration-readiness.ts` → `resolveLocalAiReadinessBase()` / `resolveLocalAiReadinessWithProbe()`
- **Health endpoint:** `GET /health/local-ai` (no secrets)
- **Sales assistant:** `GET /platform/ai/sales-assistant/health`
- **Web:** `/ai`, `/ai/onaylar`, `/ai/icgoruler`
- **Review-only:** AI proposals do not auto-mutate records; execution via approval chain only.

## Provider abstraction

| Provider | Env | Endpoint |
|----------|-----|----------|
| `disabled` | `AI_PROVIDER=disabled` | No calls |
| `ollama` / `local` | `AI_LOCAL_ENABLED=true`, `OLLAMA_BASE_URL` | `GET /api/tags`, `POST /api/generate` |
| `openai-compatible` | `AI_LOCAL_BASE_URL` or `OPENAI_COMPATIBLE_BASE_URL` | `/v1/chat/completions` (documented; probe via health) |
| `openai` | `OPENAI_API_KEY` | External; not local-first |

No runtime fake AI text when unconfigured.

## Ollama setup

```bash
ollama serve
ollama pull llama3.1
```

```env
AI_PROVIDER=ollama
AI_LOCAL_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
AI_LOCAL_TIMEOUT_MS=20000
```

## OpenAI-compatible local endpoint

Example (LM Studio, llama.cpp server):

```env
AI_PROVIDER=openai-compatible
AI_LOCAL_ENABLED=true
AI_LOCAL_BASE_URL=http://localhost:1234/v1
AI_LOCAL_MODEL=your-model-id
```

## Disabled / unconfigured behavior

- API returns `not_configured` / `disabled` health — no synthetic insights.
- `/ai/icgoruler` empty state: “Lokal AI yapılandırıldığında içgörüler burada görünecek.”
- Chat endpoints fail closed when models unreachable (existing guards).

## Timeout / errors

- `AI_LOCAL_TIMEOUT_MS` (default 20000) for Ollama probe
- User-facing messages in Turkish; no stack traces in API responses

## Test plan

```bash
pnpm --filter @hallederiz/api test -- integration-readiness
pnpm --filter @hallederiz/web typecheck
```

## Known gaps

- OpenAI-compatible adapter chat path uses existing external/local service split; full chat probe on `/health/local-ai` is config-level only until endpoint wired for chat smoke.
- Voice/STT still depends on `LOCAL_AI_SERVICE_URL` separate stack.
