# Import Mapping Kurallari

Bu dokuman, veri yukleme merkezindeki kolon esleme, sheet secimi ve validation kurallarini ozetler.

## Header normalize mantigi
Basliklar normalize edilir:
- kucuk harf
- turkce karakter temizleme
- bosluk/ayrac -> `_`

Ornek:
- `Cari Kodu` -> `cari_kodu`
- `STOKKOD` -> `stokkod`

## Alias esleme mantigi
Normalize basliklar alias listesiyle hedef alana baglanir.

Ornek aliaslar:
- Customers: `CariKod`, `Musteri Kodu`, `CARIKOD` -> `cari_kodu`
- Products: `Stok Kodu`, `SKU`, `Urun Kodu` -> `urun_kodu`
- Pricing: `Slot`, `Slot Adi`, `Bayi Fiyati` -> `fiyat_slotu`
- Warehouses: `Warehouse Code`, `Depo Kodu` -> `depo_kodu`
- Stock: `Raf`, `Raf No` -> `raf_no`

## Sheet onerme skoru
XLSX dosyada her sheet icin skor hesaplanir:
- eslesen kolon sayisi puan kazandirir
- eksik zorunlu kolon puani dusurur

Donen alanlar:
- `sheetScoreSummary`
- `suggestedSheetName`

## Zorunlu kolonlar
- customers: `cari_kodu`, `cari_adi`
- products: `urun_kodu`, `urun_adi`
- pricing: `urun_kodu`, `fiyat_slotu`, `fiyat_degeri`, `para_birimi`
- warehouses: `depo_kodu`, `depo_adi`
- stock-locations: `urun_kodu`, `depo_kodu`, `mevcut_stok`

## Conflict turleri
- `duplicate_in_file`
- `barcode_conflict`
- `unknown_product`
- `unknown_warehouse`
- `invalid_slot`
- `invalid_currency`
- `invalid_number`
- `missing_required_column`
- `unmapped_column`

## Uyari tipleri
- mevcut kayitla eslesme (update)
- fallback uygulama (fiyat grubu vb.)
- normalize edilen alan uyari notu

## Preview ve apply
- Preview satir bazli status uretir: `valid`, `warning`, `error`
- Apply oncesinde preview kurallari tekrar kullanilir
- Failed importlar history + error report ile kaydedilir
