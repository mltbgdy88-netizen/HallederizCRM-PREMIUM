# Pilot Demo Senaryosu

## Demo Sirket Ozeti
HallederizCRM-PREMIUM pilot senaryosu, duvar kagidi toptan/perakende satisi yapan ve bayi, perakende, mimar ve kurumsal musterilerle calisan bir operasyon ekibini temsil eder. Firma 3 merkez depo kullanir: Merkez Depo, Avrupa Depo ve Anadolu Depo. Fabrika stok gorunurlugu Ankara Fabrika API ve Izmir Excel Stok baglantilari uzerinden gosterilir.

## Ana Musteri Profilleri
- `customer_1` Aydin Dekor: bayi fiyat grubunda, ana uc uca satis senaryosunun musterisi.
- `customer_2` Mira Yapi: proje fiyat grubunda, yuksek riskli ve tahsilat oncelikli kurumsal cari.
- `customer_3` Pera Mimarlik: mimar fiyat grubunda, AI satis firsati senaryosu.
- `customer_5` Bursa Duvar Bayi: uzun suredir siparis vermeyen, yeniden aktivasyon gorevi olan bayi.
- `customer_8` Kuzey Insaat: blokeli risk ve yuksek borc senaryosu.

## Ana Urun Profilleri
Seed 10 urun icerir. Urunler farkli marka, fabrika, kategori, barkod, alias ve stok durumlariyla tanimlanir.

- `prod_1` DK-1001 Linen Soft Ivory: merkez depoda yeterli stok, ana siparis satiri.
- `prod_2` DK-2022 Geo Line Ash: merkez stok kritik, fabrika stok gorunurlugu stale.
- `prod_3` DK-3308 Concrete Mist: fabrika kaynakli satis ornegi.
- `prod_5` DK-5110 Marble Pearl ve `prod_9` DK-9100 Velvet Navy: merkez stogu dusuk, fabrika stogu yuksek urunler.

## Uctan Uca Akis
1. `/cariler` ekranindan Aydin Dekor acilir.
2. Cari kartinda bayi fiyat grubu, bakiye ve risk bilgisi gorulur.
3. `Teklif Olustur` aksiyonu `/teklifler/yeni?customer=customer_1` ile cari baglamli teklif acar.
4. `offer_2` teklifinden `order_1` siparis zinciri anlatilir.
5. `order_1` icinde bir satir merkez depodan, bir satir split/fabrika kaynak mantigiyla gosterilir.
6. `payment_1` kismi tahsilat olarak allocation tablosuna baglanir.
7. `warehouse_order_1` depo hazirlik emri olarak picking durumundadir.
8. `delivery_1` teslim bekleyen hazir kayit olarak dogrulama panelinde gorunur.
9. `invoice_1` kesilmis fatura ornegi olarak belge zincirine baglidir.
10. Belgeler merkezinde teklif, siparis, tahsilat, depo notu, teslim fisi, irsaliye, fatura, ekstre ve iade belgeleri bulunur.

## Dashboard Kartlari
Gorev Merkezi su kartlarda veri uretir:
- Yeni siparisler
- Odeme bekleyenler
- Depoda hazirlanacaklar
- Fabrikadan gelecekler
- Kritik stoklar
- Uzun suredir odeme yapmayanlar
- Yuksek risk cariler
- Yuksek borclular
- AI risk kartlari
- AI satis firsatlari

Kartlar modal icinde en az bir gorev satiri dondurecek sekilde seed veriye baglidir.

## WhatsApp ve AI
WhatsApp ekraninda bayi siparis/belge sorusu, ekstre talebi, depo gorev mesaji ve onay/aksiyon request ornekleri gorulur. Baglam paneli cari, siparis, tahsilat ve belge kayitlarina route verir.

AI ekraninda Mira Yapi ve Kuzey Insaat icin risk/tahsilat insight'lari, DK-2022 icin stok tahmini, SO-2455 icin operasyon hatirlatmasi ve `AI-401` proposal/onay akisi gosterilir.

