# UI primitives (@hallederiz/ui) — Task 03

Ortak bileşenler `packages/ui/src/primitives/` altında; stiller `apps/web/app/globals.css` içinde **`hz-ui-*`** sınıflarıyla tanımlıdır (tasarım token’ları: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)).

## Bileşen → sınıf özeti

| Bileşen | Dosya | Ana sınıflar |
|---------|--------|----------------|
| `UiButton` | `button.tsx` | `hz-ui-btn`, `hz-ui-btn--{primary\|secondary\|ghost\|danger}`, `hz-ui-btn--{sm\|md}`, `is-loading` |
| `UiBadge` | `badge.tsx` | `hz-ui-badge`, `hz-ui-badge--{neutral\|info\|success\|warning\|danger}` |
| `UiCard`, `UiCardHeader` | `card.tsx` | `hz-ui-card`, `hz-ui-card--pad-*`, `hz-ui-card--interactive` |
| `UiInput`, `UiInputField` | `input.tsx` | `hz-ui-input`, `hz-ui-input-wrap`, `hz-ui-input-label` |
| `UiSelect`, `UiSelectField` | `select.tsx` | `hz-ui-select` |
| `UiTabs` (alias) | `tabs.tsx` | Mevcut `TabSwitcher` / `hz-tab-switcher` |
| `UiModal` | `modal.tsx` | `hz-ui-modal-backdrop`, `hz-ui-modal`, … |
| `UiDrawer` | `drawer.tsx` | `hz-ui-drawer-backdrop`, `hz-ui-drawer`, `hz-ui-drawer--left\|right` |
| `UiSkeleton` | `skeleton.tsx` | `hz-ui-skeleton`, `hz-ui-skeleton-stack` |
| `LoadingState`, `EmptyState`, `ErrorState` | `loading-state.tsx`, `empty-state.tsx`, `error-state.tsx` | `hz-ui-empty`, `hz-ui-error` (geriye dönük API `state-panels` üzerinden de export edilir) |

## Durum davranışı

- **Button:** `disabled` / `loading` → `opacity`, `pointer-events`, `aria-busy`.
- **Input / Select:** `:disabled`, `:focus` token tabanlı border ve halka.
- **Modal / Drawer:** dış alan `mousedown` ile kapatma; odak için kapat düğmesinde `focus-visible` (modal close sınıfı paylaşımlı).

## Eski sınıflar

Liste ve formlarda hâlâ kullanılan `hz-state-card`, `hz-badge`, `hz-tab-switcher` vb. ile **yan yana** yaşar; yeni ekranlarda mümkünse `Ui*` + `hz-ui-*` tercih edin.

Kabuk ve sayfa gövdesi hiyerarşisi için bkz. [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md).

Liste / filtre / tablo / detay şablonları için bkz. [UI_LAYOUT_PATTERNS.md](./UI_LAYOUT_PATTERNS.md).
