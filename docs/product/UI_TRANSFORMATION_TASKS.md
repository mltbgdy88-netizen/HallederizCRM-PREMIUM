# HallederizCRM Premium — UI dönüşüm programı (kanonik görev backlog’u)

Bu dosya, HallederizCRM-PREMIUM arayüz dönüşüm programının **tek kaynak görev listesidir**: kapsam, sıra ve kabul için buradaki tanımlar ile `docs/product/UI_INVENTORY_CHECKLIST.md` ve `.cursor/rules` altındaki UI kuralları birlikte ele alınmalıdır.

Aşağıdaki bölüm, paylaşılan **Cursor Task File — HallederizCRM-PREMIUM UI Transformation** metninin görev başlıkları ve maddeleriyle **aynen** korunmuş halidir.

---

# Cursor Task File — HallederizCRM-PREMIUM UI Transformation

## Task 01 — UI Inventory

HallederizCRM-PREMIUM repo yapısını analiz et. apps/web/app/(platform) altındaki route’ları, docs/product altındaki ürün dokümanlarını ve mevcut ekran tanımlarını tarayarak bir UI envanteri çıkar. Ekranları şu gruplara ayır: dashboard, operator workspace, approval inbox, hızlı işlem merkezi, liste ekranları, detay ekranları, form ekranları, inbox/iletişim ekranları, rapor ekranları, ayarlar ekranları. Sonucu markdown checklist olarak yaz.

## Task 02 — Design Tokens

Ortak design token sistemi tanımla. Renkler, yüzey katmanları, border, radius, shadow, spacing, typography ve motion süreleri için uygulanabilir temel oluştur. Shadcn/ui + Tailwind ile uyumlu ve merkezi olmalı.

## Task 03 — UI Primitives

Şu ortak primitives katmanını oluştur veya düzenle:

- Button
- Badge
- Card
- Input
- Select
- Tabs
- Modal
- Drawer
- Skeleton
- EmptyState
- ErrorState

Hover, selected, disabled ve loading durumlarını tek tip hale getir.

## Task 04 — AppShell and Layout

Global AppShell yapısını standardize et:

- sidebar
- page header
- content container
- right panel / split layout

Dashboard, liste ve detay sayfaları aynı tasarım ailesinden gelsin.

## Task 05 — FilterToolbar

Tekrar kullanılabilir bir FilterToolbar üret:

- search
- filter chips
- tabs
- view actions
- bulk actions uyumu

Liste ekranlarında tekrar kullanılabilir olsun.

## Task 06 — DataTable

Tekrar kullanılabilir DataTable sistemi kur:

- kompakt satır
- sticky header
- hover / selected state
- row quick actions
- loading / empty / error states
- pagination

## Task 07 — DetailPanel

Ortak right-side DetailPanel sistemi oluştur:

- 320–360px genişlik
- section-based yapı
- bilgi yoğun ama sade görünüm
- approval, preview ve context alanlarında tekrar kullanılabilirlik

## Task 08 — Dashboard

Dashboard ekranını dönüştür:

- KPI kartları
- operasyon blokları
- quick actions
- AI summary panel
- activity list

Gösterişli hero alan kullanma.

## Task 09 — Approval Inbox

Approval Inbox’ı ortak tasarım sistemine taşı:

- sol liste
- sağ detay paneli
- risk summary
- status badges
- decision bar
- preview blokları
- loading / empty / error states

## Task 10 — Operator Workspace

Operator Workspace için workbench layout kur:

- orta iş listesi
- sağ bağlam paneli
- AI explanation kartı
- task ve timeline bağlamı

## Task 11 — Quick Operation Center

Hızlı İşlem Merkezi ekranını dönüştür:

- işlem türü seçimi
- cari bilgileri
- satır tablosu
- kaynak akordiyonu
- toplamlar
- operasyon etkisi paneli

Fiş mantığını bozma.

## Task 12 — Entity List Template

Ortak EntityListPageTemplate oluştur:

- page header
- filter toolbar
- data table
- bulk actions
- row quick actions
- opsiyonel right preview panel

## Task 13 — Customer List

Cariler listesini yeni template ile uygula:

- müşteri adı
- segment
- durum
- son işlem
- risk
- hızlı aksiyonlar

## Task 14 — Other Lists

Sipariş, teklif, tahsilat ve stok listelerini ortak EntityListPageTemplate ile hizala.

## Task 15 — Entity Detail Layout

Tekrar kullanılabilir EntityDetailLayout oluştur:

- summary header
- section-based cards
- right-side timeline / related items

## Task 16 — Detail Pages

Cari, sipariş, teklif, tahsilat ve stok detay ekranlarını EntityDetailLayout ile hizala.

## Task 17 — Form System

Ortak form sistemi kur:

- section-based form cards
- helper text
- validation summary
- sticky action bar
- ortak alan spacing standardı

## Task 18 — Unified Inbox

Unified Inbox / WhatsApp yüzeyini dönüştür:

- conversation list
- thread
- customer context panel

Chat app değil, CRM iletişim merkezi hissi ver.

## Task 19 — Reports

Rapor ekranları için ortak analytics template üret:

- filter bar
- KPI cards
- charts
- comparison table

## Task 20 — Settings

Ayarlar için ortak SettingsLayout oluştur:

- settings cards
- toggle rows
- select alanları
- permission matrix
- save action bar

## Task 21 — Shared States

Tüm loading, empty, error, success, disabled ve destructive modal state’lerini ortaklaştır.

## Task 22 — Final Polish

Tüm sistemde şunları kontrol et:

- spacing
- typography
- hover
- selected
- focus
- modal/drawer davranışı
- accessibility
- görsel tutarlılık

---

## Durum ve notlar

- **Task 01 — UI Inventory:** Durum: **Kısmen tamamlandı** — checklist: [UI_INVENTORY_CHECKLIST.md](./UI_INVENTORY_CHECKLIST.md).
- **Task 02 — Design Tokens:** Durum: **Kısmen tamamlandı** — kanonik referans: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md); uygulama: `apps/web/app/globals.css` (`:root` / dark) tipografi, mor accent, motion, odak rengi; `body` tipografi token’larına bağlandı. Tailwind/shadcn henüz yok; köprü tablosu dokümanda.
- **Task 03 — UI Primitives:** Durum: **Kısmen tamamlandı** — yeni: `UiButton`, `UiBadge`, `UiCard` (+header), `UiInput`/`UiInputField`, `UiSelect`/`UiSelectField`, `UiModal`, `UiDrawer`, `UiSkeleton`, `UiTabs` (alias); `LoadingState`/`EmptyState`/`ErrorState` token tabanlı yüzeye taşındı (`state-panels` geriye dönük barrel). Ayrıntı: [UI_PRIMITIVES.md](./UI_PRIMITIVES.md); stiller: `globals.css` `hz-ui-*`.
- **Task 04 — AppShell and Layout:** Durum: **Kısmen tamamlandı** — `PageContent` primitive + `--hz-content-max-width` / `--hz-detail-panel-width`; `PlatformShell` `PageContent` kullanıyor; `SplitContentLayout` `sideWidth` (`detail`). Ayrıntı: [APPSHELL_LAYOUT.md](./APPSHELL_LAYOUT.md).
- **Task 05 — FilterToolbar:** Durum: **Kısmen tamamlandı** — `FilterToolbar*` + `FilterChip` slot’ları (`filter-bar.tsx`); `globals.css` `hz-filter-toolbar-*`. Ayrıntı: [UI_LAYOUT_PATTERNS.md](./UI_LAYOUT_PATTERNS.md).
- **Task 06 — DataTable:** Durum: **Kısmen tamamlandı** — `DataTableShell`, `DataTableFooter` (`data-table.tsx`); `hz-ui-data-table*`. Tam veri tablosu sayfa migrasyonları bekliyor.
- **Task 07 — DetailPanel:** Durum: **Kısmen tamamlandı** — `DetailPanel` (`detail-panel.tsx`); `hz-ui-detail-panel*`.
- **Task 08 — Dashboard:** Durum: **Kısmen tamamlandı** — üst `MetricCard` KPI şeridi, operasyon bloğu (sadeleştirilmiş arka plan), hızlı aksiyon linkleri, altta aktivite listesi, kart düzenleyici `UiModal` + `UiButton`; `DashboardHomePage.tsx` + `globals.css` (`hz-dash-*`).
- **Task 09 — Approval Inbox:** Durum: **Kısmen tamamlandı** — `ApprovalInboxShell`: `FilterToolbar` + `FilterChip` (durum), arama/sıralama satırı; liste+detay `SplitContentLayout` (`sideWidth="detail"`); `ApprovalDetailPanel` kökü `DetailPanel`; `globals.css` inbox split scroll. Kart/tablo demo (`ApprovalsBoardPage`) ayrı.
- **Task 10 — Operator Workspace:** Durum: **Kısmen tamamlandı** — `/gorevler` `TasksPage`: `hz-tasks-ws-page` workbench; kompakt KPI; `FilterToolbar` + durum chip’leri; `SplitContentLayout` (`sideWidth="detail"`); sağ `OperatorWorkspaceContextPanel` (`DetailPanel`: bağlam, salt okunur AI açıklama, zaman çizelgesi, aksiyonlar). Shell `PageMeta` gizli + arama placeholder; `globals.css` shell `:has` + `hz-tasks-ws-*`.
- **Task 11 — Quick Operation Center:** Durum: **Kısmen tamamlandı** — `QuickOperationPage`: demo önizleme bandı (~20–24px); `SplitContentLayout` (`sideWidth="detail"`); sağda `DetailPanel` + `QuickOperationTotalsPanel` / `QuickOperationImpactPanel` (`layout="bare"`, hook’tan `totals` / `impacts` / `aiInsight`); satır **Kaynak** ile `QuickOperationSourceAccordion` (`selectSource`); fiş satır/tutar hesapları ve `submitOperation` değiştirilmedi.
- **Task 12 — Entity List Template:** Durum: **Kısmen tamamlandı** — `EntityListPageTemplate`: `header` | `PageHeader`, `SplitContentLayout` + `preview`, `className`, `hz-entity-list-page-main`; `globals.css` split kaydırma + cari sayfası uyumu. Diğer liste sayfalarına migrasyon sürer.
- **Task 13 — Customer List:** Durum: **Kısmen tamamlandı** — `/cariler` `CustomersPage` şablona taşındı (`EntityListPageTemplate` + mevcut KPI / filtre / tablo / önizleme); davranış korunur.
- **Task 14 — Other Lists:** Durum: **Tamamlandı** — Sipariş, teklif, tahsilat ve stok listeleri `EntityListPageTemplate` + shell `PageMeta` / arama placeholder ile hizalandı.
- **Task 15 — Entity Detail Layout:** Durum: **Tamamlandı** — `EntityDetailLayout` detay sayfalarında kullanılıyor (`summary` / `sections` / `sidebar`).
- **Task 16 — Detail Pages:** Durum: **Kısmen tamamlandı** — `/cariler/[id]`, `/siparisler/[id]`, `/teklifler/[id]`, `/tahsilatlar/[id]` `EntityDetailLayout` + kök sınıflar + shell `PageMeta` / arama placeholder; stok için ayrı ürün detay route’u yok (`/stok/*` → `ProductPageShell` / catch-all).
- **Task 17 — Form System:** Durum: **Kısmen tamamlandı** — `FormPageShell` (`className`), `FormSectionCard`, `FormValidationSummary` (`danger` | `info`); `hz-form-*` grid ve kart stilleri; `/siparisler/yeni`, `/teklifler/yeni`, `/tahsilatlar/yeni` (+ `/cariler/yeni`) shell `PageMeta` / arama placeholder; tahsilat/sipariş/teklif taslak gövdesinde kullanım. Diğer `*/yeni` formları ve gerçek alan doğrulaması bekliyor.
- **Task 18 — Unified Inbox:** Durum: **Kısmen tamamlandı** — `/whatsapp` zaten üç kolonlu operasyon yüzeyi; `/gelen-kutu` `OmnichannelInboxPage` ile liste | özet iş parçacığı | bağlam/sağlık düzenine taşındı (`hz-inbox-*`), shell `PageMeta` / arama; `/gelen-kutu/konusma/*` meta. Tam thread ekranı ve backend bağlı konuşma detayı sonraki adım.
- **Task 19 — Reports:** Durum: **Tamamlandı** — `/raporlar` `ReportsPage`: `ReportAnalyticsShell` (filtre + tip sekmeleri + önizleme bandı | KPI şeridi | mini trend | karşılaştırma tablosu); `globals.css` `hz-reports-main` / `hz-report-analytics-*` / `hz-reports-mini-trend*`.
- **Task 20 — Settings:** Durum: **Tamamlandı** — `SettingsLayout` + `SettingsSubNav` / `SettingsAreaShell`; ana `/ayarlar` `hz-settings-workspace` + asistan paneli; alt rotalar (`veri-yukleme`, `staging-kontrol`, `kullanim-hazirligi`, `canli-kullanim-hazirligi`) ortak sol iç nav; `globals.css` `hz-settings-workspace` (önceki ana+yan grid sınıfı çakışması giderildi); shell `PageMeta` `/ayarlar/*` için gizli.
- **Task 21 — Shared States:** Durum: **Tamamlandı** — `SuccessState`, `DisabledNotice`, `DestructiveConfirmModal`; `LoadingState` (`className`), `ErrorState` (`details`); `state-panels` barrel; `globals.css` `hz-ui-success*`, `hz-ui-error-details`, `hz-ui-disabled-notice*`, `hz-ui-modal-footer-row*`, `hz-ui-state-center`; Onaylar `ApprovalInbox*` sarmalayıcıları `@hallederiz/ui` state’lere taşındı; `/ayarlar` yükleme/hata `LoadingState`/`ErrorState`+`UiButton`.
- **Task 22 — Final Polish:** Durum: **Tamamlandı** — `UiModal` / `UiDrawer`: `use client`, Escape kapatma, `document.body` overflow kilidi, açılışta panel odağı (`tabIndex={-1}`), `useId` ile benzersiz `aria-labelledby`; çekmece backdrop yalnızca doğrudan tıklamada kapanır; `globals.css` ana içerik link `focus-visible`, modal/drawer `prefers-reduced-motion`, diyalog kök `outline` sıfırlama.

---

## Bağımlılık sırası (öneri)

Programı dalgalı yürütmek için önerilen sıra:

1. **Dalga A — Temel:** Task 02 (tokens) → Task 03 (primitives) → Task 21 (shared states; primitives ile paralel/hemen sonra).
2. **Dalga B — Kabuk ve liste altyapısı:** Task 04 (AppShell) → Task 05 (FilterToolbar) → Task 06 (DataTable) → Task 07 (DetailPanel).
3. **Dalga C — Şablonlar:** Task 12 (Entity List Template) → Task 15 (Entity Detail Layout) → Task 17 (Form System) → Task 20 (Settings layout).
4. **Dalga D — Ana ekranlar:** Task 08 (Dashboard) → Task 09 (Approval Inbox) → Task 10 (Operator Workspace) → Task 11 (Quick Operation) → Task 18 (Unified Inbox) → Task 19 (Reports).
5. **Dalga E — Liste/detay hizalama:** Task 13–14 (listeler) → Task 16 (detay sayfaları).
6. **Dalga F — Kapanış:** Task 22 (Final Polish).

Task 01 envanter dosyası ile sürekli hizalanır; yeni route eklendikçe checklist güncellenir.

---

## Kısıtlar

- UI uygulama işleri yalnızca **`apps/web`** ve **`packages/ui`** altında yapılmalıdır (bu backlog dokümanı ürün/`docs` kapsamındadır).
- Tasarım ve yoğunluk için `.cursor/rules` içindeki **ui-rules** ve **ui-designer-rules** dosyalarına uyulmalıdır.
- **Backend, auth, worker, database, migration** veya dağıtım dosyalarına müdahale ayrı görev ve onay olmadan bu programın parçası sayılmaz.
- AI ve mutation güvenliği: proje kurallarında tanımlı **proposal-only** ve onay zinciri sınırları ihlal edilmemelidir.
