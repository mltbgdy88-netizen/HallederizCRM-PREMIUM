# Pilot Tenant Setup

Bu rehber, HallederizCRM-PREMIUM'u demo moddan cikartip kendi firmaniz icin pilot kullanim hazirligina almak icin izlenecek adimlari tanimlar.

## 1) Sirket Bilgileri
`/ayarlar > Sirket`
- Sirket adi
- Ticari unvan
- Vergi dairesi / vergi no
- Mersis no
- Telefon / e-posta / adres
- IBAN
- Varsayilan para birimi

## 2) Depo Tanimlari
`/ayarlar > Depolar`
- En az 3 depo tanimlayin (Merkez, Avrupa, Anadolu)
- Kod, tip, aktif/pasif ve sira bilgilerini netlestirin
- Varsayilan depoyu secin

## 3) Fiyat Slotlari
`/ayarlar > Fiyat/Kategori`
- 6 slot adini firmanizdaki fiyatlama diline gore guncelleyin
- Para birimi ve aktif/pasif durumunu ayarlayin
- Varsayilan slotu secin

## 4) Kategori Slotlari
`/ayarlar > Fiyat/Kategori`
- 4 kategori slotunu (Marka, Koleksiyon, Model/Grup, Renk/Desen gibi) isimlendirin
- Aktif/pasif durumlarini duzenleyin

## 5) Cari Import
- Cari import tablosunu hazirlayin
- Musteri tipi, fiyat profili, iletisim ve adres alanlarinin dolu oldugunu dogrulayin

## 6) Urun Import
- Urun kodu, urun adi, marka, fabrika, barkod ve kategori alanlarini dogrulayin

## 7) Stok Import
- Depo bazli stok bakiyesi
- Lokasyon/raf bilgisi

## 8) ERP Baglantisi
`/erp`
- Baglanti testi
- Mapping kontrolu
- Ilk sync dry-run

## 9) Fabrika Baglantisi
`/fabrikalar/stoklar` ve `/fabrikalar/siparisler`
- Stok sync testi
- Siparis gonder/al testleri

## 10) WhatsApp Baglantisi
`/whatsapp` ve `/ayarlar`
- Business numara
- Template/approval policy
- Action request akisi

## 11) AI Ayarlari
`/ai` ve `/ayarlar`
- Provider/model secimi
- Read-only varsayilan acik
- Mutation approval zorunlu acik

## 12) Yazdirma/Kayit Ayarlari
`/ayarlar`
- Root klasor
- Belge tipi -> alt klasor eslestirmesi
- Otomatik kaydet / otomatik yazdir kurallari
- Local agent durum kontrolu

## 13) Kullanici ve Rol Kurulumu
`/ayarlar > Rol ve Personel` ve `/kullanicilar`
- Yonetici, Satis, Muhasebe, Depo, Pazarlama presetlerini gozden gecirin
- Pilot kullanicilari hizli ekleyin
- Mobil erisim ve approval yetkilerini dogrulayin
