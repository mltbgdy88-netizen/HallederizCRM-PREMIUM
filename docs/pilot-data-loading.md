# Pilot Veri Yukleme Sirasi

Bu dokuman, kendi firma verilerini pilot tenant icine yuklerken onerilen sirayi tanimlar.

## Onerilen yukleme sirasi
1. Depolar (`warehouses`)
2. Cariler (`customers`)
3. Urunler (`products`)
4. Fiyatlar (`pricing`)
5. Stok / Lokasyon (`stock-locations`)

## Kritik alanlar

### Cariler
- `cari_kodu`
- `cari_adi`
- `musteri_tipi`
- `fiyat_grubu`

### Urunler
- `urun_kodu`
- `urun_adi`
- `ana_barkod`
- `kritik_stok`

### Fiyatlar
- `urun_kodu`
- `fiyat_slotu`
- `fiyat_degeri`
- `para_birimi`

### Depolar
- `depo_kodu`
- `depo_adi`

### Stok / Lokasyon
- `urun_kodu`
- `depo_kodu`
- `mevcut_stok`

## Ornek pilot akisi
1. `/ayarlar/pilot-veri-yukleme` ekranina gir.
2. Ilgili template’i indir.
3. Dosyayi doldur.
4. Preview calistir.
5. Hata varsa duzeltip tekrar preview al.
6. Apply ile kalici yaz.
7. `Gecmis` sekmesinden sonucu kontrol et.
8. Ayarlar > Pilot Kurulum checklistte adimlarin tamamlandigini dogrula.

## Demo ve Gercek tenant ayrimi
- Demo mod korunur.
- Gercek pilot veriler tenant baglaminda yazilir.
- Pilot importlar `imports/history` kayitlarinda izlenir.
