# UI Agent 07 Report — Communication / Reports / AI Routes

## Branch

| Alan | Değer |
|------|--------|
| Branch | `ui/07-communication-reports-ai` |
| Base commit | `c1ea097` — feat(ui): adopt stock documents and tasks routes (#130) |
| Commit | *(yerel — `feat(ui): adopt communication reports and ai routes`)* |

## Scope

- Communication/reports/AI route UI adoption only.
- Stash `wip-mockup-inspiration-before-agent04` **restore edilmedi**.

## Değişen route’lar

| Route | Özet |
|-------|------|
| `/whatsapp` | Mevcut `WhatsAppPage` + provider/sağlık mantığı korundu; demo bandı mevcut; sahte bağlı durum eklenmedi |
| `/gelen-kutu` | `OmnichannelInboxPage` — üç panel, API listesi, auto-select, güvenli boş/önizleme copy |
| `/gelen-kutu/konusma/[id]` | `OmnichannelConversationDetailPage` — gerçek mesaj timeline; AI öneri butonları review-only |
| `/raporlar` | `ReportsPage` — canlı modda sahte KPI/grafik kaldırıldı; demo modda önizleme bandı |
| `/raporlar/[...]` | Catch-all `ProductPageShell` değişmedi |
| `/ai` | `AIAssistantPage` — hub navigasyon kartları; teknik mutation badge’leri Türkçeleştirildi |
| `/ai/onaylar` | `AiApprovalsPage` — Türkçe copy, Foundation kaldırıldı, «Onay ekranına git» |
| `/ai/icgoruler` | `AiInsightsPage` — boş state güvenli; «Detayı aç» review-only |

## Değişen dosyalar

**apps/web**

- `app/globals.css` — `agent07-communication-reports-ai.css` import
- `app/styles/agent07-communication-reports-ai.css` — yeni
- `app/(platform)/gelen-kutu/loading.tsx` — yeni
- `app/(platform)/raporlar/loading.tsx` — yeni
- `app/(platform)/ai/loading.tsx` — yeni
- `src/features/reports/components/ReportsPage.tsx`
- `src/features/inbox/components/OmnichannelInboxPage.tsx`
- `src/features/inbox/components/OmnichannelConversationDetailPage.tsx`
- `src/features/ai/components/AIAssistantPage.tsx`
- `src/features/ai/components/AiSecondaryPages.tsx`

**docs/product**

- `UI_AGENT_07_REPORT.md`
- `UI_ROUTE_COVERAGE_MATRIX.md`
- `UI_INVENTORY_CHECKLIST.md`
- `UI_MOCKUP_IMPLEMENTATION_PLAN.md`

**packages/ui:** değişiklik yok.

## Template adoption

| Template | Kullanım |
|----------|----------|
| `EntityListPageTemplate` | — (mevcut özel layout korundu; rapor/inbox referans düzeni) |
| `EntityDetailLayout` | — (konuşma detay özel grid) |
| `ReportAnalyticsShell` | `/raporlar` (mevcut) |
| `PageHeader` / `SplitContentLayout` | `/gelen-kutu`, `/ai/onaylar`, `/ai/icgoruler` |
| `ProductPageShell` | `/raporlar/[...]` catch-all (değişmedi) |

## Business logic preservation

| Alan | Durum |
|------|--------|
| WhatsApp provider/send/sync | Korundu |
| Inbox list/detail | `sdk.omnichannel.*` korundu |
| Reports export/toast locks | Korundu |
| AI proposals/insights queries | `getAiAssistantData`, chat/confirm API korundu |
| API/SDK contracts | Korundu |

## AI review-only compliance

| Kontrol | Sonuç |
|---------|--------|
| «Uygula», «Otomatik kaydet», «Değiştirildi» | Yok |
| «Onay ekranına git», «Öneriyi incele», «Detayı aç» | Kullanıldı |
| Foundation kullanıcı copy | Kaldırıldı (`/ai/onaylar`) |
| `mutationExecuted: false` badge | Türkçe güvenli metin |

## Runtime safety

| Kontrol | Sonuç |
|---------|--------|
| Mockup PNG import | Temiz |
| Sahte WA mesajı (yeni) | Eklenmedi |
| Sahte rapor grafiği (canlı mod) | Kaldırıldı |
| Sahte AI insight (yeni) | Eklenmedi |
| Worker/outbox jargon | Görünmüyor |

## Desktop/mobile notes

- 1920×1080 liste 5+ satır: **yerelde doğrulanmalı** (raporlar mevcut yoğunluk korundu)
- 390×844: inbox kart/stack — **yerelde doğrulanmalı**
- Sağ panel veri varken boş: inbox auto-select korunuyor
- Body/yatay scroll: **yerelde doğrulanmalı**

## Tests

```bash
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm --filter @hallederiz/ui build
pnpm --filter @hallederiz/web build
pnpm smoke:navigation
pnpm smoke:routes
```

## Known gaps

- `/raporlar/[...]` alt rotaları hâlâ `ProductPageShell` catch-all.
- `/whatsapp` tam template migration yapılmadı (mevcut operasyon layout kabul).
- Canlı rapor KPI API bağlantısı sonraki backend iş paketi.
- App Router `error.tsx` segment dosyaları Agent 08+.

## Agent 08 handoff

- Branch: `ui/08-settings-users-erp`
- Routes: `/ayarlar`, `/ayarlar/*`, `/kullanicilar`, `/kullanicilar/roller`, `/erp`, system state sayfaları
