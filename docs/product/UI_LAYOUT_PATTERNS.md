# UI Layout Patterns — Agent 03

**Branch:** `ui/03-layout-templates`  
**Base:** `b4fd295` — AppShell foundation (#126)  
**Durum:** Layout template foundation hazır; **route adoption Agent 04+**

---

## 1. Özet

Agent 03, Agent 01 (tokens/primitives) ve Agent 02 (AppShell) üzerine **presentational layout template** katmanını kurar:

- Liste: `EntityListPageTemplate` + `FilterToolbar` + `DataTableShell` + `DetailPanel`
- Detay: `EntityDetailLayout`
- Form: `FormPageShell` + `FormSectionCard` + `FormValidationSummary`
- Ayarlar: `SettingsLayout`
- Placeholder: `ProductPageShell` (`packages/ui`)

**CSS:** `packages/ui/src/styles/layout-templates.css` (`hz-layout-*`, `hz-template-*`, …)  
**Import:** `apps/web/app/globals.css` (yalnız layout CSS import)

**Yasaklar:** Route implementation, fake data, mockup PNG runtime import, API/SDK çağrısı.

---

## 2. Template listesi

| Template | Purpose | Primary export |
|----------|---------|----------------|
| FilterToolbar | Liste filtre/aksiyon bandı | `@hallederiz/ui` → `FilterToolbar` |
| DataTableShell | Tablo kabuğu + state/mobile slotları | `DataTableShell` |
| DetailPanel | Sağ önizleme/detay paneli (~360px) | `DetailPanel` |
| EntityListPageTemplate | Liste sayfası bileşimi | `EntityListPageTemplate` |
| EntityDetailLayout | Detay sayfası grid + slotlar | `EntityDetailLayout` |
| FormPageShell | Form gövdesi + sticky footer | `FormPageShell` |
| SettingsLayout | Sol nav + sağ içerik | `SettingsLayout` |
| ProductPageShell | Placeholder / API bekliyor ekranları | `ProductPageShell` |

**Yardımcılar:** `PageSection`, `SummaryBar`, `StickyActionFooter` (`packages/ui/src/templates/`)

---

## 3. FilterToolbar

**Purpose:** Liste üstü filtre, arama ve aksiyon yuvası.

**Props (özet):**

| Prop | Tip | Açıklama |
|------|-----|----------|
| `children` | `ReactNode` | Composition mode (mevcut `FilterToolbarRow` vb.) |
| `label` | `string?` | Üst etiket |
| `search` | `ReactNode?` | Arama slotu |
| `filters` | `ReactNode?` | Filtre slotu |
| `actions` | `ReactNode?` | Birincil aksiyonlar |
| `secondaryActions` | `ReactNode?` | İkincil aksiyonlar |
| `meta` | `ReactNode?` | Sağ meta |
| `isLoading` / `isDisabled` | `boolean?` | Görsel durum |

**Slots:** `search`, `filters`, `actions`, `secondaryActions`, `meta` veya `children`.

**Responsive:** `flex-wrap`; mobilde aksiyon satırı tam genişlik.

**Accessibility:** `aria-busy` loading; composition alt bileşenlerinde `FilterToolbarSearch` vb.

**Boundaries:** Filtre logic, API, fake seçenek yok.

**Route adoption:** Agent 05+ (cariler, stok, teklifler, …)

---

## 4. DataTableShell

**Purpose:** Tablo container; yoğunluk ve state slotları.

**Props (özet):**

| Prop | Açıklama |
|------|----------|
| `children` | Tablo gövdesi (`table` + `thead`/`tbody`) |
| `toolbar` | Üst araç çubuğu |
| `emptyState` / `loadingState` / `errorState` | State slotları |
| `state` | `'default' \| 'loading' \| 'empty' \| 'error'` |
| `mobileView` | Mobil kart listesi (masaüstü tablo gizlenir) |
| `footer` | Alt özet/sayfalama |
| `density` | `'default' \| 'compact'` (5+ satır hedefi) |

**Responsive:** `mobileView` verildiğinde ≤768px’te tablo gizlenir, kart slotu gösterilir.

**Accessibility:** `role="region"`, `aria-label`, `aria-busy` loading.

**Boundaries:** Kolon tanımı, satır verisi, fetch route’ta.

**Route adoption:** Agent 05+

---

## 5. DetailPanel

**Purpose:** Sağ preview/detay paneli; `--hz-detail-panel-width` (360px).

**Props:** `title`, `subtitle`, `eyebrow`, `actions`, `children`, `footer`, state slotları, `bodyScrollable`, `state`.

**Responsive:** `SplitContentLayout` + mobil drawer adoption route’ta.

**Accessibility:** `aside`, `aria-busy`, başlık `h3`.

**Boundaries:** Auto-select, fake preview, API yok.

**Route adoption:** Agent 04 (onaylar), 05+ (cariler, stok, …)

---

## 6. EntityListPageTemplate

**Purpose:** Liste ekranı ana iskeleti (header / summary / filters / list / preview).

**Props:** `title`, `description`, `header`, `summary`, `filters`, `bulkBar`, `list`, `pagination`, `preview`, `previewSideWidth`, `pageState`, `isLoading`.

**Layout:** `hz-list-template-page`, max-width 1604px, split ana + sağ panel.

**Route targets:** `/cariler`, `/stok`, `/teklifler`, `/siparisler`, `/tahsilatlar`, … — **Agent 05+**

---

## 7. EntityDetailLayout

**Purpose:** Detay ekranı: header, summary, tabs, sections, aside (timeline).

**Props:** `header`, `summary`, `sections`, `sidebar`, `tabs`, `footer`, `pageState`.

**Route targets:** `/cariler/[id]`, `/onaylar/[id]`, … — **Agent 04–05+**

---

## 8. FormPageShell

**Purpose:** Form gövdesi, validation summary, sticky actions.

**Props:** `title`, `subtitle`, `intro`, `validationSummary`, `children`, `stickyActions`, `footer`, `isSubmitting`, `isDisabled`.

**Defaults:** `FormValidationSummary` title: *"Formda düzeltilmesi gereken alanlar var."*

**Boundaries:** Submit handler, API, fake success yok.

**Route adoption:** Agent 04 (`/onaylar/kurallar`), 05 (`/cariler/yeni`)

---

## 9. SettingsLayout

**Purpose:** Ayarlar sol nav + sağ kartlar.

**Props:** `nav`, `title`, `subtitle`, `children`, `dangerZone`, `footer`.

**Route adoption:** Agent 08 (`/ayarlar`, `/kullanicilar`, `/erp`)

---

## 10. ProductPageShell

**Purpose:** Placeholder / modül iskelet (packages/ui, framework-agnostic).

**Defaults (güvenli TR):**

- Başlık: *"Canlı veri bekleniyor"*
- Açıklama: *"Bu ekran için veri bağlantısı tamamlandığında burada içerik gösterilecek."*

**Props:** `title`, `description`, `badge`, `statusLabel`, `icon`, `primaryAction`, `secondaryActions`, `tertiaryAction`, `children`.

**Handoff:** `apps/web/src/components/product-page-shell.tsx` (Next.js `Link`) Agent 04+ taşınacak; bu branch route değiştirmedi.

---

## 11. Desktop / mobile hedefleri

| Hedef | Uygulama |
|-------|----------|
| 1920×1080, 5+ satır | `DataTableShell` `density="compact"`; üst KPI/summary kompakt (`SummaryBar`) |
| 390×844 | `mobileView` slot; tablo sıkıştırma yok |
| Detail panel 360px | `--hz-detail-panel-width` |
| Content max 1604px | `--hz-content-max-width` |
| Body/yatay scroll | Template kökleri `min-height:0`, `overflow` kontrollü; AppShell contract korunur |

---

## 12. Agent 04+ handoff

1. Route sayfalarını **yavaşça** `EntityListPageTemplate` / `FilterToolbar` slot API’sine taşı.
2. `apps/web` `ProductPageShell` → `@hallederiz/ui` `ProductPageShell` + route-specific `Link` wrapper.
3. Mevcut `hz-customers-*` vb. route CSS’i korunur; template sınıfları ek katman.
4. İlk kayıt seçimi / sağ panel doluluğu **route state** ile (template auto-select yapmaz).
5. AppShell/Sidebar/Header **yeniden yazılmaz**.

**Sonraki branch:** `ui/04-platform-operations`
