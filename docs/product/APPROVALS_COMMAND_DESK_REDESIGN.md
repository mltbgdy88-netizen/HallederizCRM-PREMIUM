# Approvals Command Desk Redesign

## Problem

`/onaylar` önceki inbox/desk düzeni operatör odaklı teknik alanlar (işlem servisi, kuyruk gözlemi) ve tablo + sağ karar paneli karışımıyla ürün kuralını yeterince görünür kılmıyordu. Dashboard Command Center (#141) ve Shell Foundation (#140) ile görsel dil uyumu eksikti.

## Ürün kararı

- **Manuel kullanıcı işlemleri onay beklemez.**
- Onay masası yalnızca **AI**, **otomasyon** ve **mesaj kaynaklı** önerileri listeler.
- Kullanıcı yüzeyinde worker, outbox, job id, foundation, stack trace vb. **gösterilmez**.

## Tasarım seçimi

**Tasarım 1 — Onay Masası / Approval Command Desk**

- Viewport hedefi: **1366×768** (desktop), **860px** altı tek kolon.
- Renk: ivory/emerald/gold scoped tokenlar (`--approval-*`).
- Kod-öncelikli layout; görsel referans PNG import yok.

## Layout contract

| Bölüm | Yükseklik / ölçü |
|--------|------------------|
| Page intro | ~46px |
| Policy band | ~34px |
| Stats strip | 58px |
| Ana grid | `calc(100dvh - 56px)` kalan; `330px \| 1fr \| 300px`, gap 10px |

Bileşenler:

- `ApprovalCommandIntro`
- `ApprovalPolicyBand`
- `ApprovalStatsStrip`
- `ApprovalCommandDeskQueue`
- `ApprovalCommandDeskDetail`
- `ApprovalCommandDeskDecision`

CSS: `apps/web/app/styles/approvals-command-desk.css`  
Kök sınıf: `.hz-approvals-command`

## Source badges

| Kaynak | Etiket |
|--------|--------|
| `ai_action_proposal` | AI önerisi |
| policy / finans / operasyon tipleri | Otomasyon |
| mesaj kanalı ipuçları | Mesaj kaynaklı |
| bilinmeyen | Kaynak belirtilmedi |

## Decision panel

- Risk kartı (Yüksek / Orta / Düşük)
- Neden onay gerekiyor (kaynağa göre Türkçe cümle)
- **Onayla** / **Reddet** — yalnızca `pending` + mevcut mutation
- **Detayı Aç** — `/onaylar/[id]` navigasyon
- Alt not: manuel işlemler onay beklemez

## Button readiness

| Buton | Durum |
|-------|--------|
| Onayla | `active-real` pending + handler |
| Reddet | `active-real` pending + handler |
| Detayı Aç | `active-navigation` |
| Yenile | `active-real` liste yenileme |
| Filtre / arama | Yerel UI state |

Sahte başarı veya fake approval **yok**.

## Mobile behavior

`max-width: 860px`: tek kolon; karar butonları sticky alt bant; Onayla/Reddet iki sütun; Detayı Aç tam genişlik.

## Screenshot QA

`artifacts/approvals-command-desk/` (commit dışı):

- `approvals-1366x768.png`
- `approvals-1920x1080.png`
- `approvals-mobile.png`
- `report.md` / `report.json`

## Known gaps

- `/onaylar/[id]` detay route redesign follow-up
- `/onaylar/kurallar` redesign follow-up
- Canlı API boşken liste boş (sahte kayıt yok)

## Test

```bash
pnpm ui:guard
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/ui typecheck
pnpm --filter @hallederiz/api test
pnpm --filter @hallederiz/web build
pnpm --filter @hallederiz/ui build
pnpm smoke:navigation
pnpm smoke:routes
```
