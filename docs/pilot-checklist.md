# Pilot Kalite Checklist

Bu dokuman, HallederizCRM-PREMIUM pilot gosterimi oncesinde ana akislarin hizli kontrol listesidir. Amac yeni modul kapsamı eklemek degil; mevcut foundation'in pilot kullaniciya tutarli ve guvenli gorunmesini saglamaktir.

## 1. Ana Akis Kontrolleri

### Cari -> Teklif
- Cari listesi `/cariler` uzerinden acilir.
- Cari satiri detay kartina gider.
- Cari kartinda fiyat grubu ve risk bilgisi gorunur.
- `Teklif Olustur` aksiyonu `/teklifler/yeni?customer=:id` ile cari baglamli yeni teklif taslagina gider.

### Teklif -> Siparis
- Teklif listesi ve teklif detayi acilir.
- Teklif satirlari musteri fiyat slotu snapshot'i ile gosterilir.
- Follow-up paneli teklif takibini gosterir.
- `Siparise Donustur` aksiyonu `/siparisler/yeni?sourceOffer=:id` ile siparis draft handoff olusturur.

### Siparis -> Tahsilat / Depo / Teslim / Fatura
- Siparis listesi ve detay ekrani acilir.
- Sag panelde siparis ozeti, operasyon etkisi, risk/uyari ve AI aciklamasi gorunur.
- Tahsilat ekleme modal foundation'i siparis baglaminda acilir.
- Depo sekmesi bagli depo emirlerini gosterir.
- Teslim ve fatura aksiyonlari ilgili mock kayit varsa dogrudan detay ekranina gider.

### Tahsilat -> Allocation
- Tahsilat listesi ve detay ekrani acilir.
- Allocation tablosu hedef tipi, hedef no, hedef toplam, acik bakiye ve ayrilan tutari gosterir.
- Yeni tahsilat taslagi en az bir siparis hedefiyle acilir.

### Depo -> Teslimat
- Depo gorev listesi ve depo emir detayi acilir.
- Depo emri satirlari urun, miktar, raf ve lokasyon baglamiyla gosterilir.
- Hazirliga basla / hazirlandi aksiyonlari foundation seviyesinde gorunur.
- WhatsApp depocu gorev bildirimi placeholder foundation olarak isaretlidir.

### Belgeler ve Local Output
- Belge merkezi `/belgeler` acilir.
- Belge kaydi entity tipi, entity no, musteri ve gonderim durumu ile gorunur.
- WhatsApp veya cari baglamindan gelen `document` / `customer` query parametresi ilk secimi belirler.
- Queue save / queue print aksiyonlari local agent foundation'ina hazir arayuz olarak gorunur.

### Dashboard / Gorev / Onay / AI
- Ana sayfa sistem ve AI kartlarini ayri kaynaklarla gosterir.
- Kart secimi gorev listesi modalina iner.
- Gorevler ve onaylar listeleri ilgili kayit navigasyonunu sunar.
- AI ekraninda read-only / operator modu, proposal, approval ve execution history birlikte gorunur.

## 2. Pilot Demo Senaryosu

Onerilen pilot sirasi:

1. `/` uzerinden Gorev Merkezi kartlari anlatilir.
2. `/cariler` uzerinden bir bayi acilir ve fiyat grubu gosterilir.
3. Cari kartindan yeni teklif acilir.
4. Mevcut bir tekliften siparise donusum yapilir.
5. Siparis detayinda operasyon etkisi, tahsilat, depo, teslim ve fatura baglari gosterilir.
6. `/whatsapp` uzerinden baglam panelinden cari/siparis/belge gecisleri gosterilir.
7. `/ai` uzerinden proposal -> approval -> execution foundation anlatilir.
8. `/ayarlar` uzerinden AI ve yerel cikti politikalari gosterilir.

## 3. Kabul Kriteri

- TypeScript typecheck temiz gecmeli.
- Production build temiz gecmeli.
- Pilot akista kullanici bos veya yaniltici bir sayfaya dusmemeli.
- Placeholder alanlar bilincli foundation diliyle aciklanmali.
