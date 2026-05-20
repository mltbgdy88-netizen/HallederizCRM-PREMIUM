# UI Design Reference Package Report

## Branch
- **Branch:** `ui/00b-add-design-reference-package`
- **Base commit:** `fd933b0` — docs(ui): add mockup implementation inventory and scope guard (#123)
- **Mode:** **Missing source / blocked**

## Source
- **Source path:** _(sağlanmadı — otomatik tarama sonucu bulunamadı)_
- **Source type:** N/A
- **Copied into repository?** Hayır
- **Target path:** `docs/design/ui-design-output/` (hedef; oluşturulmadı)

### Otomatik aranan yollar (2026-05-20)

| Yol | Sonuç |
|-----|--------|
| `C:\Users\mevlu\Desktop\ui-design-output` | Yok |
| `C:\Users\mevlu\Desktop\ui-design-output.zip` | Yok |
| `C:\Users\mevlu\Desktop\HallederizCRM-UI-REFERENCE\ui-design-output` | Yok |
| `C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR\ui-design-output` | Yok |
| Kullanıcı profili `*ui-design*` (depth 4) | Eşleşme yok |

**Agent 00B devam etmek için:** Prompt’taki `MOCKUP_SOURCE_PATH` değişkenine gerçek klasör veya `.zip` yolu verilmeli; ardından bu branch yeniden çalıştırılmalı veya paket manuel kopyalanmalı.

## Required Files
- **MANIFEST.md:** Yok (repo + kaynak)
- **CHECKLIST.md:** Yok
- **CURSOR_REFERENCE_README.md:** Yok
- **manifest.json:** Yok
- **00-design-system:** Yok

## Counts
- **Route/layer folders:** 0 (hedef ~53)
- **PNG files:** 0 (hedef ~319)
- **Markdown files:** 0 (hedef ~56)
- **notes.md files:** 0
- **Total size:** 0 B

## Design System Files
- **colors.png:** Yok
- **typography.png:** Yok
- **components.png:** Yok
- **table-system.png:** Yok
- **status-badges.png:** Yok
- **empty-loading-error-states.png:** Yok
- **notes.md:** Yok

## State Coverage Counts
- **desktop-default.png:** 0
- **desktop-loading.png:** 0
- **desktop-empty.png:** 0
- **desktop-error.png:** 0
- **mobile-default.png:** 0
- **desktop-validation-error.png:** 0
- **desktop-success-or-submitted.png:** 0
- **desktop-detail.png:** 0
- **desktop-audit-timeline.png:** 0
- **desktop-placeholder.png:** 0
- **mobile-placeholder.png:** 0

## Validation Result
- **Agent 01 blocked?** **Evet**
- **Missing required files:** Tüm paket (kaynak path bulunamadı)
- **Size warnings:** N/A (kopyalama yapılmadı)
- **Notes:** PR #123 UI envanter dokümanları main’de mevcut; görsel referans paketi hâlâ eksik. CI/test akışları yerel mockup yoluna bağlı değildir.

## Usage Rules
- PNG dosyaları yalnızca tasarım referansıdır; **runtime UI import etmez**.
- Implementation `packages/ui/**` ve `apps/web/**` içinde kod olarak yapılır.
- Agent 01 yalnızca referans paketten token, primitive ve shared state türetir.
- AppShell, Sidebar, Header, route implementation, backend/API/worker/database/auth **Agent 01 kapsamı dışıdır**.

### Seçenek A/B (repo içi paket) — tercih edilen

1. Kaynak klasör veya zip’i `MOCKUP_SOURCE_PATH` ile belirt.
2. İçerik `docs/design/ui-design-output/` altına kopyalanır (nested `ui-design-output/ui-design-output` yok).
3. Bu rapor ve checklist sayımları güncellenir.
4. Commit: `docs(ui): add design reference package`

### Seçenek C (read-only mount)

1. Sabit yerel yol tanımla (ör. `C:\Users\mevlu\Desktop\HallederizCRM-UI-REFERENCE\ui-design-output`).
2. `Test-Path` ile MANIFEST ve `00-design-system` doğrula.
3. Repoya dosya kopyalanmaz; `UI_MOCKUP_IMPLEMENTATION_PLAN.md` içinde path kuralları yazılır.
4. **CI bu yola bağlı olmaz** (makineye özel).
5. Commit: `docs(ui): document design reference package mount`
