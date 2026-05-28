# Pilot Readiness Status

Bu dokuman pilot tenant icin canliya cikis oncesi hazirlik panelinin nasil okunacagini aciklar.

## Kontrol merkezi
- Uygulama ici ekran: `/ayarlar/pilot-hazirlik`
- Servis sagligi ekrani: `/ayarlar/staging-kontrol`
- Veri yukleme merkezi: `/kurulum/veri-yukleme`

## Panel bolumleri
- Ust ozet bandi: tamamlanma, kritik eksik, uyari, hazir kalem, entegrasyon sagligi
- Bloklayicilar: sadece kritik/oncelikli kalemler
- Grup bazli checklist: aksiyon odakli adim listeleri
- Rol onboarding kartlari: ekip bazli ilk kullanim adimlari
- Hizli aksiyonlar: ilgili ekranlara tek tik gecis

## Oncelik seviyeleri
- `critical`: pilotu durdurabilecek bloklayici eksik
- `warning`: pilotu tamamen durdurmaz ama operasyon riski olusturur
- `ready`: pilot icin hazir
- `info`: bilgilendirme / takip seviyesi

## Durum seviyeleri
- `tamam`
- `uyari`
- `eksik`

Not: Bir kalem `status=eksik` olsa da onceligi `warning` olabilir. Bloklayici kararini `blocking=true` ve `priority=critical` birlikte belirler.

## Checklist kategorileri
- Sirket ve Tenant
- Fiyat / Kategori / Doviz
- Depolar ve Stok
- Kullanicilar ve Roller
- Veri Yukleme
- Belge / Yazdirma
- Entegrasyonlar
- AI ve Operasyon

## Bloklayici yorumlama
- Kritik listesi bos ise "pilotu engelleyen eksik yok" kabul edilir.
- Kritik listesi doluysa bu maddeler kapanmadan canli pilot acilisi onerilmez.

## Fallback alanlari
Asagidaki servislerde fallback gorulmesi normal olabilir:
- AI (provider anahtari yoksa)
- WhatsApp (provider devre disiysa)
- ERP/Factory (baglanti testi gecilmediyse)
- Local Agent (disabled/safe mode)

Fallback durumunda pilot devam edebilir ancak ilgili otomasyon canli etkide calismaz.

## Kanal ve erisim notu
- Pilotta web cockpit ic personel kullanimi icindir.
- Dis bayi/musteri akislarinda ayrik portal yerine WhatsApp + belge paylasim modeli esas alinir.
