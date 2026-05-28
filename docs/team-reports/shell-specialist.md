# Shell Specialist — Phase 1 Completion Report

**Agent:** UI Shell & Sistem Ekranları Uzmanı  
**Date:** 2026-05-27  
**Workspace:** `xxxhallederizcrm` (merge target only; Final / PREMIUM source folders untouched)

---

## Phase 1 Summary

Phase 1 delivers **Final reference shell visuals** with **PREMIUM auth/session/nav behavior** on platform and emerald layouts, plus Final system-state screens and login integration.

---

## Completed

### 1. Final AppShell + PREMIUM auth/nav

| File | Change |
|------|--------|
| `apps/web/src/components/reference-app-shell.tsx` | Session user display, theme toggle, logout → `/login`, Next.js `Link` nav |
| `apps/web/app/(platform)/layout.tsx` | Already wired: `ProtectedRoute` + `ReferenceAppShell` (no change needed) |
| `apps/web/src/components/reference-emerald-shell.tsx` | Rebuilt with auth/session, theme toggle, logout, pathname-aware nav (`Link`) |
| `apps/web/app/(emerald)/layout.tsx` | Already wired: `ProtectedRoute` + `ReferenceEmeraldShell` (no change needed) |

### 2. Login auth integration (Final UI + PREMIUM flow)

| File | Change |
|------|--------|
| `apps/web/app/login/layout.tsx` | **New** — `auth-root` wrapper (Final `(auth)` pattern) |
| `apps/web/app/login/page.tsx` | `Suspense` boundary for `useSearchParams` |
| `apps/web/src/features/auth/components/LoginSplitPage.tsx` | Authenticated redirect, loading gate, safe `next` path resolution |
| `apps/web/src/features/auth/utils/resolve-post-login-path.ts` | **New** — shared post-login redirect helper |

### 3. System state routes — Final reference UI

| Route | Layout | Component | Status |
|-------|--------|-----------|--------|
| `/demo-mode` | `(platform)` + AppShell | `DemoModeStatePage` | OK |
| `/live-empty` | `(platform)` + AppShell | `LiveEmptyStatePage` | OK |
| `/unauthorized` | `(platform)` + AppShell | `UnauthorizedStatePage` | OK |
| `/offline-api` | `(offline-shell)` + OfflineShell | `OfflineApiStatePage` | OK |

**Route fix:** Removed duplicate `(platform)/offline-api` page (Next.js parallel-route conflict). Final design keeps offline state under `(offline-shell)` only.

### 4. Reference CSS (shell scope)

Copied from Final source into `apps/web/app/styles/`:

- `auth-root.css`
- `login-split-reference.css`
- `sistem-state-reference.css`
- `dashboard-reference-poc.css` (`.ref-shell` sidebar/header)
- `ana-sayfa-emerald-gold.css`

`apps/web/app/reference-globals.css` trimmed to **Phase 1 shell imports only**; module `*-reference.css` imports deferred to module specialists.

Also copied `desk-dark-mode.css` + `desk-dark-mode-sweep.css` from PREMIUM-CURSOR to unblock root layout imports.

---

## Verification

| Check | Result |
|-------|--------|
| Scope TS/lint (`reference-app-shell`, `reference-emerald-shell`, auth, login, layouts) | **Pass** — no errors in scope files |
| Full `@hallederiz/web` typecheck | **Fail** — adapter errors outside scope (cariler/siparisler/tahsilatlar/teklifler adapters) |
| `pnpm --filter @hallederiz/web build` | **Fail** — see blockers below |

---

## Blockers for Tech Lead

### P0 — `globals.css` missing PREMIUM stylesheet tree

`apps/web/app/globals.css` imports `./styles/agent04-platform.css` and ~30 other command-center/agent CSS files that **do not exist** in merge workspace (`app/styles/` was empty before shell work).

**Impact:** Production build fails after shell route conflict fix.

**Suggested owner:** Platform / merge infra agent — restore `apps/web/app/styles/*` from PREMIUM-CURSOR or trim `globals.css` until PREMIUM desk surfaces are reattached.

### P1 — Module reference CSS (57 files)

`reference-globals.css` previously imported all Final module styles. Shell agent limited imports to Phase 1 scope. Module screens will lack reference styling until module specialists copy remaining `*-reference.css` files from Final.

### P2 — Adapter typecheck (out of shell scope)

```
cariler-reference-adapter.ts — Customer.taxNo, customerGroup
siparisler-reference-adapter.ts — requestedDeliveryDate, contactPerson
tahsilatlar-reference-adapter.ts — PaymentReceipt.note
teklifler-reference-adapter.ts — contactPerson
```

---

## Out of scope (not touched)

- P0 module screens and data adapters
- `apps/web/src/components/platform-shell.tsx` (legacy PREMIUM command-center shell)
- Original Final / PREMIUM source folders on Desktop
- `(offline-shell)` auth wiring (offline demo shell remains static user block per Final)

---

## Handoff notes

1. Platform routes now render inside **Final `ReferenceAppShell`** with live session from `AuthProvider`.
2. Login uses Final split layout; authenticated users auto-redirect via `?next=` (defaults to `/dashboard`).
3. System states match Final components; `/offline-api` must not be re-added under `(platform)`.
4. Next merge step: restore PREMIUM `globals.css` import tree or split desk vs reference CSS loading per route group.

---

**Status:** Phase 1 shell scope **complete** with documented infra blockers.
