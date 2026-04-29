# Veri Import Akisi

Bu dokuman, HallederizCRM-PREMIUM icin pilot veri yukleme akisini ozetler.

## Kapsam
- `customers`
- `products`
- `pricing`
- `warehouses`
- `stock-locations`

## Endpointler
- `GET /imports/templates`
- `GET /imports/templates/:type`
- `POST /imports/:type/preview`
- `POST /imports/:type/apply`
- `GET /imports/history`
- `GET /imports/history/:id`

## Akis
1. Template indirilir (`/imports/templates/:type`).
2. Kullanici CSV dosyasini yukler.
3. `preview` cagrisi ile parse/validation sonuclari uretilir.
4. Hata yoksa `apply` cagrisi ile veri kalici katmana yazilir.
5. Sonuc `import_history` kaydina yazilir.

## Parse / Validate / Preview
- Parse: CSV satirlari ve kolonlari normalize edilir.
- Validate: zorunlu alan, duplicate, referans eslesme ve sayisal kontrol yapilir.
- Preview: gecerli satir, hata/uyari listesi ve satir ornekleri donulur.

## Conflict Politikalari
- Cari kodu duplicate: dosya icinde `error`, mevcut kayitta `warning` (update olarak ele alinir).
- Urun kodu duplicate: dosya icinde `error`, mevcut kayitta `warning` (update olarak ele alinir).
- Barkod cakisimi: `error`.
- Fiyat slotu gecersiz: `error`.
- Urun/depo eslesmesi yok: `error`.

## History Modeli
Her import icin:
- `id`
- `type`
- `fileName`
- `uploadedBy`
- `uploadedAt`
- `previewRecordCount`
- `successCount`
- `errorCount`
- `warningCount`
- `status`
- `summary`

## Notlar
- Bu batchte CSV tam desteklidir.
- XLSX yuklemeleri icin kontrollu mesaj ile CSV’ye disa aktarma yonlendirmesi bulunur.
