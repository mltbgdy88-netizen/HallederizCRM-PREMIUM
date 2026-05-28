# UI Agent 02 Report — AppShell / Sidebar / Header

**Branch:** `ui/02-appshell-sidebar-header`  
**Base commit:** `f222810` — feat(ui): add foundation tokens and primitives (#125)  
**Commit:** _(local — feat(ui): update appshell sidebar and header foundation)_

---

## Scope

| Alan | Durum |
|------|--------|
| AppShell / mobile drawer a11y | Yapıldı |
| Sidebar emerald + gold active | Yapıldı |
| Header ivory surface | Yapıldı |
| PageContent / platform-content | Korundu |
| shell-foundation.css | Yapıldı |
| Route pages / features | **Dokunulmadı** |
| Backend / API / auth | **Dokunulmadı** |
| Mockup PNG runtime import | **Yok** |

---

## Değişen dosyalar

- `packages/ui/src/app-shell/app-shell.tsx` — `use client`, Escape, body lock, aria
- `packages/ui/src/app-shell/sidebar.tsx` — `aria-current`
- `packages/ui/src/styles/shell-foundation.css` (yeni)
- `apps/web/app/globals.css` — shell import; `--hz-bg` / `--hz-surface` → foundation aliases
- `docs/product/UI_APPSHELL_LAYOUT.md` (yeni)
- `docs/product/UI_AGENT_02_REPORT.md` (bu dosya)
- `docs/product/UI_INVENTORY_CHECKLIST.md`
- `docs/product/UI_MOCKUP_IMPLEMENTATION_PLAN.md`

---

## AppShell

- Mobile drawer: Escape, backdrop, body `overflow: hidden`
- Hamburger: `Menüyü aç` / `Menüyü kapat`, `aria-expanded`, `aria-controls`
- Desktop sidebar: `aria-label="Ana menü"`
- Mobile nav: `id="hz-shell-mobile-nav"`, `role="navigation"`

## Sidebar

- Background: `#064E3B` via `--hz-color-sidebar`
- Active: emerald mix + **3px gold left border**
- Hover: translucent emerald
- Logo glyph: gold gradient (no PNG)
- Navigation paths / sections: **unchanged**

## Header

- Surface: `--hz-color-surface` (ivory)
- Search / meta: foundation text colors
- `hz-header-quick-primary`: solid emerald (purple gradient removed)
- PageMeta API: **unchanged**

## PageContent

- `platform-content hz-page-content` **preserved**
- Fit-viewport `:has()` rules **preserved**; frame bg → `--hz-color-bg`

## Mobile drawer

- Width 288px max; rounded edge; emerald-tinted backdrop
- Route change closes drawer (existing `PlatformShell` effect)

## Scans

| Scan | Sonuç |
|------|--------|
| Mockup PNG in apps/web, packages/ui | Temiz |
| Technical leakage in packages/ui app-shell | Temiz |
| Fake provider in shell | Yok |

## Tests

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | **PASS** |
| `pnpm --filter @hallederiz/ui typecheck` | **PASS** |
| `pnpm --filter @hallederiz/ui build` | **PASS** |
| `pnpm --filter @hallederiz/web build` | Çalıştırılmadı (opsiyonel; typecheck yeterli) |
| `pnpm smoke:navigation` | **PASS** (24 link) |

## Known gaps

- Route `hz-btn` / `hz-badge` hâlâ legacy `--hz-primary` / mor gradient kullanabilir (Agent 04+).
- `--hz-accent` mor token `:root`’ta (primitives dışı).
- Görsel doğrulama 1920×1080 / 390×844 **yerelde yapılmalı**.
- `DisabledNotice` / shell loading states: route adoption yok.

## Agent 03 handoff

`ui/03-layout-templates` — EntityListPageTemplate, FilterToolbar, DataTableShell, DetailPanel, FormPageShell, SettingsLayout, ProductPageShell. **No route pages.**
