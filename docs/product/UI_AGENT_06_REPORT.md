# UI Agent 06 Report — Stock / Documents / Tasks Routes

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/06-stock-documents-tasks` |
| Base commit | `0e55c75` — feat(ui): adopt crm commercial routes (#129) |
| Commit | *(yerel — `feat(ui): adopt stock documents and tasks routes`)* |

## Scope

- Stock/documents/tasks route UI adoption (list + detail + print-export layer).
- Stash `wip-mockup-inspiration-before-agent04` **restore edilmedi**.

## Değişen route’lar

| Route | Özet |
|-------|------|
| `/stok` | Mevcut `StockPage` + `EntityListPageTemplate` korundu (önceki adoption) |
| `/depo` | Mevcut `WarehouseTasksPage` korundu; sahte harita yok |
| `/fabrikalar/stoklar` | `EntityListPageTemplate`, Türkçe copy, auto-select, AKSİYON «İncele» |
| `/fabrikalar/siparisler` | `EntityListPageTemplate`, iletim bandı, sağ önizleme |
| `/fabrikalar/siparisler/[id]` | `EntityDetailLayout`; entegrasyon günlüğü |
| `/belgeler` | `EntityListPageTemplate`, grid liste, sağ önizleme, güvenli PDF copy |
| `/belgeler/[id]` | `EntityDetailLayout`; `.hz-print-export-panel` — sahte PDF yok |
| `/gorevler` | Mevcut `TasksPage` workspace korundu |
| `/gorevler/[id]` | `EntityDetailLayout`; sahte yorum kaldırıldı |
| `/archive` | Mevcut `ArchivePage` korundu (referans düzeyi) |
| print-export | `.hz-print-export-panel` + mevcut depo `window.print` / belge kuyruk UI |

## Değişen dosyalar

**apps/web**

- `app/globals.css` — `agent06-stock-documents-tasks.css` import
- `app/styles/agent06-stock-documents-tasks.css` — yeni
- `app/(platform)/belgeler/loading.tsx`
- `src/components/platform-shell.tsx` — fabrikalar PageMeta + arama placeholder
- `src/features/documents/components/DocumentsPage.tsx`
- `src/features/documents/components/DocumentDetailPage.tsx`
- `src/features/factories/components/FactoryPages.tsx`
- `src/features/tasks/components/TasksPage.tsx` (detay + yorum paneli)

**docs/product**

- `UI_AGENT_06_REPORT.md`
- `UI_ROUTE_COVERAGE_MATRIX.md`
- `UI_INVENTORY_CHECKLIST.md`
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md`

**packages/ui:** değişiklik yok.

## Template adoption

| Template | Kullanım |
|----------|----------|
| `EntityListPageTemplate` | `/belgeler`, `/fabrikalar/stoklar`, `/fabrikalar/siparisler` (+ önceden `/stok`) |
| `EntityDetailLayout` | Belge detay, fabrika sipariş detay, görev detay |
| `DetailPanel` / side preview | Belgeler, fabrikalar |
| `FilterToolbar` | Mevcut stok/görev filtreleri korundu |
| `ProductPageShell` | Catch-all alt route’lar değişmedi |

## Business logic preservation

| Alan | Durum |
|------|--------|
| Stock list/detail | Korundu |
| Warehouse/depo | Korundu |
| Factory queries | Korundu |
| Document fetch/actions | `getDocuments`, `runDocumentLiveAction`, download korundu |
| Tasks list/detail | `getOperationsEngineData`, `getTaskById` korundu |
| Archive | Korundu |
| Print/export | `window.print` (depo), `queuePrint` (belge) korundu |

## Runtime safety

| Kontrol | Sonuç |
|---------|--------|
| Mockup PNG import | Temiz |
| Fake product photo/PDF/map | Eklenmedi |
| Sahte görev yorumu | Kaldırıldı |
| Technical leakage | «Foundation» buton metinleri entegrasyon bekliyor olarak güncellendi |

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web typecheck` | PASS |
| `pnpm --filter @hallederiz/ui typecheck` | PASS |
| `pnpm --filter @hallederiz/ui build` | PASS |
| `pnpm --filter @hallederiz/web build` | PASS |
| `pnpm smoke:navigation` | PASS |
| `pnpm smoke:routes` | PASS |

## Known gaps

- `/depo` ve `/archive` tam `EntityListPageTemplate` migration opsiyonel (mevcut layout referans kabul).
- Paylaşımlı print-export route yok; yalnız depo fişi + belge kuyruk katmanı.
- 1920×1080 satır yoğunluğu — yerelde doğrulanmalı.

## Agent 07 handoff

- WhatsApp, gelen-kutu, raporlar, AI route adoption.
- AI ekranlarında mutation ima eden copy yasak.
