# Quick Operation Manual Test Plan

## Kapsam
Bu plan `/hizli-islem` ekraninin pilot kabul oncesi manuel test adimlarini listeler.

## Ortam On Kosullari
- Kullanici authenticated olmali.
- Kullanici en az `orders.write` seviyesinde yetkiye sahip olmali.
- Demo data veya pilot data yuklenmis olmali.

## Senaryo 1 - Teklif Olustur
1. `/hizli-islem` ac.
2. Islem turu: `Teklif`.
3. Cari sec.
4. En az bir satir doldur.
5. `Islemi Olustur` tikla.
6. Beklenen:
   - `mode: executed` veya kontrollu foundation
   - sideActions document preview basligi teklif tipinde olusur
   - WhatsApp taslagi gonderim kapali gorunur

## Senaryo 2 - Satis/Siparis (Merkez Depo)
1. Islem turu: `Satis / Siparis`.
2. Satir kaynagi `center_warehouse`.
3. Submit et.
4. Beklenen:
   - order execution sonucu doner
   - workflow impact: warehouse etkisi gorunur

## Senaryo 3 - Satis/Siparis (Fabrika)
1. Islem turu: `Satis / Siparis`.
2. Satir kaynagi `factory`.
3. Submit et.
4. Beklenen:
   - workflow impact: factory plan etkisi gorunur

## Senaryo 4 - Tahsilat Olustur
1. Islem turu: `Tahsilat`.
2. Odeme tutari gir.
3. Submit et.
4. Beklenen:
   - payment execution sonucu veya kontrollu foundation
   - allocation required impact gorunur

## Senaryo 5 - Teslim Olustur
1. Islem turu: `Teslim`.
2. `orderId` referansi ile satir gir.
3. Submit et.
4. Beklenen:
   - executed veya controlled foundation
   - belge basligi `Teslim Fisi Onizleme`
   - odeme/depo kontrol warningleri

## Senaryo 6 - Iade Talebi Olustur
1. Islem turu: `Iade`.
2. Satir ve `reason`/`note` gir.
3. Submit et.
4. Beklenen:
   - executed veya review foundation
   - `return_approval_may_be_required` impact gorunur
   - belge basligi `Iade Talebi Onizleme`

## Senaryo 7 - Validation Hatalari
- quantity=0 -> `quantity_invalid`
- delivery referanssiz + satirsiz -> validation error
- return reason/note bos -> `return_reason_required`
- Beklenen: execution yapilmaz, mode foundation kalir

## Senaryo 8 - Side Actions Paneli
1. Submit sonrasi `Belge Onizle` tikla.
2. Submit sonrasi `WhatsApp Taslagi` tikla.
3. AI insight kartini kontrol et.
4. Beklenen:
   - Belge taslagi gorunur
   - WhatsApp taslagi gorunur, `sendEnabled=false`
   - AI warnings/recommendations gorunur

## Senaryo 9 - Auth Olmayan Erisim
1. Token olmadan `/quick-operations/preview` ve `/submit` cagir.
2. Beklenen: 401.

## Senaryo 10 - Yetkisiz Erişim
1. Auth var ama write permission yok.
2. `/quick-operations/preview` veya `/submit` cagir.
3. Beklenen: 403.
