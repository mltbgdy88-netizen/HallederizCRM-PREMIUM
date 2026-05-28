# Veri bağlama ilkesi (birleştirme)

## Kaynak önceliği

1. **Canlı:** PREMIUM `get-*.ts` / `sdk` / domain mapper (tenant scope)
2. **Demo:** PREMIUM demo satırları (`*-demo-records`, `CUSTOMERS_PORTFOLIO_DEMO_ROWS`, …)
3. **Son çare:** Final `*-operasyon-mock.ts` yalnızca layout boş kalmasın diye — **birincil veri değil**

## Adapter deseni

```
features/<modul>/adapters/<modul>-reference-adapter.ts   → PREMIUM → referans snapshot tipi
features/<modul>/hooks/use-<modul>-reference-data.ts     → useReferenceData
features/<modul>/components/*Page.tsx                  → hook'tan KPI, satır, sağ panel
```

## Final mock'un rolü

- CSS sınıf adları ve **tip tanımları** (`CarilerTableRow`, `RomKpi`, …) kalabilir
- Sabit başlık/alt başlık/filtre **etiketleri** mock'tan; **değerler** adapter'dan
- `demoBanner`: canlı modda `REFERENCE_DEMO_BANNER` veya loadFailed mesajı

## Ekstra UI öğeleri (yeni ekranda olup PREMIUM'da veri varsa)

- Sağ panelde PREMIUM quick preview alanları adapter `getContext` / `detail` ile doldurulur
- PREMIUM'da olmayan alan: placeholder veya gizle — sahte canlı veri üretme

## Modül durumu

| Modül | Adapter | Not |
|-------|---------|-----|
| cariler, teklifler, siparisler, tahsilatlar | ✅ | Liste + context |
| stok, onaylar, belgeler, whatsapp, dashboard | ✅ | |
| hizli-islem | ✅ | Merkez + satış masası okuma |
| arsiv | ✅ | `archive` queries |
| raporlar | ✅ | `reports-demo-data` + KPI türetimi |
| gelen-kutu | ✅ | WA omnichannel → 3 panel |
| Cariler detay + katman (7) | ✅ | `?customerId=` |
| Sipariş / teklif detay masası | ✅ | `?orderId=` / `?offerId=` |
| Tahsilat detay, teslimat, fatura… | Bekliyor | |
