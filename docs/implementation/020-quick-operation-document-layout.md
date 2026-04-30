# 020 - Quick Operation Document Layout

## Revizyon Notu

Ilk document layout denemesi klasik fis ruhuna yaklasti ancak iki kritik geri bildirim aldi:

- Sol menunun gizlenmesi platform butunlugunu bozdu.
- Baslik, tablo ve blok olcekleri gereksiz buyuk kaldi; sayfa "devasa poster" hissi verdi.

Bu nedenle tam revert yapmadan, ayni document yapisini platform shell icinde kompakt hale getiren ikinci revizyon uygulandi.

## Yeni Sematik Yerlesim

Ekran artik tekrar platform shell icinde calisir:

- Sol menu geri getirildi; aktif menu ogesi `Hizli Islem` olarak korunuyor.
- Platform ust header korunuyor.
- Icerik bolgesi klasik fis ruhunda tutulup compact document layout'a gecirildi.
- Ust koyu lacivert band korunuyor ancak yukseklik/font olcegi kucultuldu.
- Urun/hizmet tablosu ana odak alan olarak korundu; satir yukseklikleri ve kolon olcekleri daraltildi.
- Aciklamalar + toplamlar iki kolon yapisi korunarak daha kibar boyuta cekildi.
- Sonuc paneli daha az alan kaplayacak sekilde compact hale getirildi.

## Degisen Bilesenler

- `apps/web/src/features/quick-operations/components/QuickOperationPage.tsx`
  - Kartli layout klasik fis/evrak layout'una donusturuldu.
  - Bos satir gorunumu 10 yerine 8 satira cekildi.
  - Mevcut state, kaynak secimi, submit, validation ve side action davranislari korundu.
- `apps/web/src/features/quick-operations/hooks/use-quick-operation-state.ts`
  - Islem notu / iade sebebi icin UI state eklendi.
  - Submit payload'una mevcut contract alanlari olan `note` ve `reason` ile aktarildi.
- `apps/web/src/components/platform-shell.tsx`
  - `/hizli-islem` icin eklenen fullscreen/focus kacisi kaldirildi.
  - Hizli Islem tekrar diger moduller gibi AppShell icinde calisiyor.
- `apps/web/app/globals.css`
  - `qo-*` document layout stilleri compact olceklere cekildi.
  - Buyuk margin/padding/font-size degerleri kucultuldu.
  - Gereksiz yatay tasma olusturan genislikler daraltildi.

## Korunan Business Logic

- Backend route, API contract ve SDK davranisi degismedi.
- Quick Operation submit/sideActions/validation akisi korundu.
- Auth, persistence, DB, WhatsApp, PDF ve AI business logic degistirilmedi.
- Gercek WhatsApp send, PDF binary render ve AI execution eklenmedi.

## Dogrulama Sonuclari

- `pnpm test` -> PASS
- `pnpm typecheck` -> PASS
- `pnpm build` -> PASS
- `pnpm smoke:routes` -> PASS
- `pnpm smoke:navigation` -> PASS
- `http://localhost:4000/health` -> 200
- `http://localhost:3010/login` -> 200
- `http://localhost:3010/hizli-islem` -> 200
- Web dev logu -> `Ready`

## Gorsel Kabul Notu

- Sol platform menu geri getirildi.
- Fullscreen yerine platform ici compact document layout secildi.
- Baslik bandi, blok paddingleri, input/button yukseklikleri ve tablo satirlari kucultuldu.
- Demo etiketi kullanilmiyor; yalnizca `HallederizCRM PREMIUM` etiketi var.
- Klasik fis hissi korunurken CRM butunlugu geri kazanildi.

## Not

`.env.local` commitlenmedi. Headless gorsel dogrulama anonim profil nedeniyle login ekranina dustu; kullanici oturumu olan tarayicida route shell'siz document layout olarak acilir.
