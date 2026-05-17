# Liste, filtre, tablo ve detay desenleri (Tasks 05–07, 12, 15, 17, 19–20)

Bileşen kaynağı: `packages/ui/src/primitives/` — stiller: `apps/web/app/globals.css`.

## Task 05 — FilterToolbar

- `FilterToolbar` — `hz-filter-card hz-filter-toolbar` (mevcut `FilterBar` ile aynı kart; ek sıra düzeni).
- `FilterToolbarRow`, `FilterToolbarSearch`, `FilterToolbarChips`, `FilterChip`, `FilterToolbarTabs`, `FilterToolbarViews`, `FilterToolbarBulk`.
- Mevcut `FilterGrid` / `FilterActions` / `FilterResetButton` ile birlikte kullanılabilir.

## Task 06 — DataTable

- `DataTableShell` — kaydırmalı gövde + `thead th` sticky.
- `DataTableFooter` — sayfalama / özet şeridi (`Pagination` ile kompoze edin).
- Satır seçimi için tablo satırına `className="is-selected"` (örnek).

## Task 07 — DetailPanel

- `DetailPanel` — başlık + gövde + isteğe bağlı `footer`; genişlik üst sınırı `--hz-detail-panel-width` ile uyumlu.

## Task 12 — EntityListPageTemplate

- `EntityListPageTemplate` — isteğe `header` (özel üst bandı; yoksa `PageHeader` + `title` …) + `filters` + `bulkBar` + liste gövdesi (`list` + isteğe `pagination`) + isteğe `preview`.
- `preview` varken: `SplitContentLayout` (`previewSideWidth`, varsayılan `detail`) ile ana kolon | sağ önizleme.
- Kök: `hz-entity-list-page` — sayfa özel `hz-*-page` sınıfını `className` ile ekleyin (örn. `hz-customers-page`; shell `:has` kuralları).

## Task 15 — EntityDetailLayout

- `EntityDetailLayout` — özet + bölüm kartları + isteğe bağlı sağ `sidebar` (timeline / ilişkili kayıtlar).
- Tek sütun: `sidebar` yokken `hz-entity-detail-layout--single`.

## Task 17 — Form sistemi

- `FormPageShell` — form gövdesi (`hz-form-page-shell-body`) + isteğe `stickyActions` (alta yapışkan bant); isteğe `className` (örn. `hz-tahsilatlar-form`).
- `FormSectionCard` — bölüm başlığı / açıklama / `helperText` + gövde; sınıf kökü `hz-form-section-card`.
- `FormValidationSummary` — `messages[]` doluysa liste; `variant`: `danger` (varsayılan, `role="alert"`) veya `info` (`role="status"`).
- Alan ızgarası: `hz-form-field-grid` (`globals.css`).

## Task 19 — ReportAnalyticsShell

- `ReportAnalyticsShell` — filtre → KPI grid → grafik alanı → tablo.

## Task 20 — SettingsLayout

- `SettingsLayout` — sol `nav` + sağ içerik; 960px altında tek sütun.

## İlgili dokümanlar

- [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md)
- [UI_PRIMITIVES.md](./UI_PRIMITIVES.md)
- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
