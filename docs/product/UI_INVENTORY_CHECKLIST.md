# UI Inventory Checklist — Agent 00 / 01

**Base:** `c228bc7` — design reference package (#124)  
**İnceleme tarihi:** 2026-05-20 (Agent 00 + 00B + **01**)

---

## 1. Mockup package checklist

| Madde | Beklenen | Repo durumu (00B — ZIP entegrasyonu) |
|-------|----------|--------------------------------------|
| Kök klasör `docs/design/ui-design-output/` | Var | **Var** |
| `MANIFEST.md` | Var | **Var** |
| `CHECKLIST.md` | Var | **Var** |
| `CURSOR_REFERENCE_README.md` | Var | **Yok** (minor gap) |
| `manifest.json` | Var | **Var** |
| `00-design-system/` | Var | **Var** |
| Route/layer klasör sayısı | ~53 | **53** |
| PNG mockup sayısı | ~319 | **319** |
| Markdown doküman sayısı | ~56 | **56** |
| `notes.md` sayısı | ~54 | **54** |
| Desktop boyut | 1920×1080 | manifest ile uyumlu |
| Mobile boyut | 390×844 | manifest ile uyumlu |
| Zorunlu state PNG seti | default/loading/empty/error/mobile | **Eşleşti** (53/53/53/53/53) |

**Sonuç:** Paket repoda. **Agent 01 unblock.** Eksik: yalnız `CURSOR_REFERENCE_README.md`. Kaynak ZIP: `ui-design-output-project-reviewed-full-package.zip`. Detay: `UI_DESIGN_REFERENCE_PACKAGE_REPORT.md`.

**Geçici kaynaklar (mevcut):**

- `docs/product/UI_SCREENS_IMPLEMENTATION_BACKLOG.md`
- `docs/product/PRODUCTION_ROUTE_MANIFEST.md`
- `docs/product/DESIGN_TOKENS.md` (legacy lacivert token — Agent 01’de güncellenecek)
- `.cursor/rules/ui-rules.mdc` / `ui-designer-rules.mdc` (operasyon kuralları)

---

## 2. Design system checklist (`00-design-system/`)

| Dosya | Durum |
|-------|--------|
| `colors.png` | Var |
| `typography.png` | Var |
| `components.png` | Var |
| `table-system.png` | Var |
| `status-badges.png` | Var |
| `empty-loading-error-states.png` | Var |
| `notes.md` | Var |

Hedef token seti: `UI_SCOPE_GUARD.md` §8 (emerald/gold).

---

## 3. `packages/ui` primitive / template checklist

**Agent 01 (2026-05-20):** Emerald/gold foundation tokens (`packages/ui/src/tokens/`, `src/styles/tokens.css`); `hz-ui-*` primitive CSS (`foundation-primitives.css`); shared state TR defaults. **AppShell / route adoption yapılmadı.**

**Agent 02 (2026-05-20):** AppShell/Sidebar/Header/mobile drawer (`shell-foundation.css`, `app-shell.tsx` a11y). Sidebar `#064E3B`, active gold border, header ivory. **Route/template adoption yapılmadı.**

**Agent 03 (2026-05-20):** Layout template foundation (`layout-templates.css`, slot API’ler, `ProductPageShell` packages/ui). **Route adoption yapılmadı** — Agent 04+.

| Component (hedef ad) | Durum | Konum | Gap | Target agent |
|----------------------|-------|-------|-----|--------------|
| UiButton | **Hazır (foundation)** | `primitives/button.tsx` | Route `hz-btn` migration | 04+ |
| UiBadge | **Hazır (foundation)** | `primitives/badge.tsx` | — | — |
| UiCard | **Hazır (foundation)** | `primitives/card.tsx` | — | — |
| UiInput | **Hazır (foundation)** | `primitives/input.tsx` | — | — |
| UiSelect | **Hazır (foundation)** | `primitives/select.tsx` | — | — |
| UiTabs | **Hazır** | `primitives/tabs.tsx` | — | — |
| UiModal | **Hazır** | `primitives/modal.tsx` | — | — |
| UiDrawer | **Hazır** | `primitives/drawer.tsx` | Mobile drawer shell ile hizalama | **02** |
| UiSkeleton | **Hazır** | `primitives/skeleton.tsx` | — | — |
| LoadingState | **Hazır** | `primitives/loading-state.tsx` | Route-level `loading.tsx` yok | 04+ |
| EmptyState | **Hazır** | `primitives/empty-state.tsx` | `TabEmptyState` local duplicate (web) | 05 |
| ErrorState | **Hazır** | `primitives/error-state.tsx` | App Router `error.tsx` yok | 04+ |
| SuccessState | **Hazır** | `primitives/success-state.tsx` | — | — |
| DisabledNotice | **Hazır** | `primitives/disabled-notice.tsx` | apps/web kullanımı az | 07 |
| DestructiveConfirmModal | **Hazır** | `primitives/destructive-confirm-modal.tsx` | apps/web adoption | 04+ |
| FilterToolbar | **Hazır (foundation)** | `primitives/filter-bar.tsx` | Route slot adoption | 04+ |
| DataTableShell | **Hazır (foundation)** | `primitives/data-table.tsx` | Route state/mobile wiring | 05+ |
| DetailPanel | **Hazır (foundation)** | `primitives/detail-panel.tsx` | Route preview adoption | 04+ |
| EntityListPageTemplate | **Hazır (foundation)** | `primitives/entity-list-page-template.tsx` | apps/web tam adoption | 05+ |
| EntityDetailLayout | **Hazır (foundation)** | `primitives/entity-detail-layout.tsx` | Timeline route adoption | 04–05+ |
| FormPageShell | **Hazır (foundation)** | `primitives/form-page-shell.tsx` | Route form adoption | 04–05+ |
| SettingsLayout | **Hazır (foundation)** | `primitives/settings-layout.tsx` | Route adoption | 08 |
| ProductPageShell | **Hazır (packages/ui)** | `templates/product-page-shell.tsx` | apps/web duplicate migrate | 04+ |
| PageSection / SummaryBar / StickyActionFooter | **Hazır** | `templates/*` | Route adoption | 05+ |

**Duplicate / local risk:** Liste sayfalarının çoğu `apps/web/src/features/*/*Page.tsx` içinde özel `hz-*` CSS ile implemente; `EntityListPageTemplate` her yerde kullanılmıyor.

---

## 4. AppShell / layout checklist

**Agent 02 (2026-05-20):** Shell foundation tamam — `shell-foundation.css`, emerald sidebar, ivory header, mobile drawer a11y. Bkz. `UI_APPSHELL_LAYOUT.md`.

| Madde | Durum | Not |
|-------|--------|-----|
| Global shell | **Hazır (Agent 02)** | `AppShell` + `shell-foundation.css` |
| Sidebar tek kaynak | **Hazır (Agent 02)** | `#064E3B`, active gold left border |
| İkinci sidebar (route içi) | **Yok (shell)** | Detay sağ kolon — template hazır; route adoption 04+ |
| `PageContent` + `platform-content` | **Korundu** | Sınıf ve `:has()` zinciri aynı |
| Header | **Hazır (Agent 02)** | Ivory surface; PageMeta API aynı |
| Mobile drawer | **Hazır (Agent 02)** | Escape, body lock, TR aria labels |
| Content max width | **1604px** | `--hz-content-max-width` |
| Detail panel width | **360px** | Agent 01 token + Agent 03 `DetailPanel` CSS |
| Body / yatay scroll risk | **Orta** | Yerelde 1920×1080 / 390×844 doğrulanmalı |
| Active nav style | **Korundu** | `resolveActiveHref` + `aria-current` |
| Route metadata / PageMeta | **Korundu** | `suppressPageMeta` mantığı aynı |

**Agent 03:** layout template foundation tamam (`UI_LAYOUT_PATTERNS.md`).

**Agent 04 (2026-05-21):** Platform/operations route adoption tamam — `ui/04-platform-operations` @ `3fa7c74`. `/login` split, `/dashboard` 5 KPI + AI «İncele», `/panel` loading redirect, `/hizli-islem` stepper, `/onaylar` + detay + kurallar, `/workflow` timeline. `loading.tsx`: login, panel, dashboard, hizli-islem, onaylar. Detay: `UI_AGENT_04_REPORT.md`. **Sonraki:** Agent 05 CRM/commercial.

---

## 5. Route state checklist (hedef)

| State | App Router | Feature component | Mockup PNG |
|-------|------------|-------------------|------------|
| default | `page.tsx` | Çoğu route | Paket yok |
| loading | `loading.tsx` | **5 dosya** (Agent 04 platform) | error segment yok |
| error | `error.tsx` | **0 dosya** | Agent 05+ |
| empty | `EmptyState` / özel | Kısmi | — |
| mobile | CSS breakpoint | Mevcut kırılım; 390×844 QA Agent 09 | — |
| validation | Form sayfaları | `cariler/yeni`; hub’larda yok | — |
| submitted / success | Toast + hub copy | Hızlı İşlem sonrası | — |
| detail | `[id]` sayfaları | Geniş | — |
| audit timeline | `EntityTimelinePanel` | payment, document, customer, approval | order/offer/invoice: **kısmi/eksik** |
| placeholder | `ProductPageShell` / catch-all | Çok sayıda alt rota | — |

---

## 6. Content safety checklist (kod taraması — değiştirilmedi)

| Madde | Sonuç |
|-------|--------|
| Türkçe metin | Genel olarak Türkçe |
| Lorem ipsum | **Bulunamadı** (`rg` apps/web) |
| Sahte müşteri/firma (demo) | `*-mock-data.ts`, `demo/` — demo modunda; canlıda fail-closed copy |
| Sahte telefon/adres | Demo veri dosyalarında |
| Sahte fatura no örnekleri | Filtre placeholder `INV-1201` (InvoicesPage) — Agent 05 |
| Sahte ürün fotoğrafı | **Bulunamadı** (açık img mock) |
| Sahte PDF | Toast: “canlı PDF gönderimi henüz bağlı değil” — güvenli; sahte binary preview yok |
| Sahte harita | **Bulunamadı** |
| Yasak AI mutation copy | **Bulunamadı** (`Uygula`/`Otomatik kaydet`/`Değiştirildi` AI feature’da) |
| Hub route form davranışı | **Uyumlu** — Offer/Order/Payment CreateHub |

---

## 7. `apps/web` route envanteri (özet)

- `page.tsx` sayısı: **88** (platform + login + approvals alias)
- `loading.tsx` / `error.tsx`: **0**
- Catch-all `ProductPageShell`: `[...productSlug]`, `raporlar/[...]`, `ayarlar/[...]`, `kurulum/[...]`, `stok/[...]`, `hizli-islem/[...]`, çok sayıda `gorevler/*` alt sayfa

Detay matris: `UI_ROUTE_COVERAGE_MATRIX.md`.
