# UI Agent 01 Report — foundation tokens & primitives

**Branch:** `ui/01-foundation-tokens-primitives`  
**Base commit:** `c228bc7` — `docs(ui): add design reference package (#124)`  
**Commit:** _(local — feat(ui): add foundation tokens and primitives)_

---

## Scope

| Alan | Durum |
|------|--------|
| Design tokens (emerald/gold/ivory) | Yapıldı |
| `packages/ui` primitives API normalize | Yapıldı |
| Shared Loading/Empty/Error/Success/Disabled/DestructiveConfirm | Yapıldı |
| `apps/web` global token import | Yapıldı (`globals.css` @import only) |
| AppShell / Sidebar / Header | **Dokunulmadı** |
| Route pages / feature screens | **Dokunulmadı** |
| Backend / API / worker / DB / auth | **Dokunulmadı** |
| `docs/design/ui-design-output/**` | **Dokunulmadı** |
| PNG runtime import | **Yok** |

---

## Değişen dosyalar

### packages/ui

- `src/tokens/colors.ts` — palette literals
- `src/tokens/css-variables.ts` — CSS var names + `hzVar()`
- `src/tokens/semantic.ts` — semantic token map
- `src/tokens/index.ts`
- `src/styles/tokens.css` — foundation `:root` variables
- `src/styles/foundation-primitives.css` — `hz-ui-*` emerald overrides
- `src/index.ts` — export tokens
- `src/primitives/loading-state.tsx`
- `src/primitives/empty-state.tsx`
- `src/primitives/error-state.tsx`
- `src/primitives/success-state.tsx`
- `src/primitives/disabled-notice.tsx`
- `src/primitives/destructive-confirm-modal.tsx`

### apps/web

- `app/globals.css` — `@import` tokens + foundation; `--hz-radius-card: 16px`; `--hz-detail-panel-width: 360px`

### docs/product

- `UI_PRIMITIVES.md` (güncellendi)
- `UI_AGENT_01_REPORT.md` (bu dosya)
- `UI_INVENTORY_CHECKLIST.md` (§3 Agent 01 sonrası)
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md` (Agent 01 tamam notu)

---

## Tokens added/updated

- Canonical: `--hz-color-emerald`, sidebar, gold, bg, surface, text, muted, danger, info
- Semantic: `--hz-brand-*`, `--hz-surface-*`, `--hz-status-*-foundation`
- Primitive scope: `--hz-ui-brand-primary`, `--hz-ui-focus-ring`, …
- Layout alignment: card radius 16px, detail panel 360px
- Legacy `--hz-primary` / `--hz-accent` **korundu** (shell/route Agent 02)

---

## Components added/updated

| Component | Change |
|-----------|--------|
| UiButton | CSS foundation (solid emerald primary) |
| UiBadge | success/warning/danger token hizası |
| UiCard | surface token |
| UiInput / UiSelect | focus ring emerald |
| UiTabs / UiModal / UiDrawer / UiSkeleton | mevcut; export korundu |
| LoadingState | `message` optional; `aria-live` |
| EmptyState | default message; `description` alias |
| ErrorState | safe TR defaults |
| SuccessState | optional message |
| DisabledNotice | default title; optional message |
| DestructiveConfirmModal | confirm default **Onayla** |

Yeni dosya yok (hepsi mevcut primitive’lerin üzerinde).

---

## Public exports

- `export * from "./tokens"` → `hzFoundationColors`, `hzSemanticTokens`, `hzCssVariables`, `hzVar`
- Mevcut primitive export’ları **korundu** (`UiButton`, `LoadingState`, …)
- Breaking rename yok

---

## Duplicate / local component findings

| Bulgu | Konum | Öneri |
|-------|--------|-------|
| `TabEmptyState` | `apps/web/.../CustomerTabs.tsx` | Agent 05 cariler — `EmptyState` ile değiştir |
| `hz-btn` / `hz-btn-primary` | çok sayıda feature route | Agent 04+ — `UiButton` veya shell CTA token |
| `hz-badge`, `hz-state-card` | liste/demo sayfaları | Agent 03–05 layout adoption |
| `DestructiveConfirmModal` | apps/web’de import yok | route branch’lerinde packages/ui kullanımı |
| `DisabledNotice` | apps/web’de import yok | WhatsApp/settings branch |

**packages/ui** içinde tekrar yok; tek kaynak primitives + app-shell.

---

## Technical leakage scan

| Pattern | packages/ui | apps/web |
|---------|-------------|----------|
| `Failed to fetch` default UI | Yok | Test/sanitize only (`user-facing-data-error.ts`) |
| `lorem` / `ipsum` | Yok | Yok |
| stack trace in state components | Yok | Yok |

State default metinleri operatör dili (TR); teknik API/worker jargonu yok.

---

## Tests

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | **PASS** |
| `pnpm --filter @hallederiz/ui typecheck` | **PASS** |
| `pnpm --filter @hallederiz/ui build` | **PASS** |
| `pnpm smoke:navigation` | **PASS** (24 link) |

---

## Known gaps

- AppShell / sidebar hâlâ legacy lacivert/mor CSS (`--hz-primary`, `--hz-accent`) — **Agent 02**
- `hz-btn` route sınıfları emerald’a geçmedi — route branch’leri
- `CURSOR_REFERENCE_README.md` mockup paketinde yok (minor)
- `DESIGN_TOKENS.md` legacy açıklama — Agent 02 ile senkron önerilir
- Storybook / görsel regression yok

---

## Agent 02 / 03 handoff

**Agent 02 (`ui/02-appshell-sidebar-header`):**

- `--hz-color-sidebar` → sidebar arka plan
- Header / `PageContent` / mobile drawer
- Legacy `--hz-primary` shell genelinde emerald’a map

**Agent 03 (`ui/03-layout-templates`):**

- `FilterToolbar`, `DataTableShell`, `EntityListPageTemplate` yoğunluk + 360px panel
- `ProductPageShell` monorepo paylaşımı
- `TabEmptyState` / `hz-btn` → `Ui*` migration planı

**Agent 04+:** route mockup adoption; App Router `loading.tsx` / `error.tsx` (opsiyonel)
