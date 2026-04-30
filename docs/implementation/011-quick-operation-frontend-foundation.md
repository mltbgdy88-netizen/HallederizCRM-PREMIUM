# 011 - Quick Operation Frontend Foundation

## Bu PR ne ekledi

Bu turda `Hizli Islem Merkezi` icin frontend foundation eklendi:

- Yeni route: `/hizli-islem`
- Islem turu secimi: `Teklif`, `Satis / Siparis`, `Teslim`, `Tahsilat`, `Iade`
- Cari secim ve kimlik paneli
- Urun/hizmet satir tablosu
- Satir bazli kaynak secim akordiyonu
- Toplamlar paneli
- Operasyon etkisi paneli
- Foundation aksiyon butonlari (backend write yok)

## Referans gorsellerin kullanimi

`docs/ui/quick-operation-reference/*` altindaki maketler pixel-perfect kopyalanmadi. Mevcut premium tema diline uyarlanmis bir temel iskelet kuruldu:

- Klasik fis/tablo psikolojisi
- Satir alti kaynak secimi
- Toplam + operasyon etkisi ayrik paneller
- Kompakt ve operasyon odakli layout

## Frontend-only foundation kapsami

Bu batch'te backend write baglantisi bilerek yapilmadi. Su aksiyonlar kontrollu foundation mesaji verir:

- `Taslak Kaydet`
- `Islemi Olustur`
- `Belge Onizle`
- `WhatsApp Taslagi`

Mesaj: backend contract baglantisinin sonraki asamada eklenecegini net belirtir.

## Kaynak secimi -> workflow impact mapping

Satir kaynagi secimine gore impact paneli onizleme uretir:

- `center_warehouse` -> depo hazirlik emri etkisi
- `factory` -> fabrika plan etkisi
- `supplier` -> tedarik takip etkisi
- `split` -> coklu kaynak plan etkisi
- `auto` -> otomatik kaynak onerisi etkisi

Ayrica islem turune gore ust etki notlari eklenir (offer/sale_order/delivery/payment/return).

## Sonraki is

Siradaki teknik adim `Quick Operation backend contract` baglantisidir:

- satir/payload DTO
- create draft endpointleri
- source-plan write baglantilari
- document/approval/whatsapp entegrasyon gecisi
