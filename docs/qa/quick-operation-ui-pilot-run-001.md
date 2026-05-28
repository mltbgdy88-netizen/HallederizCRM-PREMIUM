# Quick Operation UI Pilot Run 001

- Tarih: 2026-04-30
- Commit SHA: `aad54f7`

## Ortam Ozeti

- Docker/Postgres: `hallederizcrm-premium-pilot` projesinde healthy, `55432 -> 5432`.
- API: `http://127.0.0.1:4000` ayaga kalkti, health `200`.
- Web: `next dev` 3000 dolu oldugu icin 3001'e gecti.
- Auth: local pilot auth ile login `200`.

## Login Sonucu

- `/login` route: teknik olarak mevcut.
- API login (local pilot auth): `POST /auth/login -> 200`.
- Platform auth token alindi ve protected endpoint cagrilarinda kullanildi.

## Senaryo Sonuclari (PASS/FAIL)

### Senaryo 1 - Teklif
- Durum: PASS
- Sonuc:
  - submit `mode=executed`
  - `workflowImpacts` var
  - `sideActions.documentPreview` var (`Teklif Onizleme`)
  - `sideActions.whatsappDraft` var (`sendEnabled=false`)
  - `sideActions.aiInsight` var

### Senaryo 2 - Satis/Siparis (Merkez Depo)
- Durum: PASS
- Sonuc:
  - submit `mode=executed`
  - depo etkisi var (`warehouse_prepare`)
  - sideActions var

### Senaryo 3 - Satis/Siparis (Fabrika)
- Durum: PASS
- Sonuc:
  - submit `mode=executed`
  - fabrika etkisi var (`factory_plan`)
  - sideActions var

### Senaryo 4 - Tahsilat
- Durum: FAIL
- Gozlem:
  - tahsilat submit denemesinde `persistence_unavailable` hatasi alindi.
  - Hata detayi: `payment_receipts` tablosunda `currency` kolonu yok.

### Senaryo 5 - Teslim
- Durum: PASS_WITH_WARNINGS
- Sonuc:
  - `mode=foundation`
  - teslim fisi onizleme metni var (`Teslim Fisi Onizleme`)
  - controlled validation warning donuyor (`delivery_execution_unavailable`)

### Senaryo 6 - Iade
- Durum: PASS_WITH_WARNINGS
- Sonuc:
  - reason yoksa validation: `return_reason_required`
  - reason girilince review/foundation akisi calisiyor
  - `return_approval_may_be_required` etkisi var
  - sideActions uygun (`Iade Talebi Onizleme`, taslak WhatsApp, AI insight)

## Validation Testleri

- `quantity=0` -> PASS (`quantity_invalid`, execution yok)
- `unitPrice<0` -> PASS (`unit_price_invalid`, execution yok)
- `customerId bos` -> PASS (`customer_required`, execution yok)
- `product bos` -> PASS (`product_required`, execution yok)
- `return reason bos` -> PASS (`return_reason_required`, execution yok)

## Ekran Gozlemleri

- `/hizli-islem` route build ve navigation smoke tarafinda mevcut.
- UI tarafi icin tam etkileşimli tarayici otomasyon araci bu oturumda kullanilamadi:
  - `node_repl` runtime surumu nedeniyle Playwright akisi calismadi (Node >=22 gereksinimi).
  - Bu nedenle satir-ici akordiyon click akisi birebir tarayici otomasyonu ile teyit edilemedi.
- Buna ragmen ayni senaryolar authenticated API kontratiyla calistirildi ve workflow/sideActions dogrulandi.

## Bug Listesi

1. `Tahsilat` submit akisi Postgres schema uyumsuzluguyla fail ediyor.
   - Belirti: `persistence_unavailable`
   - Teknik neden: `payment_receipts.currency` kolonu eksik
   - Etki: Pilotta tahsilat senaryosu bloke.

2. Web dev baslatmada port ve dosya kilidi hassasiyeti var.
   - Belirti: 3000 doluysa 3001'e geciyor; onceki turlarda `.runtime-next/trace` izin hatasi gorulmustu.
   - Etki: Manuel test operatoru icin tutarsiz boot deneyimi.

## UX Iyilestirme Onerileri

1. Tahsilat modunda DB kaynakli hatayi kullaniciya daha net operasyon mesaji ile gostermek (su an teknik hata hissi yuksek).
2. `/hizli-islem` ekraninda scenario-sonucu toast/metinlerinde `executed/foundation` ayrimi daha belirgin renk/etiketle vurgulanabilir.
3. SideActions panelinde `sendEnabled=false` olan aksiyonlar icin tek satir “Bu adim sonraki fazda aktive edilir” yardim metni standardize edilebilir.

## Blocker Listesi

- P0: Tahsilat (`payment`) submit akisinda Postgres schema uyumsuzlugu (`currency` kolonu eksik).

## Sonuc

`BLOCKED`

Gerekce: Hızlı İşlem pilot senaryolarinda tahsilat akisi kritik kapsamda ve su an üretim yolu (persistence) hatasi nedeniyle tamamlanamiyor.
