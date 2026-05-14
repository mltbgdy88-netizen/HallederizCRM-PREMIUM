# Ekran bazlı UI işleri — sıradaki uygulama (Tasks 08–11, 13–14, 16, 18, 22)

Aşağıdaki maddeler **şablon ve primitive’ler hazır** olduktan sonra sayfa/feature dosyalarında yapılacak somut işleri listeler. Her biri ayrı PR veya sprint parçası olarak ele alınmalıdır.

| Görev | Ana dosya / klasör | Not |
|--------|-------------------|-----|
| **08 Dashboard** | `apps/web/src/features/dashboard/*`, `DashboardHomePage` vb. | KPI şeridi, aktivite, `UiModal` ile ilk tur yapıldı; veri/API ince ayarı sıradaki adım |
| **09 Approval Inbox** | `apps/web/src/features/approvals/*` | Sol liste + sağ detay; `DetailPanel`, `SplitContentLayout`, `FilterToolbar` |
| **10 Operator workspace** | `apps/web/src/features` görevler, `gorevler/*`, `workflow/*` | Workbench: orta liste + sağ bağlam; `EntityDetailLayout` |
| **11 Quick operation** | `apps/web/src/features/quick-operations/*` | Fiş mantığına dokunma; `FilterToolbar` / tablo kabuğu ile hizalama |
| **13 Cariler listesi** | `apps/web/src/features/customers/*` | `EntityListPageTemplate` + `DataTableShell` |
| **14 Diğer listeler** | `orders`, `offers`, `payments`, `stock` feature klasörleri | Aynı şablon; sayfa prefix CSS kurallarına uy |
| **16 Detay sayfaları** | `*DetailPage.tsx` entity feature’larında | `EntityDetailLayout` + `DetailPanel` |
| **18 Unified inbox** | `gelen-kutu`, `whatsapp` feature’ları | CRM merkezi; üç sütun denge |
| **22 Final polish** | Tüm `hz-*` / `globals.css` | spacing, focus, a11y smoke |

Task **21** için ortak state bileşenleri zaten `packages/ui` + `hz-ui-*` altında genişletildi; sayfalarda kademeli kullanım devam eder.
