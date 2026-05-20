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
| FilterToolbar | **Kısmi** | `primitives/filter-bar.tsx` | İsim + API `FilterToolbar` | 03 |
| DataTableShell | **Kısmi** | `primitives/data-table.tsx` | Yoğunluk token hizası | 03 |
| DetailPanel | **Mevcut** | `primitives/detail-panel.tsx` | 360px hedef genişlik | 03 |
| EntityListPageTemplate | **Mevcut** | `primitives/entity-list-page-template.tsx` | apps/web’de kısmi kullanım | 03, 05+ |
| EntityDetailLayout | **Mevcut** | `primitives/entity-detail-layout.tsx` | Timeline slot standardı | 03, 05+ |
| FormPageShell | **Mevcut** | `primitives/form-page-shell.tsx` | Hub route’larda kullanılmamalı | 03 |
| SettingsLayout | **Mevcut** | `primitives/settings-layout.tsx` | — | 03, 08 |
| ProductPageShell | **Eksik (packages/ui)** | `apps/web/src/components/product-page-shell.tsx` | Monorepo paylaşımı veya alias | 03 |

**Duplicate / local risk:** Liste sayfalarının çoğu `apps/web/src/features/*/*Page.tsx` içinde özel `hz-*` CSS ile implemente; `EntityListPageTemplate` her yerde kullanılmıyor.

---

## 4. AppShell / layout checklist

**Agent 02 (2026-05-20):** Shell foundation tamam — `shell-foundation.css`, emerald sidebar, ivory header, mobile drawer a11y. Bkz. `UI_APPSHELL_LAYOUT.md`.

| Madde | Durum | Not |
|-------|--------|-----|
| Global shell | **Hazır (Agent 02)** | `AppShell` + `shell-foundation.css` |
| Sidebar tek kaynak | **Hazır (Agent 02)** | `#064E3B`, active gold left border |
| İkinci sidebar (route içi) | **Yok (shell)** | Detay sağ kolon — Agent 03+ |
| `PageContent` + `platform-content` | **Korundu** | Sınıf ve `:has()` zinciri aynı |
| Header | **Hazır (Agent 02)** | Ivory surface; PageMeta API aynı |
| Mobile drawer | **Hazır (Agent 02)** | Escape, body lock, TR aria labels |
| Content max width | **1604px** | `--hz-content-max-width` |
| Detail panel width | **360px** | Agent 01 token; template adoption Agent 03 |
| Body / yatay scroll risk | **Orta** | Yerelde 1920×1080 / 390×844 doğrulanmalı |
| Active nav style | **Korundu** | `resolveActiveHref` + `aria-current` |
| Route metadata / PageMeta | **Korundu** | `suppressPageMeta` mantığı aynı |

**Agent 03 odak:** layout templates; route adoption Agent 04+.

---

## 5. Route state checklist (hedef)

| State | App Router | Feature component | Mockup PNG |
|-------|------------|-------------------|------------|
| default | `page.tsx` | Çoğu route | Paket yok |
| loading | `loading.tsx` | **0 dosya** | — |
| error | `error.tsx` | **0 dosya** | — |
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
