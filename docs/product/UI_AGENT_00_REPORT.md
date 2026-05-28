# UI Agent 00 Report

## Branch

- **Branch:** `ui/00-inventory-scope-guard`
- **Base commit:** `10f2f40463bf5ed27b5f7e331f4b8535076d6b72` (`10f2f40` oneline)
- **Commit:** _(local commit after inventory docs)_

## Scope Guard

| Soru | Yanıt |
|------|--------|
| Kod değişikliği yapıldı mı? | **Hayır** (yalnızca `docs/product/*.md`) |
| Backend/API/worker/DB/auth dosyalarına dokunuldu mu? | **Hayır** |
| `docs/design/ui-design-output/**` değiştirildi mi? | **Hayır** (klasör mevcut değil) |
| Sadece izinli docs/product dosyaları mı değişti? | **Evet** |

## Değişen Dosyalar

- `docs/product/UI_SCOPE_GUARD.md` (yeni)
- `docs/product/UI_INVENTORY_CHECKLIST.md` (yeniden yazıldı — Agent 00 formatı)
- `docs/product/UI_ROUTE_COVERAGE_MATRIX.md` (yeni)
- `docs/product/UI_MOCKUP_IMPLEMENTATION_PLAN.md` (yeni)
- `docs/product/UI_AGENT_00_REPORT.md` (bu dosya)

**Not:** Önceki `UI_INVENTORY_CHECKLIST.md` (Görev 01 route grupları) Agent 00 kapsamında güncellendi; route listesi için `UI_ROUTE_COVERAGE_MATRIX.md` ana kaynak.

## Mockup Referans Paketi Bulguları

| Alan | Sonuç |
|------|--------|
| Klasör mevcut mu? | **Hayır** |
| MANIFEST.md | Yok |
| CHECKLIST.md | Yok |
| CURSOR_REFERENCE_README.md | Yok |
| manifest.json | Yok |
| 00-design-system | Yok |
| Route/layer klasör sayısı | 0 (hedef ~53) |
| PNG sayısı | 0 (hedef ~319) |
| Markdown sayısı | 0 (hedef ~56) |
| Eksikler | **Tüm paket** — UI dönüşüm öncesi repoya eklenmeli |

## Route Coverage Özeti

| Metrik | Değer |
|--------|-------|
| Toplam route/layer (hedef) | 53 |
| apps/web karşılığı | 48 sayfa + 5 sistem katmanı |
| Eksik dedicated route | unauthorized, offline-api, live-empty |
| Placeholder/ProductPageShell | ~15+ catch-all alt rota |
| Hub route (teklif/sipariş/tahsilat yeni) | 3 — **uyumlu** |
| Form route (hub dışı) | `/cariler/yeni` gerçek form |
| Detay + timeline | payment, document, customer, approval ✓; order/offer/delivery/return/invoice eksik |

## packages/ui Bulguları

| Metrik | Değer |
|--------|-------|
| Primitive/template dosya sayısı | ~40 export (app-shell + primitives) |
| Eksik hedef | `ProductPageShell` (yalnızca apps/web) |
| Duplicate risk | Feature-level `hz-*` pages vs `EntityListPageTemplate` |
| Agent 01 | Tokens + primitive naming + emerald theme |
| Agent 03 | FilterToolbar alias, 360px detail panel, template adoption |

## AppShell / PageContent Bulguları

| Alan | Sonuç |
|------|--------|
| Sidebar | `packages/ui` + `PlatformShell` — tek kaynak |
| Header | `Header` + PageMeta (`suppressPageMeta` liste sayfalarında) |
| PageContent / platform-content | `PageContent` default `platform-content` |
| Mobile drawer | `AppShell` hamburger + backdrop |
| Body/yatay scroll | Fit-viewport sayfalar özel CSS; **yerelde doğrulanmalı** |
| Sağ detail/preview | Liste sayfalarında yaygın; `DetailPanel` / feature panels |

## Riskler / Gaps

1. Mockup paketi olmadan piksel referans doğrulaması yapılamaz.
2. Legacy lacivert/mor CSS ile yeni emerald spec çakışması (Agent 01).
3. Sıfır `loading.tsx`/`error.tsx` — state mockup’ları kodda karşılıksız.
4. Timeline tutarsızlığı ticari detaylarda.
5. `InvoicesPage` filter placeholder örnek fatura kodu.

## Test Sonuçları

_(commit öncesi çalıştırılacak — aşağı final raporda güncellenir)_

## tsbuildinfo Kontrolü

- `apps/web/tsconfig.tsbuildinfo` commit’e **alınmayacak**.

## Sonraki Önerilen Branch

`ui/01-foundation-tokens-primitives`

## Sonraki Agent İçin Not

1. `UI_SCOPE_GUARD.md`, `UI_INVENTORY_CHECKLIST.md`, `UI_ROUTE_COVERAGE_MATRIX.md`, `UI_MOCKUP_IMPLEMENTATION_PLAN.md` oku.
2. Mockup paketini repoya ekle veya erişim yolunu netleştir.
3. Agent 01 yalnız token + primitives; AppShell/route **dokunma**.
