# 022 - Platform Scroll/Layout Fix

## Sorunun Nedeni
Platform layout içinde birden fazla katmanda ayni anda `overflow:auto` ve viewport yuksekligi kisitlari tanimliydi. Ozellikle `AppShell` tarafinda:
- `.hz-shell-content` scroll,
- `.hz-shell-content-frame` icinde ikinci scroll,
- bazi alanlarda `min-height/max-height` ile viewport kisitlari
birlikte kullanildigi icin cift dikey scroll hissi, icerik clipping ve global yatay scroll olusuyordu.

## Duzeltilen Alanlar
Degisiklikler: `apps/web/app/globals.css`

1. Global x-overflow kontrolu:
- `html, body` icin `overflow-x: hidden` eklendi.

2. Shell yukseklik modeli:
- `.hz-shell` ve `.hz-shell-frame` `min-height` tabanli modelden `height` tabanli viewport modeline alindi.
- `.hz-shell` ve `.hz-shell-main` icin `overflow: hidden` ile shell seviyesinde cift scroll engellendi.

3. Tek ana dikey scroll karari:
- Ana scroll kaynagi olarak `.hz-shell-content` birakildi (`overflow:auto`).
- `.hz-shell-content-frame` icindeki ikinci scroll kaldirildi (`overflow:visible`, `max-height:none`, `height:auto`).

4. Hizli Islem lokal yatay scroll sinirlamasi:
- `.qo-table-scroll` icin `overflow-y:hidden` ile tablo x-scroll lokal tutuldu.
- `.qo-document-page` icin `overflow-x: clip` ile gereksiz global tasma azaltildi.

5. Responsive shell kurallari:
- 1180px ve 760px kirilimlarinda shell/workspace yukseklikleri `height` modeliyle hizalandi.

## Global Scroll Karari
- Uygulamada tek ana dikey scroll kaynagi: `.hz-shell-content`.
- Sidebar kendi alaninda stabil, ana icerik kendi kolonunda scroll.
- Body seviyesinde ikinci dikey scroll uretilmiyor.

## Hizli Islem Uzerindeki Etkisi
- `/hizli-islem` sayfasi sol menulu platform shell icinde kaldi.
- Kompakt klasik fis gorunumu korunurken scroll clipping sorunu giderildi.
- Tablonun yatay kaydirma ihtiyaci lokal wrapper icinde sinirli tutuldu.

## Kontrol Edilen Route'lar
Runtime route kontrolu yapildi:
- `/`
- `/cariler`
- `/stok`
- `/teklifler`
- `/siparisler`
- `/tahsilatlar`
- `/depo`
- `/hizli-islem`
- `/whatsapp`
- `/ayarlar`

Tamami 200 dondu.

## Dogrulama Sonuclari
- `pnpm test` -> gecti
- `pnpm typecheck` -> gecti
- `pnpm build` -> gecti
- `pnpm smoke:routes` -> gecti
- `pnpm smoke:navigation` -> gecti
- `http://localhost:4000/health` -> 200

Not: Ilk `pnpm typecheck` calistirmasinda `.runtime-next/types` gecici dosya uyumsuzlugu goruldu; yeniden calistirmada temiz gecmistir.

## Kapsam Disi / Korunan Alanlar
Bu duzeltme sadece layout/scroll/CSS katmaninda yapildi.
Asagidaki alanlarda davranis degisimi yok:
- API
- auth
- DB/persistence
- quick-operation submit/preview contract
- validation ve side actions
- WhatsApp/PDF/AI business logic
