# Pilot Kalite Checklist

Bu dokuman, pilot gosterim oncesinde kritik akislari hizli ve tekrar edilebilir sekilde kontrol etmek icin kullanilir.

## 1) Ana Akis Kontrolleri

- Cari -> Teklif: `/cariler` listesi, detay karti ve "Teklif Olustur" gecisi.
- Teklif -> Siparis: teklif detayi, follow-up paneli, "Siparise Donustur" draft handoff.
- Siparis -> Tahsilat/Depo/Teslim/Fatura: detay panelinden buton gecisleri.
- Tahsilat -> Allocation: hedef kayit ve dagitim satirlari gorunurlugu.
- Depo -> Teslim: depo emri detayinda satir, raf/lokasyon ve durum akisleri.
- Belgeler: entity baglantisi, ilgili kayda git, queue save/queue print foundation.
- Dashboard/Gorev/Onay/AI: kart -> modal -> kayit zinciri ve AI onay gecisleri.

## 2) Smoke Komut Seti

Pilot oncesi minimum komutlar:

- `pnpm run smoke:routes`
- `pnpm run smoke:navigation`
- `pnpm run smoke:e2e`
- `pnpm typecheck`
- `pnpm build`

## 3) Kabul Kriteri

- Kritik route'lar acilmali.
- Ana butonlardan ilgili modullere gecis kopmamali.
- Dashboard, WhatsApp, AI ve Belgeler ekranlari bos kalmamali.
- TypeScript typecheck temiz gecmeli.
- Production build temiz gecmeli.
