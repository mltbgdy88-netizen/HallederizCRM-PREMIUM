# UI Release Candidate Checklist

| Alan | Durum |
|------|--------|
| Base commit | `282289d` |
| Agent 10 branch | `ui/10-qa-bugfix-or-release-candidate` |
| Last updated | 2026-05-21 |

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
| 10 | RC QA / P0–P1 | Complete (this checklist) |

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

## Manual QA status

| Viewport | Status |
|----------|--------|
| 1920×1080 desktop | **Not run** — recommended before production cut |
| 390×844 mobile | **Not run** — recommended before production cut |

## Known gaps (non-blocking for RC gate)

- `/unauthorized` dedicated page
- `globals.css` legacy color tokens
- Mock data ASCII strings (non-UI)
- Detail route visual QA with live IDs

## Release blocker list

| ID | Severity | Blocker? | Notes |
|----|----------|----------|-------|
| RC-P0 | P0 | No | None open |
| RC-P1-01..02 | P1 | No | Fixed in Agent 10 branch |
| MANUAL-QA | Follow-up | No* | *Recommended before prod |

## Go / No-Go

| Decision | Value |
|----------|--------|
| Automated gate | **Go** |
| Manual viewport gate | **Conditional Go** — run local pass |
| Overall RC UI | **Go with follow-up QA** |
