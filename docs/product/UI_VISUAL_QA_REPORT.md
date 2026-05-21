# UI Visual QA Report

| Alan | Değer |
|------|--------|
| QA date | 2026-05-21 |
| Base commit | `22bf180` |
| Branch | `ui/09-visual-qa-polish` |

## Checked route groups

- Shell + foundation
- Platform / operations (`/login`, `/dashboard`, `/hizli-islem`, `/onaylar`, `/workflow`)
- CRM / commercial (list + hub routes)
- Stock / documents / tasks (`/stok`, `/depo`, `/belgeler`, `/gorevler`, `/archive`)
- Communication / reports / AI
- Settings / users / ERP / system states

## 1920×1080 checklist

| Kontrol | Durum |
|---------|--------|
| Body horizontal scroll | CSS polish uygulandı; **yerelde doğrulanmalı** |
| Liste 5+ satır hedefi | Satır min-height azaltıldı; **yerelde doğrulanmalı** |
| Sağ panel 360px | Token CSS; **yerelde doğrulanmalı** |
| Header/PageMeta taşma | Mevcut suppress korundu |
| KPI/filtre liste ezmesi | Agent 04–08 bandları korundu |

## 390×844 checklist

| Kontrol | Durum |
|---------|--------|
| Yatay scroll | `overflow-x: hidden` + split stack; **yerelde doğrulanmalı** |
| Tablo → stack/kart | Mevcut responsive + agent09 media queries |
| Drawer sidebar | Agent 02 korundu |
| Touch targets | Mevcut control-height 34px |

## Screenshot / manual notes

- Otomatik screenshot alınmadı.
- Dev sunucu (`pnpm run dev`) ile kritik route’lar manuel açılmalı.

## Findings fixed in this PR

- Global `agent09-visual-qa-polish.css` (density, overflow, emerald CTA).
- Foundation → Önizleme / Türkçe (hızlı işlem yan panel).
- Onaylar güvenlik bandı Türkçeleştirme.
- Görevler/depo/stok/görev merkezi ASCII Türkçe düzeltmeleri.
- Approval 404 kullanıcı mesajı.

## Findings deferred

- `globals.css` legacy mor/lacivert tam temizlik.
- Mock data içi ASCII (görünmüyorsa düşük öncelik).
- Detay route görsel QA gerçek id ile.
- Unauthorized dedicated page.

## Regression scans

| Scan | Sonuç |
|------|--------|
| Runtime PNG import (`apps/web`, `packages/ui`) | Temiz |
| Forbidden fake success UI default | Temiz |
| AI mutation copy | Temiz |
| Foundation kullanıcı copy (post-fix) | Düzeltildi |

## Recommended follow-ups

- Agent 10: P0/P1 bugfix + release candidate checklist.
- Manuel viewport screenshot arşivi (opsiyonel).
