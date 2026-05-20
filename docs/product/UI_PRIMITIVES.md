# UI primitives & foundation tokens — Agent 01

**Branch:** `ui/01-foundation-tokens-primitives`  
**Base:** `c228bc7` — design reference package on `main`

Emerald / gold / ivory foundation for `@hallederiz/ui`. Mockup PNG’ler yalnızca `docs/design/ui-design-output/**` altında referanstır; **runtime import yok**.

---

## Token sistemi

### CSS variables (canonical)

Tanım: `packages/ui/src/styles/tokens.css` (web: `apps/web/app/globals.css` üzerinden `@import`).

| Variable | Değer / bağlantı |
|----------|------------------|
| `--hz-color-emerald` | `#047857` |
| `--hz-color-sidebar` | `#064E3B` |
| `--hz-color-gold` | `#D6A21E` |
| `--hz-color-gold-soft` | `#F7D774` |
| `--hz-color-bg` | `#F8F6EF` |
| `--hz-color-surface` | `#FFFDF7` |
| `--hz-color-text` | `#17231D` |
| `--hz-color-muted` | `#667568` |
| `--hz-color-danger` | `#B42318` |
| `--hz-color-info` | `#2563EB` |
| `--hz-radius-card` | `16px` (globals ile hizalı) |
| `--hz-content-max-width` | `1604px` |
| `--hz-detail-panel-width` | `360px` |

### Semantic aliases

- `color.brand.*` → `--hz-brand-primary`, `--hz-brand-sidebar`, `--hz-brand-gold`
- `color.surface.*` → `--hz-surface-canvas`, `--hz-surface-card`, …
- `color.status.*` → success / warning / danger / info foundation anahtarları

### Primitive scope (`hz-ui-*` only)

`--hz-ui-brand-primary`, `--hz-ui-focus-ring`, `--hz-ui-surface`, … — **yalnızca** `hz-ui-*` sınıfları (`foundation-primitives.css`). AppShell ve route sınıfları (`hz-btn`, sidebar, KPI) legacy `--hz-primary` / lacivert token’ları Agent 02’ye kadar korunur.

### TypeScript exports

`packages/ui/src/tokens/`:

- `hzFoundationColors` — literal palette
- `hzSemanticTokens` — typed semantic map
- `hzCssVariables` / `hzVar()` — CSS custom property adları

```ts
import { hzFoundationColors, hzVar } from "@hallederiz/ui";
```

### Legacy uyumluluk

- Mevcut `--hz-primary`, `--hz-accent` (mor/lacivert) **silinmedi**; route/shell kırılmasını önlemek için Agent 02’de sidebar/header geçişi yapılacak.
- `Ui*` bileşenleri emerald foundation ile güncellendi (`foundation-primitives.css`).

---

## Primitive bileşenler

Stiller: `apps/web/app/globals.css` (`hz-ui-*`) + `packages/ui/src/styles/foundation-primitives.css`.

| Bileşen | Dosya | Amaç |
|---------|--------|------|
| `UiButton` | `primitives/button.tsx` | CTA / ikincil / ghost / danger |
| `UiBadge` | `primitives/badge.tsx` | Durum rozeti |
| `UiCard`, `UiCardHeader` | `primitives/card.tsx` | Yüzey kartı |
| `UiInput`, `UiInputField` | `primitives/input.tsx` | Metin girişi |
| `UiSelect`, `UiSelectField` | `primitives/select.tsx` | Seçim kutusu |
| `UiTabs` | `primitives/tabs.tsx` | `TabSwitcher` alias |
| `UiModal` | `primitives/modal.tsx` | Diyalog |
| `UiDrawer` | `primitives/drawer.tsx` | Yan panel |
| `UiSkeleton` | `primitives/skeleton.tsx` | Yükleme iskeleti |

### UiButton

- **Props:** `variant`, `size`, `loading`, standart `button` attrs
- **Variants:** `primary` (zümrüt), `secondary`, `ghost`, `danger`
- **States:** `disabled`, `loading` → `aria-busy`, `is-loading`
- **A11y:** `focus-visible` halka (`--hz-ui-focus-ring`)
- **Sınır:** Mutation / API yok; yalnızca presentational

### UiBadge

- **Props:** `tone`: `neutral` \| `info` \| `success` \| `warning` \| `danger`
- **Not:** `warning` altın ton; `success` zümrüt

### UiCard

- **Props:** `padding`, `interactive`
- **Surface:** `--hz-ui-surface`, radius `--hz-radius-card`

### UiInput / UiSelect

- **States:** `:focus`, `:disabled`
- **Field wrappers:** `UiInputField`, `UiSelectField` (label + hint)

### UiTabs

- `TabSwitcher` re-export; sınıf `hz-tab-switcher` (route layout Agent 03)

### UiModal / UiDrawer

- **Modal:** `role="dialog"`, `aria-modal`, Escape, backdrop click
- **Drawer:** `hz-ui-drawer--left|right`
- **Sınır:** AppShell mobile drawer değil (Agent 02)

### UiSkeleton

- **Props:** `lines`
- `aria-hidden` — dekoratif

---

## Shared state bileşenleri

| Bileşen | Varsayılan (Türkçe) | Not |
|---------|---------------------|-----|
| `LoadingState` | title: **Yükleniyor** | `message` opsiyonel; teknik jargon yok |
| `EmptyState` | title: **Kayıt bulunamadı**; message: **Bu alanda gösterilecek canlı veri henüz yok.** | `description` = `message` alias; sahte kayıt yok |
| `ErrorState` | title: **Bilgi alınamadı**; message: **İşlem şu anda tamamlanamadı…** | Stack trace / API metni default’ta yok |
| `SuccessState` | title: **İşlem tamamlandı** | `message` opsiyonel; sahte mutation iddiası yok |
| `DisabledNotice` | title: **Bu işlem şu anda kullanılamıyor.** | `message` opsiyonel |
| `DestructiveConfirmModal` | cancel: **Vazgeç**; confirm: **Onayla** | `onConfirm` callback; API yok |

`state-panels.tsx` — geriye dönük re-export barrel.

### Yasaklar (state)

- Fake data / demo müşteri-ürün üretimi
- Fake provider veya otomatik başarı
- `Failed to fetch`, stack trace, exception metni (default UI)
- PNG runtime import

---

## Kullanım sınırı

- **Agent 01:** tokens + primitives + shared states
- **Agent 02:** AppShell, Sidebar, Header, `PageContent`, mobile drawer
- **Agent 03:** `EntityListPageTemplate`, `FilterToolbar`, `DataTableShell`, `DetailPanel`, `FormPageShell`, …
- **Agent 04+:** route adoption

Eski sınıflar (`hz-btn`, `hz-badge`, `hz-state-card`) route’larda kalır; yeni kodda mümkünse `Ui*` tercih edilir.

---

## İlgili dokümanlar

- [UI_SCOPE_GUARD.md](./UI_SCOPE_GUARD.md)
- [UI_MOCKUP_IMPLEMENTATION_PLAN.md](./UI_MOCKUP_IMPLEMENTATION_PLAN.md)
- [UI_AGENT_01_REPORT.md](./UI_AGENT_01_REPORT.md)
- [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md) (Agent 02)
