# Hızlı Islem Merkezi

## 1. Amac

Hızlı Islem Merkezi, kullaniciya klasik fis/tablo hissi veren ama arka planda CRM workflow ureten tek ekrandir.

Kullanici basit bir tablo doldurdugunu hisseder. Sistem arka planda CRM, depo, fabrika, tahsilat, belge, WhatsApp ve AI workflowlarini uretir.

## 2. Route

Hedef route:

```text
apps/web/app/(platform)/hizli-islem/page.tsx
```

## 3. Islem Turleri

- `offer`
- `sale_order`
- `delivery`
- `payment`
- `return`

## 4. Ana UI Bolumleri

- Islem turu secimi
- Cari bilgileri
- Urun/hizmet satir tablosu
- Satir alti kaynak secimi akordiyonu
- Aciklamalar / kosullar
- Toplamlar
- Operasyon etkisi paneli

## 5. Tablo Kolonlari

| Kolon |
|---|
| NO |
| KOD |
| URUN / HIZMET ADI |
| MIKTAR |
| KAYNAK |
| DEPO |
| RAF |
| BIRIM FIYAT |
| KDV |
| TOPLAM |

## 6. Kaynak Secenekleri

- `center_warehouse`
- `factory`
- `supplier`
- `split`
- `auto`

## 7. Is Akisi Kurali

- `center_warehouse` secilirse warehouse workflow impact olusur.
- `factory` secilirse factory workflow impact olusur.
- `supplier` secilirse supplier/procurement workflow impact olusur.
- `split` secilirse coklu kaynak plani olusur.
- `auto` secilirse sistem kaynak onerisi uretir.

## 8. Islem Turu Etkileri

### `offer`

- Teklif olusturur.
- Belge/WhatsApp taslagi hazirlanabilir.
- Stok rezervasyonu yapmaz.

### `sale_order`

- Siparis olusturur.
- Source plan uretir.
- Depo/fabrika/tedarik workflow etkileri uretir.
- Belge olusturabilir.

### `delivery`

- Mevcut siparisten veya serbest teslim baslatir.
- Depo hazirlik ve odeme durumunu kontrol eder.

### `payment`

- Tahsilat olusturur.
- Siparis/fatura allocation yapar.

### `return`

- Iade talebi olusturur.
- Stok/finans etkisini hesaplar.
- Gerekirse approval olusturur.

## 9. UX Prensibi

Kullanici klasik fis mantigiyla hizli islem yapar:

- Once islem turunu secer.
- Cari ve satir bilgilerini girer.
- Kaynak secimini satir altinda akordiyonla yapar.
- Sistem operasyon etkisini sag panelde veya sonuc ekraninda gosterir.

Arka planda olusabilecek kayitlar:

- Teklif veya siparis
- Depo hazirlik emri
- Fabrika plani
- Tedarik/procurement gorevi
- Tahsilat allocation
- Iade etkisi
- Belge taslagi
- WhatsApp taslagi
- AI onerisi veya approval kaydi

## 10. UI Referanslari

Referans gorseller pixel-perfect tasarim degildir. Yeni ekran mevcut HallederizCRM-PREMIUM premium temasina uyarlanacaktir.

Gorseller:

- `docs/ui/quick-operation-reference/hizli_islem_01_ana_ekran.png`
- `docs/ui/quick-operation-reference/hizli_islem_02_kaynak_akordiyon.png`
- `docs/ui/quick-operation-reference/hizli_islem_03_operasyon_etkisi.png`
- `docs/ui/quick-operation-reference/hizli_islem_04_tahsilat_iade_modlari.png`
