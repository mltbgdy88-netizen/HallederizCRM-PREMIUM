# Veri Import Akisi

Bu dokuman, HallederizCRM-PREMIUM icin import merkezinin parse -> validate -> preview -> apply -> history akisini ozetler.

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
- `POST /imports/history/:id/retry`
- `GET /imports/history/:id/error-report`

## Akis
1. Template indirilir.
2. CSV veya XLSX dosyasi yuklenir.
3. Preview cagrisi parse/validation sonucu dondurur.
4. Hata yoksa apply ile kalici yazim calisir.
5. Sonuc import history ve audit tarafina yazilir.

## CSV + XLSX
- CSV destegi korunur.
- XLSX destegi vardir.
- XLSX dosyada birden fazla sheet varsa sistem sheet basliklarini skorlayarak `suggestedSheetName` onerir.
- Kullanici isterse sheet secimini degistirip preview/apply tekrar calistirabilir.

## Preview metadata
Preview cevabinda su alanlar doner:
- `fileType`: `csv` veya `xlsx`
- `sheetName`: secili sheet
- `sheetNames`: tum sheet listesi
- `suggestedSheetName`: otomatik onerilen sheet
- `sheetScoreSummary`: sheet bazli uyum skoru
- `columnMapping`: ham baslik -> normalize alan
- `requiredMissingColumns`: zorunlu eksik kolonlar
- `unmappedColumns`: eslestirilemeyen kolonlar

## Hata ve uyari modeli
- Satir bazli hata/uyari uretilir.
- Her issue kaydinda satir no, kolon, seviye, kod, mesaj, cozum oneri bilgisi tutulur.
- Onizleme kayitlarinda satir durumlari: `valid`, `warning`, `error`.

## Conflict Politikalari
- Duplicate customer/product code: dosya icinde `error`, mevcut kayitta `warning` (update semantigi).
- Barcode conflict: `error`.
- Invalid currency/slot/number: `error`.
- Unknown product/warehouse mapping: `error`.

## Apply ve sonuc
- Apply oncesi preview dogrulamasi tekrar kullanilir.
- Hata varsa import `failed` olarak history'ye yazilir.
- Basarili/kismi basarili importlar `applied` olarak kaydedilir.
- Sonuc alanlari:
  - totalRows
  - successCount
  - errorCount
  - warningCount
  - skippedCount
  - conflictCount
  - durationMs

## History / Retry / Error Report
- Import gecmisi tip, dosya, sheet, sonuc ve sayisal ozetle listelenir.
- `retry` endpointi failed kaydi tekrar deneme durumuna cekmek icin foundation sunar.
- `error-report` endpointi satir bazli derlenmis hata raporu dondurur.
