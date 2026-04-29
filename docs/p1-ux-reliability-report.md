# P1 UX Reliability Report (2026-04-29)

## 1. Calisan Filtreler
- Canli filtreleme zaten mevcut olan ve bu turda korunup dogrulanan ekranlar:
  - `/cariler`
  - `/teklifler`
  - `/siparisler`
  - `/tahsilatlar`
  - `/depo`

## 2. Foundation Olarak Birakilan Filtreler
Bu ekranlarda kullaniciyi no-op ile yaniltmamak icin filtre aksiyonlari acikca foundation olarak etiketlendi ve bilgi metni eklendi:
- `/gorevler`
- `/belgeler`
- `/erp`
- `/whatsapp`
- `/ai/onaylar`
- `/ai/icgoruler`
- `/fabrikalar/stoklar`
- `/fabrikalar/siparisler`

## 3. Sag Panel Senkronizasyonu Duzeltilen Ekranlar
- `/gorevler`
  - Secili satir state'i ile sag panel baglandi.
  - Gecersiz secim durumunda guvenli fallback secimi eklendi.
- `/fabrikalar/stoklar`
  - Secili stok satiri state'i eklendi.
  - Sag panel secilen satira baglandi.
- `/fabrikalar/siparisler`
  - Secili siparis satiri state'i eklendi.
  - Sag panel secilen satira baglandi.

## 4. Eklenen Gorunur Detay/Ac Aksiyonlari
- `/gorevler` listesi: satir bazli `Detay`
- `/belgeler` listesi: satir bazli `Detay`
- `/fabrikalar/stoklar` listesi: satir bazli `Ac`
- `/fabrikalar/siparisler` listesi: secim + satir bazli `Detay`

## 5. Iyilestirilen Kullanici Mesajlari
- Foundation filtre alanlarinda net bilgilendirme metinleri eklendi.
- Kullaniciya "simdilik listeyi etkilemez" mesaji acikca verildi.
- Belirsiz filtre butonlari yerine `Filtre Foundation` ifadesi kullanildi.

## 6. Guncellenen Route / Dokuman Hizalari
- `docs/module-map.md` icinde legacy route referanslari canonical route'lara cekildi:
  - `/tasks` -> `/gorevler`
  - `/approvals` -> `/onaylar`
  - `/ai/proposals` -> `/ai/onaylar`
  - `/ai/insights` -> `/ai/icgoruler`

## 7. Hala Kalan Orta Seviye UX Riskleri
- `/teslimatlar`, `/faturalar`, `/iadeler`, `/onaylar` ve bazi diger liste ekranlarinda filtrelerin tamamini canli sorguya baglama isi suruyor.
- Bazi ekranlarda secim kaliciligi (sayfa degisimi + filtre kombinasyonu) daha ileri durumda iyilestirilebilir.
- Bazi kart/toolbar aksiyonlari hala foundation etiketli olup canli entegrasyon baglantisi bekliyor.
