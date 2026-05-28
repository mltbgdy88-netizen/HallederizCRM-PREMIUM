# Referans görseller — toplu onay paketi

**Klasör:** `docs/design/reference/`  
**Ölçü hedefi:** 1920×1080, açık mod  
**Görsel dil:** zümrüt sidebar + altın vurgu + krem zemin (`stok-operasyon-masasi-acik-mod.png`)

## Onaylı (kod kilidi açık)

| Dosya | Route |
|-------|--------|
| `stok-operasyon-masasi-acik-mod.png` | `/stok` |
| `arsiv-operasyon-merkezi-acik-mod.png` | `/archive` |
| `rapor-operasyon-merkezi-acik-mod.png` | `/raporlar` |
| `whatsapp-operasyon-paneli-acik-mod.png` | `/whatsapp` |

## Taslak — inceleme (72 dosya)

Tam liste ve route eşlemesi: [`UI_REFERENCE_CATALOG.md`](../../development/UI_REFERENCE_CATALOG.md)  
Sayfa rehberi (senaryolar): [`UI_REFERENCE_PAGE_GUIDES.md`](../../development/UI_REFERENCE_PAGE_GUIDES.md)

Cari + Sipariş detay/katman ekran sözlüğü (Türkçe): [`ENTITY_LAYER_REFERENCE.md`](../ENTITY_LAYER_REFERENCE.md)

Şablon grupları:

- **A (18):** Liste operasyon masaları (teklifler, siparişler, cariler, tahsilatlar, teslimatlar, …)
- **B (14):** Entity detay kök + modül detay
- **C (21):** Cariler / Siparişler / Teklifler alt katman sekmeleri
- **D (5):** Dashboard, hızlı işlem, onaylar, AI hub
- **E (6):** Yeni kayıt formları
- **F (2):** Yeni teklif / sipariş hub
- **G (5):** Login ve sistem state sayfaları
- **H (1):** Gelen kutu üç panel

## Toplu onay (önerilen)

Tümünü kabul:

```text
ONAY: TÜMÜ
```

Modül bazlı:

```text
ONAY: Dalga1-liste, Dalga2-ticari, Sprint3-katman, Sistem-G
```

Revizyon:

```text
REVIZYON: depo-hazirlik-masasi-acik-mod.png — chip satırı Bekleyen/Hazırlanan ekle
```

Onay sonrası: `UI_REFERENCE_APPROVAL_TRACKER.md` ve `UI_MASTER_DESIGN_BACKLOG.md` güncellenir; kod ajanları bire bir implementasyona geçer.

## Ek dosyalar (katalog dışı, isteğe bağlı silinebilir)

Alternatif üretim denemeleri; resmi katalog dosyası değildir:

- `dashboard-gosterge-paneli-acik-mod.png` → yerine `dashboard-operasyon-acik-mod.png`
- `hizli-islem-merkezi-acik-mod.png` → yerine `hizli-islem-satis-masasi-acik-mod.png`
- `gelen-kutu-operasyon-paneli-acik-mod.png` → yerine `gelen-kutu-uc-panel-acik-mod.png`
