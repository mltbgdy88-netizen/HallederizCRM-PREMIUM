# Release UI RC — Go / No-Go

| Decision | **Conditional Go** |
|----------|---------------------|
| Codebase RC-ready | **Yes** |
| Production release without manual setup | **No** |
| Date | 2026-05-21 |
| Main HEAD | `f96680a` (#136) |

## Decision summary

The `main` branch satisfies automated release-candidate gates: UI adoption, hardening, integration readiness, guards, builds, smoke, and full API test suite (421 tests). Production deployment may proceed **after** completing the conditions below. Missing WhatsApp credentials or local AI endpoint are **not code blockers**; they are documented operational prerequisites.

## Conditions (required before production)

### WhatsApp

- [ ] `WHATSAPP_PROVIDER=live` (or `meta` per repo standard)
- [ ] `WHATSAPP_PHONE_NUMBER_ID` set
- [ ] `WHATSAPP_API_TOKEN` or `WHATSAPP_ACCESS_TOKEN` set
- [ ] `WHATSAPP_API_BASE_URL` verified
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` and `WHATSAPP_WEBHOOK_APP_SECRET` set
- [ ] Meta app / Cloud API credentials in secret manager (not in repo)
- [ ] Webhook URL registered and verified in production
- [ ] Manual outbound smoke (test recipient first)
- [ ] UI health shows configured state (not fake “connected”)

### Local AI

- [ ] `AI_PROVIDER=ollama` or `openai-compatible`
- [ ] `AI_LOCAL_ENABLED=true`
- [ ] `OLLAMA_BASE_URL` or `AI_LOCAL_BASE_URL` reachable
- [ ] `AI_LOCAL_MODEL` / `OLLAMA_MODEL` pulled (`ollama pull`)
- [ ] `ollama serve` running (or compatible server)
- [ ] `GET /health/local-ai` returns expected state
- [ ] Sales assistant health shows model ready when applicable
- [ ] AI review-only verified (no “Uygula” / auto-mutation copy)

### Manual QA

- [ ] 1920×1080 viewport screenshot QA
- [ ] 390×844 viewport screenshot QA
- [ ] Critical routes: dashboard, hizli-islem, onaylar, whatsapp, cariler, stok, archive, raporlar, ayarlar
- [ ] Detail routes smoke with real IDs where data exists
- [ ] Error boundaries show safe copy (no stack trace)

## Non-blockers (follow-up)

| Item | Notes |
|------|-------|
| Legacy purple/navy `globals.css` cleanup | P2/P3 visual debt |
| Full design screenshot baseline archive | Optional |
| Backend live report KPI contract | Separate from UI RC |
| Stash `wip-mockup-inspiration-before-agent04` | Do not restore on release branches |
| Open PR #135 / #136 remote branches | May remain; do not delete without owner approval |

## Blockers

| ID | Severity | Status |
|----|----------|--------|
| RC-P0 | P0 | **None** (automated gates pass) |
| RC-P1 | P1 | **None open** (fixed in #134, #135) |
| Automated test failure | — | **None** at `f96680a` |

If any P0 test or guard fails on `main`, decision reverts to **No-Go** until fixed.

## Final sign-off checklist

| Role | Check | Sign-off |
|------|-------|----------|
| Engineering | `pnpm ui:guard` + typecheck + build + smoke pass | ☐ |
| Engineering | API test suite pass (421) | ☐ |
| Engineering | No runtime fake provider/output | ☐ |
| Product / QA | Viewport QA (1920 + 390) | ☐ |
| Ops | WhatsApp credentials + webhook | ☐ |
| Ops | Local AI endpoint + model | ☐ |
| Security | No secrets in repo; fail-closed verified | ☐ |

## Automated evidence (2026-05-21)

```
pnpm ui:guard                          → PASS
pnpm --filter @hallederiz/web typecheck → PASS
pnpm --filter @hallederiz/ui typecheck  → PASS
pnpm --filter @hallederiz/ui build        → PASS
pnpm --filter @hallederiz/web build       → PASS
pnpm smoke:navigation                     → PASS (24)
pnpm smoke:routes                         → PASS (37)
pnpm --filter @hallederiz/api test        → PASS (421/421)
```

## Next step

Branch: `release/production-cutover` — environment config, deployment checklist, and production smoke runbook.
