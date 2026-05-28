# UI Agent 03 Report — Layout Template Foundation

**Branch:** `ui/03-layout-templates`  
**Base commit:** `b4fd295` — feat(ui): update appshell sidebar and header foundation (#126)  
**Date:** 2026-05-20

---

## Scope

| Alan | Durum |
|------|--------|
| Layout template foundation (`packages/ui`) | ✅ |
| `layout-templates.css` + globals import | ✅ |
| Route implementation / adoption | ❌ (bilinçli) |
| AppShell / Sidebar / Header | ❌ (değişmedi) |
| Backend / API / worker / DB / auth | ❌ |
| `docs/design/ui-design-output/**` | ❌ (değişmedi) |
| Mockup PNG runtime import | ❌ |
| `package.json` / `pnpm-lock.yaml` | ❌ |

---

## Değişen dosyalar

### packages/ui

- `src/primitives/filter-bar.tsx` — `FilterToolbar` slot API + loading/disabled
- `src/primitives/data-table.tsx` — `DataTableShell` toolbar/state/mobile/footer/density
- `src/primitives/detail-panel.tsx` — subtitle, eyebrow, actions, state slots, `aside`
- `src/primitives/entity-list-page-template.tsx` — `summary`, `pageState`, list template classes
- `src/primitives/entity-detail-layout.tsx` — header/tabs/footer/pageState slots
- `src/primitives/form-page-shell.tsx` — title/intro/validation/sticky/footer
- `src/primitives/settings-layout.tsx` — title/dangerZone/footer
- `src/primitives/form-validation-summary.tsx` — default title TR
- `src/templates/product-page-shell.tsx` — **yeni**
- `src/templates/page-section.tsx`, `summary-bar.tsx`, `sticky-action-footer.tsx` — **yeni**
- `src/templates/index.ts` — **yeni**
- `src/styles/layout-templates.css` — **yeni**
- `src/index.ts` — `export * from "./templates"`

### apps/web

- `app/globals.css` — `@import layout-templates.css` only

### docs/product

- `UI_LAYOUT_PATTERNS.md` — **yeni**
- `UI_AGENT_03_REPORT.md` — **yeni**
- `UI_INVENTORY_CHECKLIST.md` — Agent 03 durumu
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md` — Agent 03 tamamlandı notu

---

## Templates added / updated

| Template | Action |
|----------|--------|
| FilterToolbar | Enhanced slot API (backward-compatible `children`) |
| DataTableShell | Enhanced state/mobile/density slots |
| DetailPanel | Enhanced header/state/scroll |
| EntityListPageTemplate | `summary`, `pageState`, template classes |
| EntityDetailLayout | header/tabs/footer/pageState |
| FormPageShell | title/validation/sticky/footer |
| SettingsLayout | title/dangerZone/footer |
| ProductPageShell | **New** in `packages/ui` (presentational) |
| PageSection, SummaryBar, StickyActionFooter | **New** helpers |

---

## CSS / layout foundation

- File: `packages/ui/src/styles/layout-templates.css`
- Prefixes: `hz-layout-*`, `hz-template-*`, `hz-list-template-*`, `hz-detail-template-*`, `hz-form-template-*`, `hz-settings-template-*`, `hz-product-shell-*`
- Tokens: emerald/gold/ivory via existing `--hz-*` variables
- Detail panel: `var(--hz-detail-panel-width, 360px)`
- Content max: `var(--hz-content-max-width, 1604px)`

---

## Public exports

- `@hallederiz/ui`: existing primitive exports unchanged paths
- **New:** `ProductPageShell`, `PageSection`, `SummaryBar`, `StickyActionFooter` from `./templates`
- **Breaking imports:** None identified (optional props only)

---

## Duplicate / local template findings (apps/web)

| Local pattern | Konum | Agent 04+ taşıma |
|---------------|-------|------------------|
| `ProductPageShell` (Next `Link`) | `apps/web/src/components/product-page-shell.tsx` | Agent 04+ wrapper → `@hallederiz/ui` shell |
| `EntityListPageTemplate` kısmi | orders, offers, payments pages | Agent 05 full adoption |
| `FilterToolbar` composition | approvals, tasks | Agent 04–05 slot migration |
| `DetailPanel` | approvals inbox, tasks workspace | Agent 04–06 |
| `EntityDetailLayout` + `FormPageShell` | offer/order/payment detail | Agent 05 |
| `SettingsLayout` | `SettingsAreaShell.tsx` | Agent 08 |
| Route-specific `hz-*` list CSS | customers, stock, orders, … | Agent 05+ (prefix korunur, template eklenir) |
| Custom right preview panels | `CustomersPage`, `StockPage`, … | Agent 05 — `DetailPanel` slots |

**Not:** Bu branch hiçbir route dosyasını değiştirmedi.

---

## Runtime PNG import scan

```text
rg "ui-design-output|desktop-default.png|mobile-default.png|00-design-system" apps/web packages/ui
→ No matches in packages/ui; apps/web unchanged for PNG paths
```

---

## Technical leakage scan

Templates default copy: Turkish, user-safe. No `Failed to fetch`, `stack trace`, `worker`, `outbox` in defaults.

---

## Body / yatay scroll

- Templates use `min-height: 0`, controlled overflow on table body and detail scroll.
- No global `body { overflow }` changes.
- `platform-content` contract untouched.
- **1920×1080 / 5+ rows:** CSS compact density provided; route adoption required for measured validation — **yerelde doğrulanmalı**.

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm --filter @hallederiz/ui typecheck` | ✅ Pass |
| `pnpm --filter @hallederiz/web typecheck` | ✅ Pass |
| `pnpm --filter @hallederiz/ui build` | ✅ Pass |
| `pnpm --filter @hallederiz/web build` | ✅ Pass |
| `pnpm smoke:navigation` | ✅ Pass (24 kritik bağlantı) |

---

## Known gaps

- Route pages still use local `hz-*` implementations; template adoption pending.
- `apps/web` `ProductPageShell` duplicate until Agent 04+ migration.
- Visual 5+ row claim requires route wiring + viewport check.
- `EntityTimelinePanel` not added (route branch scope).

---

## Agent 04+ handoff

- **Branch:** `ui/04-platform-operations`
- **Routes:** `/login`, `/dashboard`, `/panel`, `/hizli-islem`, `/onaylar`, `/onaylar/[id]`, `/onaylar/kurallar`, `/workflow/[type]/[id]`
- Use layout templates; do not rewrite AppShell or Agent 03 CSS foundation.
