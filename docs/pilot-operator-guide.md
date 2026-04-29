# Pilot Operator Guide

Bu kilavuz pilot surecinde rollerin hangi ekranlari kullanacagini ve onboarding kartlarinin nasil okunacagini ozetler.

Karar notu:
- Web uygulama ic personel rolleri icindir.
- Dis bayi/musteri icin ayri portal login verilmez; dis bilgi akislarinda temel kanal WhatsApp'tir.

## Pilot Hazirlik ekrani nasil okunur?
1. Ustteki "Kritik Eksik" sayisini kontrol et.
2. Bloklayicilar bolumundeki kritik kalemleri kapat.
3. Rol onboarding kartindan kendi rolune dusen aciklari tamamla.
4. Son olarak Staging Kontrol ekraninda servis health testlerini yenile.

## 1. Yonetici
Onboarding odagi:
- Sistem genel durumu
- Kritik eksikler
- Entegrasyon sagligi

Ilk ekranlar:
- `/`
- `/ayarlar/pilot-hazirlik`
- `/ayarlar/staging-kontrol`
- `/ai`
- `/ayarlar`

## 2. Satis
Onboarding odagi:
- Cari, urun ve fiyat verisinin hazirligi
- Teklif ve siparis acilis akisi

Ilk ekranlar:
- `/cariler`
- `/teklifler`
- `/siparisler`
- `/whatsapp`

## 3. Muhasebe
Onboarding odagi:
- Tahsilat/fatura akisi
- Belge cikti surecleri

Ilk ekranlar:
- `/tahsilatlar`
- `/faturalar`
- `/belgeler`

## 4. Depo
Onboarding odagi:
- Depo tanimlari
- Stok/lokasyon verisi
- Teslimat operasyonu

Ilk ekranlar:
- `/depo`
- `/teslimatlar`
- `/belgeler`

## 5. Pazarlama
Onboarding odagi:
- WhatsApp ve AI ile iletisim/analiz
- Rapor ve belge erisimi

Ilk ekranlar:
- `/belgeler`
- `/raporlar`
- `/whatsapp`
- `/ai`

## Gun sonu minimum kontrol
- Pilot Hazirlik: kritik kalem kaldi mi?
- Staging Kontrol: health durumlari fallback/misconfigured mi?
- Belge kuyrugu: basarisiz save/print isi var mi?
- Onaylar: bekleyen kritik onay kaldi mi?
