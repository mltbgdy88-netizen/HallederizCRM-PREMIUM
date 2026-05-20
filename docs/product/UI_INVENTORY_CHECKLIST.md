# UI Inventory Checklist — Agent 00

**Base:** `10f2f40` — feat(platform): add live worker and commercial execution foundation (#122)  
**İnceleme tarihi:** 2026-05-20 (repo dosya sistemi taraması)

---

## 1. Mockup package checklist

| Madde | Beklenen | Repo durumu (10f2f40) |
|-------|----------|------------------------|
| Kök klasör `docs/design/ui-design-output/` | Var | **YOK** — `docs/design/` klasörü bile yok |
| `MANIFEST.md` | Var | **YOK** |
| `CHECKLIST.md` | Var | **YOK** |
| `CURSOR_REFERENCE_README.md` | Var | **YOK** |
| `manifest.json` | Var | **YOK** |
| `00-design-system/` | Var | **YOK** |
| Route/layer klasör sayısı | ~53 | **0** (paket eksik) |
| PNG mockup sayısı | ~319 | **0** |
| Markdown doküman sayısı | ~56 | **0** |
| Desktop boyut | 1920×1080 | Doğrulanamadı (paket yok) |
| Mobile boyut | 390×844 | Doğrulanamadı (paket yok) |
| Route başına `notes.md` | Her route | **N/A** |
| Zorunlu state PNG seti | default/loading/empty/error/mobile | **N/A** |

**Sonuç:** Mockup referans paketi repoda **henüz commit edilmemiş** veya farklı konumda tutuluyor. UI dönüşümü başlamadan önce paketin repoya veya erişilebilir read-only mount’a eklenmesi gerekir. Agent 00 paketi **düzeltmez**; yalnızca gap kaydeder.

**Geçici kaynaklar (mevcut):**

- `docs/product/UI_SCREENS_IMPLEMENTATION_BACKLOG.md`
- `docs/product/PRODUCTION_ROUTE_MANIFEST.md`
- `docs/product/DESIGN_TOKENS.md` (legacy lacivert token — Agent 01’de güncellenecek)
- `.cursor/rules/ui-rules.mdc` / `ui-designer-rules.mdc` (operasyon kuralları)

---

## 2. Design system checklist (`00-design-system/`)

| Dosya | Durum |
|-------|--------|
| `colors.png` | Paket yok |
| `typography.png` | Paket yok |
| `components.png` | Paket yok |
| `table-system.png` | Paket yok |
| `status-badges.png` | Paket yok |
| `empty-loading-error-states.png` | Paket yok |
| `notes.md` | Paket yok |

Hedef token seti: `UI_SCOPE_GUARD.md` §8 (emerald/gold).

---

## 3. `packages/ui` primitive / template checklist

| Component (hedef ad) | Durum | Konum | Gap | Target agent |
|----------------------|-------|-------|-----|--------------|
| UiButton | **Mevcut** | `primitives/button.tsx` (`Button`) | İsimlendirme/export birleşimi | 01 |
| UiBadge | **Mevcut** | `primitives/badge.tsx` | Emerald tema | 01 |
| UiCard | **Mevcut** | `primitives/card.tsx` | Radius 16px hizası | 01 |
| UiInput | **Mevcut** | `primitives/input.tsx` | — | 01 |
| UiSelect | **Mevcut** | `primitives/select.tsx` | — | 01 |
| UiTabs | **Mevcut** | `primitives/tabs.tsx` | — | 01 |
| UiModal | **Mevcut** | `primitives/modal.tsx` | — | 01 |
| UiDrawer | **Mevcut** | `primitives/drawer.tsx` | Mobile drawer shell ile hizalama | 01–02 |
| UiSkeleton | **Mevcut** | `primitives/skeleton.tsx` | — | 01 |
| LoadingState | **Mevcut** | `primitives/loading-state.tsx` | Route-level `loading.tsx` yok | 01, 04+ |
| EmptyState | **Mevcut** | `primitives/empty-state.tsx` | — | 01 |
| ErrorState | **Mevcut** | `primitives/error-state.tsx` | App Router `error.tsx` yok | 01, 04+ |
| SuccessState | **Mevcut** | `primitives/success-state.tsx` | — | 01 |
| DisabledNotice | **Mevcut** | `primitives/disabled-notice.tsx` | — | 01 |
| DestructiveConfirmModal | **Mevcut** | `primitives/destructive-confirm-modal.tsx` | — | 01 |
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

| Madde | Durum | Not |
|-------|--------|-----|
| Global shell | **Mevcut** | `apps/web/src/components/platform-shell.tsx` → `@hallederiz/ui` `AppShell` |
| Sidebar tek kaynak | **Mevcut** | `packages/ui/app-shell/sidebar.tsx` + `product-sidebar-nav.tsx` |
| İkinci sidebar (route içi) | **Yok (shell)** | Detay sayfalarında `EntityDetailLayout` **sağ özet** kolonu var (timeline değil) |
| `PageContent` + `platform-content` | **Mevcut** | `packages/ui/primitives/page-content.tsx`; `globals.css` `:has()` kuralları |
| Header | **Mevcut** | `packages/ui/app-shell/header.tsx` + `PlatformShell` PageMeta |
| Mobile drawer | **Mevcut** | `AppShell` hamburger + `hz-shell-sidebar-mobile` |
| Content max width | **1604px** | `--hz-content-max-width` |
| Detail panel width | **336px** (mevcut) | Hedef **360px** — Agent 03 |
| Body / yatay scroll risk | **Orta** | Fit-viewport sayfalar (`hz-dashboard-page--fit`, `hz-qop-page`, vb.) özel; yerelde 1920×1080 doğrulanmalı |
| Active nav style | **Mevcut** | `resolveActiveHref` + sidebar |
| Route metadata / PageMeta | **Mevcut** | `shouldSuppressShellPageMeta` + `PAGE_META` |

**Agent 02 odak:** emerald sidebar, gold accent, header yoğunluğu, mobile drawer polish, legacy mor/lacivert token temizliği (`globals.css`).

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
