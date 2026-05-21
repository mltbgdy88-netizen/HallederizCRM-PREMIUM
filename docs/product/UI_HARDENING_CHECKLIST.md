# UI Hardening Checklist

## Pre-merge (automated)

```powershell
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm --filter @hallederiz/ui build
pnpm --filter @hallederiz/web build
pnpm smoke:navigation
pnpm smoke:routes
pnpm ui:guard
```

## Guard script (`pnpm ui:guard`)

`scripts/ui-guard.cjs` checks:

1. Runtime PNG import (`ui-design-output`, mockup paths)
2. Technical leakage (`Failed to fetch`, `Worker foundation`, `Outbox job`, …)
3. AI forbidden mutation copy
4. Fake behavior phrases (`fake chart`, `demo fallback`, …)
5. `apps/web/tsconfig.tsbuildinfo` not staged for commit

False positives: test files, `*-mock-data`, `*-feedback.ts`, `omnichannel-ui.ts`, `ai/queries` excluded.

## Manual viewport QA (required before production cut)

| Viewport | Routes (sample) |
|----------|-----------------|
| 1920×1080 | `/dashboard`, `/hizli-islem`, `/onaylar`, `/cariler`, `/stok`, `/belgeler`, `/gelen-kutu`, `/raporlar`, `/raporlar/satis`, `/whatsapp`, `/ai`, `/ayarlar`, `/kullanicilar`, `/erp` |
| 390×844 | Same set — verify no body horizontal scroll |

Procedure:

1. Open route at viewport size.
2. DevTools → `document.documentElement.scrollWidth <= window.innerWidth + 2`.
3. Repeat for `document.body`.
4. Note first-view list row count on list pages (target ≥5 at 1920×1080).

## Secret scan (manual review, non-blocking)

```powershell
git grep -n "api[_-]?key|secret|password|BEGIN PRIVATE KEY|ghp_" -- apps/web packages/ui
```

Review hits; do not commit `.env` files.

## Stash policy

- **Do not restore** `wip-mockup-inspiration-before-agent04` on release branches.
- Inspect stash on a throwaway branch if needed.

## Safe empty copy reference

See `apps/web/src/lib/ui-safe-copy.ts`:

- Canlı veri bekleniyor.
- Canlı rapor verisi bekleniyor.
- Bu kayıt için denetim geçmişi henüz oluşmadı.

## CI

`quality-gate.yml` runs `pnpm ui:guard` after smoke tests.
