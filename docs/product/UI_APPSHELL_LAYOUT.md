# AppShell / Sidebar / Header — Agent 02 foundation

**Branch:** `ui/02-appshell-sidebar-header`  
**Base:** `f222810` — Agent 01 tokens/primitives on `main`

Emerald / gold / ivory global shell. Mockup PNG’ler yalnızca `docs/design/ui-design-output/**` referansıdır; **runtime import yok**.

---

## Katmanlar

1. **`AppShell`** — `packages/ui/src/app-shell/app-shell.tsx`  
   `hz-shell` → `hz-shell-frame` → desktop sidebar + `hz-shell-main` → header + `hz-shell-content` → `hz-shell-content-frame`.

2. **`PlatformShell`** — `apps/web/src/components/platform-shell.tsx`  
   Ürün nav, `Header`, `PageContent` sarmalayıcısı. Route listesi / PageMeta mantığı **değiştirilmedi**.

3. **`PageContent`** — `packages/ui/src/primitives/page-content.tsx`  
   Varsayılan: `platform-content hz-page-content` — `:has(...)` fit-viewport kuralları korunur.

4. **Stiller** — `packages/ui/src/styles/shell-foundation.css` (import: `apps/web/app/globals.css`)

---

## Shell token kullanımı

| Alan | Token / değer |
|------|----------------|
| Sidebar arka plan | `--hz-color-sidebar` (#064E3B) |
| Aktif nav | Emerald yüzey + **3px altın sol çizgi** |
| Header / kart yüzeyi | `--hz-color-surface` (#FFFDF7) |
| Canvas / workspace | `--hz-color-bg` (#F8F6EF) |
| CTA (header quick) | `--hz-color-emerald` |
| Vurgu / rozet | `--hz-color-gold` |
| Max içerik genişliği | `--hz-content-max-width` (1604px) |
| Detay panel (ileride) | `--hz-detail-panel-width` (360px) |

Legacy `--hz-primary` / `--hz-accent` (mor/lacivert) route `hz-btn` için hâlâ `:root`’ta; shell görünümü `shell-foundation.css` ile override edilir.

---

## Sidebar

- Tek sidebar kaynağı: `Sidebar` + `product-sidebar-nav` bölümleri.
- Desktop: `hz-shell-sidebar-desktop` (grid kolonu).
- Mobile: `hz-shell-sidebar-mobile` drawer (≤1180px).
- `aria-current="page"` aktif öğede.
- Badge: PlatformShell’de strip edilir (fake count yok).
- Logo alanı: placeholder glyph (PNG yok).

---

## Header

- Yüzey: açık fildişi (`--hz-color-surface`).
- `suppressPageMeta`, `leadingSlot`, `toolbarSlot`, arama, tema, kullanıcı slotları **korundu**.
- Dashboard greeting / arama placeholder’ları route mantığıyla aynı.

---

## PageContent / platform-content

- `asPlatformRoot={true}` (varsayılan) → `platform-content hz-page-content`.
- **Sınıf kaldırılmaz** — mevcut shell `:has()` zinciri bozulmaz.
- `max-width: 1604px`, `margin-inline: auto`, `min-height: 0` flex zinciri.

---

## Mobile drawer

| Davranış | Uygulama |
|----------|----------|
| Aç/kapa | `mobileSidebarOpen` + hamburger |
| Escape | `AppShell` `keydown` listener |
| Backdrop tıklama | `hz-shell-mobile-backdrop` |
| Body scroll lock | Drawer açıkken `overflow: hidden` |
| aria | `Menüyü aç` / `Menüyü kapat`, `aria-expanded`, `aria-controls`, `Ana menü` |
| Route değişimi | `PlatformShell` drawer’ı kapatır (mevcut) |

Genişlik: `min(288px, calc(100vw - 16px))`. Yatay scroll hedeflenmez (390×844 yerelde doğrulanmalı).

---

## Accessibility

- `focus-visible` — hamburger, sidebar item, header search, quick CTA.
- Sidebar `aria-current="page"` aktif route.
- Mobile `role="navigation"` + `aria-label="Ana menü"`.
- `prefers-reduced-motion` — drawer/sidebar transition kapatılır.

---

## Yasaklar (Agent 02)

- Route page / feature implementation.
- EntityList / DataTable / FilterToolbar adoption.
- Backend / API / auth değişikliği.
- Mockup PNG runtime import.
- İkinci sidebar.
- `platform-content` kaldırma.
- Body / yatay scroll artırma.

---

## Handoff

**Agent 03** (`ui/03-layout-templates`): EntityListPageTemplate, EntityDetailLayout, FormPageShell, SettingsLayout, DataTableShell, FilterToolbar, DetailPanel, ProductPageShell paylaşımı — **route adoption yok**.

**Agent 04+**: Route-level UI; `hz-btn` → `UiButton` migration.

Eski özet: [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md) (Task 04).
