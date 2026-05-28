# Dashboard Command Center — Clean Branch QA

**Date:** 2026-05-21  
**Branch:** `fix/ui-dashboard-command-center-redesign-clean`  
**Base:** `fix/ui-shell-navigation-visual-foundation` (`d875252`)

## Scope (9 files)

- `apps/web/app/(platform)/dashboard/page.tsx`
- `apps/web/app/globals.css` (+ `dashboard-command-center.css` import only)
- `apps/web/app/styles/dashboard-command-center.css`
- `apps/web/src/components/dashboard-header-cards-button.tsx`
- `apps/web/src/features/dashboard/components/DashboardCommandCenter*.tsx` (3)
- `apps/web/src/features/dashboard/utils/dashboard-command-center-panels.ts`
- `docs/product/DASHBOARD_COMMAND_CENTER_REDESIGN.md`

No `packages/ui/**`, no API/backend, no `pnpm-lock`.

## Visual verification

| Check | Result |
|-------|--------|
| Eski mor/KPI dashboard | **Gone** |
| Command Center layout | **Yes** |
| Acil Durumlar & Uyarılar | Yes |
| Bugünkü Görevlerim | Yes |
| Operasyon Akış Özeti | Yes |
| Son İşlemler | Yes |
| Hızlı İşlemler rail | Yes |
| AI Asistan panel | Yes |
| Tanıtım/video panel | Yes |
| Emerald/gold sidebar (Shell PR) | Yes |
| Header **Kartlar** button | **No** — `platform-shell.tsx` toolbar intentionally `null` in Shell PR; `dashboard-header-cards-button.tsx` included for post-merge wire (`toolbarSlot={<DashboardHeaderCardsButton />}` on `/dashboard`) |

## Screenshots

- `clean-dashboard-1366x768.png`
- `clean-dashboard-1920x1080.png`
- `clean-dashboard-mobile.png`

1366/1920: full command center with right AI + video rail. Mobile MCP viewport may not match CSS breakpoint exactly.

## Tests (local)

All PASS before commit: ui:guard, web/ui typecheck, api test (423), web/ui build, smoke:navigation, smoke:routes.

## Merge note

After PR #140 merges, rebase this branch onto `main`. Restore header Kartlar in `platform-shell.tsx` in a tiny follow-up or during merge resolution (not in this PR scope).
