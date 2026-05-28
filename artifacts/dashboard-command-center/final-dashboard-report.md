# Dashboard Command Center — final QA

- Branch (actual): `fix/ui-dashboard-command-center-exact-layout` (user alias: `fix/ui-dashboard-command-center-redesign`)
- Base URL: `http://localhost:3001` (3000 in use)
- API: `http://localhost:4000`
- Date: 2026-05-21

## Screenshots

| File | Viewport |
|------|----------|
| `artifacts/dashboard-command-center/final-dashboard-1366x768.png` | 1366×768 |
| `artifacts/dashboard-command-center/final-dashboard-1920x1080.png` | 1920×1080 |
| `artifacts/dashboard-command-center/final-dashboard-mobile.png` | 390×844 (full page) |

## Visual contract (preserved)

- Compact command sidebar (~204px), emerald/gold, no internal scroll
- No sidebar badges, no status card footer
- No KPI charts on dashboard
- Main: alerts, tasks, flow, recent, quick rail (flex grid)
- Header: Kartlar button (card visibility editor)
- Right rail: AI chat panel + composer + promo video player (~200–220px)

## QA checklist (browser verify)

| Check | 1366×768 | 1920×1080 | Notes |
|-------|----------|-----------|-------|
| Command center renders | PASS | PASS | |
| AI chat + composer + promo | PASS | PASS | Composer above promo |
| Quick rail visible | PASS | PASS | Bottom of main column |
| Sidebar badges removed | PASS | PASS | |
| Status card removed | PASS | PASS | |
| Horizontal overflow | PASS | PASS | Visual |
| Charts on dashboard | PASS | PASS | None |

## Test results

| Command | Result |
|---------|--------|
| `pnpm ui:guard` | PASS |
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS |
| `pnpm --filter @hallederiz/api test` | PASS |
| `pnpm --filter @hallederiz/web build` | PASS |
| `pnpm --filter @hallederiz/ui build` | PASS |
| `pnpm smoke:navigation` | PASS (24 links) |
| `pnpm smoke:routes` | PASS (37 routes) |

## Remaining visual gaps

- AI sohbet alanı boşken geniş beyaz alan (tasarım tercihi: temiz panel).
- Demo modda AI input disabled (“Lokal AI yapılandırılmadı” health gate) — beklenen.
- Mobile: tek kolon stack; full-page scroll kabul edilebilir.
- Playwright paketi repoda yok; screenshot MCP ile alındı.

## Commit scope (apps/web only)

- `apps/web/app/styles/dashboard-command-center.css`
- `apps/web/app/globals.css` (import — prior commit)
- `apps/web/src/components/command-center-sidebar-nav.tsx`
- `apps/web/src/components/platform-shell.tsx`
- `apps/web/src/components/dashboard-header-cards-button.tsx`
- `apps/web/src/features/dashboard/components/DashboardCommandCenter*.tsx`
- `apps/web/src/features/dashboard/utils/dashboard-command-center-panels.ts`
- `apps/web/app/(platform)/dashboard/page.tsx` (prior commits)

**Not committed:** `artifacts/`, `docs/design/ui-design-output/`, `pnpm-lock.yaml`
