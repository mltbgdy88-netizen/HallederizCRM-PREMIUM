# UI Release Candidate Checklist

| Alan | Durum |
|------|--------|
| Base commit | `f96680a` |
| Release final branch | `release/ui-rc-final` |
| Last updated | 2026-05-21 |
| PR #136 on main | Yes — integrations merged |
| WhatsApp readiness | Configured-pending — see `WHATSAPP_READINESS.md` |
| Local AI readiness | Configured-pending — see `LOCAL_AI_READINESS.md` |
| Release final report | `RELEASE_UI_RC_FINAL_REPORT.md` |
| Go/No-Go | `RELEASE_UI_RC_GO_NO_GO.md` — **Conditional Go** |

## UI adoption status

| Agent | Scope | Status |
|-------|--------|--------|
| 01 | Tokens / primitives | Complete |
| 02 | AppShell / sidebar / header | Complete |
| 03 | Layout templates | Complete |
| 04 | Platform / operations | Complete |
| 05 | CRM / commercial | Complete |
| 06 | Stock / documents / tasks | Complete |
| 07 | Communication / reports / AI | Complete |
| 08 | Settings / users / ERP / system | Complete |
| 09 | Visual QA / polish | Complete |
| 10 | RC QA / P0–P1 + audit gap closure | Complete (this checklist) |

## Route group status

| Group | Smoke / file | Manual viewport |
|-------|----------------|-----------------|
| Shell + foundation | OK | Pending |
| Platform / operations | OK | Pending |
| CRM / commercial | OK | Pending |
| Stock / documents / tasks | OK | Pending |
| Communication / reports / AI | OK | Pending |
| Settings / users / ERP / system | OK | Pending |

## Test status

| Check | Status |
|-------|--------|
| Web typecheck | Pass |
| UI typecheck | Pass |
| UI build | Pass |
| Web build | Pass |
| smoke:navigation | Pass |
| smoke:routes | Pass |
| ui:guard | Pass |

## Manual QA status

| Viewport | Status |
|----------|--------|
| 1920×1080 desktop | **Not run** — recommended before production cut |
| 390×844 mobile | **Not run** — recommended before production cut |

## Stash policy

- `wip-mockup-inspiration-before-agent04` **must not** be restored on release branches.
- Inspect on a throwaway branch only.

## Known gaps (non-blocking for RC gate)

- `globals.css` legacy color tokens
- Mock data ASCII strings (non-UI)
- Detail route visual QA with live IDs

## Release blocker list

| ID | Severity | Blocker? | Notes |
|----|----------|----------|-------|
| RC-P0 | P0 | No | None open |
| RC-P1-01..02 | P1 | No | Fixed in Agent 10 branch |
| MANUAL-QA | Follow-up | No* | *Recommended before prod |

## Integration readiness (Agent: whatsapp-local-ai)

| Item | Status |
|------|--------|
| Runtime fake WhatsApp provider | No |
| Runtime fake AI output | No |
| Env examples safe placeholders | Yes (`.env.example`) |
| WhatsApp live credentials | **Manual** — required for production send |
| Ollama / local model | **Manual** — `ollama serve` + env |

## Release finalization (2026-05-21)

| Check | Result |
|-------|--------|
| PR chain #123–#136 on main | Verified |
| `pnpm ui:guard` | Pass |
| API tests (`pnpm --filter @hallederiz/api test`) | Pass (421/421) |
| P0 blocker | None |
| P1 blocker | None (closed in #134–#135) |

## Go / No-Go

| Decision | Value |
|----------|--------|
| Automated gate | **Go** |
| Integration config gate | **Conditional Go** — credentials + Ollama manual |
| Manual viewport gate | **Conditional Go** — run local pass |
| Overall RC UI | **Conditional Go** — see `RELEASE_UI_RC_GO_NO_GO.md` |
| Production cutover | Pending manual setup + QA sign-off |
