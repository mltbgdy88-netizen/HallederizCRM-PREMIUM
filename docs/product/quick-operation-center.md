# Hızlı İşlem Merkezi - Final İş Akışı Spesifikasyonu

## 1. Amaç

Hızlı İşlem Merkezi, kullanıcının klasik fiş/tablo mantığıyla tek ekranda işlem yaptığı; sistemin ise arka planda CRM, satış, stok, depo, raf, fabrika, tedarik, tahsilat, teslimat, iade, belge, WhatsApp ve audit kayıtlarını doğru domain katmanlarına işlediği ana operasyon masasıdır.

Bu ekran ayrı ayrı menülere bölünmüş bir sihirbaz değildir. Tek sabit ekran olarak çalışır. Kullanıcı aynı cari alanı, aynı ürün satırları ve aynı sağ operasyon paneli üzerinden satış/sipariş, taslak, tahsilat, teslim ve iade işlemlerini yürütür.

Temel prensip:

- Kullanıcı basit bir fiş doldurduğunu hisseder.
- Sistem her satır için kaynak planı çıkarır.
- Sistem arka planda doğru workflow, stok, cari, belge, mesaj ve arşiv kayıtlarını üretir.
- Mükerrer kayıt, ikinci kez teslim, ikinci kez iade ve yanlış işlem tipiyle kayıt oluşturma engellenir.

## 2. Route

Hedef route:

```text
apps/web/app/(platform)/hizli-islem/page.tsx
```

Mevcut hızlı işlem route'u korunur. Alt ekranlara bölünmez. Tek ekran, farklı işlem bağlamlarıyla çalışır.

## 3. Kapsam

Bu ekranın kapsadığı işlem türleri:

- `offer`: Teklif oluşturma.
- `sale_order`: Satış/sipariş oluşturma.
- `draft`: Aynı form verisini taslak olarak kaydetme.
- `payment`: Ürün seçimi olmadan veya siparişe bağlı tahsilat kaydetme.
- `delivery`: Gerçekleşmiş satış/sipariş üzerinden ürün teslimi.
- `return`: Gerçekleşmiş satış/sipariş ve mümkünse teslim geçmişi üzerinden iade alma.

Bu ekranın kapsam dışı bıraktıkları:

- Onaya gönder akışı bu ekranda ana aksiyon olarak bulunmaz.
- Serbest iade oluşturulmaz; iade için gerçekleşmiş satış şarttır.
- Serbest teslim oluşturulmaz; teslim için gerçekleşmiş satış şarttır.
- Gerçekleşmiş satıştan çağrılan verilerle yeniden satış, taslak veya tahsilat oluşturulamaz.
- AI bu ekranda doğrudan kayıt değiştirmez; yalnızca öneri, taslak, açıklama veya operasyon etkisi üretir.

## 4. Ana UI Bölümleri

Sayfa tek sabit operasyon masasıdır:

1. Üst hızlı arama ve işlem bağlamı alanı
2. Son işlemler / taslaklar / çağrılabilir satışlar kısa alanı
3. Cari bilgileri paneli
4. Ürün/hizmet satır tablosu
5. Satır altı kaynak planı akordiyonu
6. Teslim/iade seçimi için satır durum katmanı
7. Sağ operasyon özeti paneli
8. Tahsilat alanı
9. Belge ve müşteri bilgilendirme alanı
10. Alt aksiyon butonları

## 5. Üst Alan ve Veri Çağırma Butonları

Cari alanı ve üst işlem alanında şu çağırma butonları bulunur:

- `Cari Seç`: Kayıtlı cariyi getirir.
- `Manuel Cari Gir`: Kayıtlı olmayan veya hızlı işlem yapılacak cari bilgisini elle girme modunu açar.
- `Taslaklardan Getir`: Daha önce kaydedilmiş hızlı işlem taslağını forma yükler.
- `Gerçekleşen Satışları Getir`: Seçili cariye ait satış/sipariş kayıtlarını listeler.
- `Satış Detayını Yükle`: Teslim veya iade için seçilen satışın satırlarını forma getirir.

`Gerçekleşen Satışları Getir` ile yüklenen veriler kilitli bağlam oluşturur. Bu bağlamda form artık yeni satış formu gibi davranmaz; yalnızca seçilen satışa bağlı teslim veya iade işlemi yapılabilir.

## 6. İşlem Bağlamları

Ekran modları ayrı sayfa değildir; aynı ekranın çalışma bağlamlarıdır.

### 6.1 Yeni satış/sipariş bağlamı

Kullanıcı cari ve ürün satırlarını doldurur. Satır bazında kaynak planı seçer. Sistem toplamları, stok/fabrika/tedarik etkisini ve tahsilat durumunu hesaplar.

Aktif olabilecek butonlar:

- `Satış Olarak Kaydet`
- `Taslaklara Kaydet`
- `Tahsilat Kaydet` yalnızca tahsilat alanı doluysa
- `Belge Hazırla`
- `Bilgilendirme Mesajı Hazırla`

Başarılı satış sonrası:

- `sale_orders` kaydı oluşur.
- `sale_order_lines` satırları oluşur.
- `order_source_plans` satır bazlı kaynak kararlarını taşır.
- Gerekirse `warehouse_orders` ve `warehouse_order_lines` oluşur.
- Gerekirse fabrika planı veya tedarik görevi oluşur.
- Tahsilat girildiyse `payment_receipts` ve allocation bağlantısı oluşur.
- Belge/WhatsApp taslağı hazırlanır.
- Audit ve entity timeline kaydı oluşur.
- Başarılı işlemden sonra kayıt butonu pasifleşir.

### 6.2 Taslak bağlamı

`Taslaklara Kaydet`, mevcut formun satışa dönüşmemiş halini saklar.

Taslakta saklanacak bilgiler:

- Cari bilgileri
- Manuel cari bilgileri varsa onlar
- Ürün satırları
- Miktar, birim, fiyat, iskonto, KDV
- Satır bazlı kaynak seçimi
- Depo, raf, fabrika, tedarikçi, split dağılımı
- Tahsilat alanı taslak değerleri
- Teslimat notları
- Açıklama, referans no ve belge notları
- Kullanıcı ve tarih bilgisi

Taslak yüklendiğinde form düzenlenebilir olur. Taslaktan yüklenen veri yeni satış gibi kaydedilebilir veya tekrar taslak olarak güncellenebilir. Ancak taslak, gerçekleşmiş satıştan yüklenen teslim/iade verisiyle karıştırılmaz.

### 6.3 Tahsilat bağlamı

Tahsilat için ürün seçmek zorunlu değildir. Cari kayıtlı cariden çağrılabilir veya manuel girilebilir.

Tahsilat alanında şu bilgiler bulunur:

- Tahsilat tutarı
- Ödeme yöntemi
- Tahsilat tarihi
- Referans no
- Açıklama
- Sipariş/fatura eşleştirme seçeneği
- Açık hesaba işleme seçeneği

Tahsilat kaydı başarılı olunca:

- `payment_receipts` oluşur.
- Sipariş/fatura seçildiyse `payment_allocations` oluşur.
- Bağımsız cari tahsilatı ise açık hesap hareketi oluşur.
- Cari ledger güncellenir.
- Tahsilat arşivine kayıt düşer.
- Belge/WhatsApp tahsilat mesajı hazırlanır.
- Buton ikinci kez çalışmaz.

### 6.4 Teslim bağlamı

Teslim işlemi yalnızca gerçekleşmiş satış/sipariş üzerinden yapılır.

Akış:

1. Cari seçilir.
2. `Gerçekleşen Satışları Getir` ile satışlar listelenir.
3. Kullanıcı teslim edilecek satış/siparişi seçer.
4. Satış satırları forma yüklenir.
5. Satırlar başlangıçta soluk/pasif görünür.
6. Daha önce tamamen teslim edilen satırlar pasif kalır ve `Teslim edildi` etiketi taşır.
7. Kısmen teslim edilen satırlarda kalan teslim edilebilir miktar gösterilir.
8. Teslim edilecek satır, `Teslime Seç` tiki/butonu ile aktifleşir.
9. Seçilen satırda teslim miktarı, teslim yöntemi ve teslim notu aktif olur.
10. `Ürün Teslim Et` butonu yalnızca seçilmiş ve teslim edilebilir satırlar varsa aktif olur.

Teslim yöntemleri:

- `store_pickup`: Mağazadan teslim
- `warehouse_pickup`: Depodan teslim
- `address_delivery`: Adrese teslim
- `factory_direct`: Fabrikadan doğrudan teslim
- `hybrid`: Parçalı/karma teslim

Teslim için kontrol edilecekler:

- Satış gerçekten var mı?
- Satış iptal edilmemiş mi?
- Satır daha önce tamamen teslim edilmiş mi?
- Hazırlanmış miktar yeterli mi?
- Merkez depo seçilmişse depo/raf hazırlık durumu uygun mu?
- Fabrika seçilmişse fabrika planı tamamlanmış mı?
- Split seçilmişse yalnızca hazır kısım teslim ediliyor mu?
- Ödeme eksikse tenant politikasına göre uyarı veya blokaj var mı?

Teslim kaydı başarılı olunca:

- `deliveries` kaydı oluşur.
- `delivery_lines` seçilmiş satırları taşır.
- `sale_order_lines.deliveredQuantity` güncellenir.
- Sipariş `deliveryStatus` kısmi veya teslim edildi durumuna güncellenir.
- Gerekli stok çıkış hareketleri yazılır.
- Depo hazırlık emri tamamlanır veya kısmi güncellenir.
- Belge/teslim fişi hazırlanır.
- Müşteriye teslim bilgilendirme mesajı hazırlanır.
- Audit ve entity timeline kaydı oluşur.
- Aynı satırlar ikinci kez teslim edilemez.

### 6.5 İade bağlamı

İade işlemi yalnızca gerçekleşmiş satış/sipariş üzerinden yapılır. Mümkünse teslim edilmiş satırlara bağlı çalışır.

Akış:

1. Cari seçilir.
2. `Gerçekleşen Satışları Getir` ile satışlar listelenir.
3. Kullanıcı iadeye konu satış/siparişi seçer.
4. Satış satırları forma yüklenir.
5. Satırlar başlangıçta soluk/pasif görünür.
6. Daha önce tamamen iade edilen satırlar pasif kalır ve `Tamamı iade edilmiş` etiketi taşır.
7. İade edilebilir kalan miktar gösterilir.
8. İade edilecek satır, `İadeye Seç` tiki/butonu ile aktifleşir.
9. Seçilen satırda iade miktarı, iade nedeni ve not alanı aktif olur.
10. `İade Al` butonu yalnızca seçilmiş ve iade edilebilir satırlar varsa aktif olur.

İade nedeni seçenekleri:

- `damaged`: Hasarlı ürün
- `wrong_product`: Yanlış ürün
- `quality`: Kalite problemi
- `customer_request`: Müşteri talebi
- `other`: Diğer

İade için kontrol edilecekler:

- Satış gerçekten var mı?
- Satır daha önce tamamen iade edilmiş mi?
- İade miktarı satırın iade edilebilir kalan miktarını aşıyor mu?
- İade edilen ürün teslim edilmiş mi veya teslimsiz iade tenant politikasında serbest mi?
- Stok geri girişi hangi depo/raf/fabrika/karantina alanına yapılacak?
- Finansal ters kayıt veya cari mahsup gerekiyor mu?
- İade tenant politikasına göre approval gerektiriyor mu?

İade kaydı başarılı olunca:

- `returns` kaydı oluşur.
- `return_lines` seçilmiş satırları taşır.
- Stok/finans etkisi hesaplanır.
- Gerekirse stok geri giriş hareketi oluşur.
- Gerekirse cari ledger ters hareketi oluşur.
- Gerekirse approval kaydı oluşur.
- Belge/iade fişi hazırlanır.
- Müşteriye iade bilgilendirme mesajı hazırlanır.
- Audit ve entity timeline kaydı oluşur.
- Aynı miktar ikinci kez iade edilemez.

## 7. Ürün Satır Tablosu

Ana tablo kolonları:

| Kolon | Amaç |
|---|---|
| No | Satır sıra numarası |
| Kod | Ürün kodu / barkod / alias |
| Ürün / Hizmet Adı | Ürün adı veya hizmet açıklaması |
| Miktar | Satış, teslim veya iade miktarı |
| Birim | Adet, paket, kutu, takım vb. |
| Kaynak | Satırın hangi kaynaktan karşılanacağı |
| Depo | Merkez/depo seçimi |
| Raf | Fiziksel raf/lokasyon bilgisi |
| Birim Fiyat | Satış fiyatı veya işlem fiyatı |
| İskonto % | Satır indirimi |
| KDV % | Vergi oranı |
| Toplam | Satır toplamı |
| Durum | Normal, pasif, seçili, teslim edildi, iade edildi, kalan var |
| Aksiyon | Satır seç, iadeye seç, teslime seç, sil |

Teslim ve iade bağlamında ürün satırları serbest düzenlenmez. Satır verileri satıştan gelir. Kullanıcı yalnızca seçilebilir kalan miktar ve işlem nedeni gibi izin verilen alanları düzenleyebilir.

## 8. Kaynak Seçenekleri ve Satır Altı Akordiyon

Her ürün satırında `Kaynak` alanı bulunur. Kaynak seçimi yalnızca satış/sipariş ve teklif bağlamında serbest yapılır. Teslim ve iade bağlamında kaynak bilgisi geçmiş satış/source plan üzerinden gelir.

Kaynak seçenekleri:

- `center_warehouse`: Merkez depo / şirket stoğu
- `factory`: Fabrika
- `supplier`: Tedarikçi
- `split`: Çoklu kaynak
- `auto`: Sistem önerisi

### 8.1 `center_warehouse`

Ürün merkez depodan veya tanımlı depolardan karşılanır.

Gerekli alanlar:

- Depo
- Raf/lokasyon
- Mevcut stok snapshot
- Rezerve edilecek miktar
- Hazırlanacak miktar

Arka etkiler:

- Stok snapshot alınır.
- Stok yeterliyse rezervasyon oluşur.
- Gerekirse depo hazırlık emri oluşur.
- Raf/lokasyon bilgisi hazırlık ve teslim satırına taşınır.

### 8.2 `factory`

Ürün fabrikadan karşılanır veya fabrika siparişine bağlanır.

Gerekli alanlar:

- Fabrika
- Fabrika stok snapshot
- Fabrikadan istenecek miktar
- Tahmini hazırlık/çıkış tarihi
- Fabrika referansı

Arka etkiler:

- Fabrika workflow impact oluşur.
- Gerekirse fabrika siparişi/planı oluşur.
- Teslim ancak fabrika hazır/çıkış bilgisi tamamlanınca yapılabilir.

### 8.3 `supplier`

Ürün dış tedarikçiden temin edilir.

Gerekli alanlar:

- Tedarikçi
- Talep miktarı
- Tahmini temin tarihi
- Maliyet veya not

Arka etkiler:

- Tedarik/procurement görevi oluşur.
- Stok rezervasyonu yerine tedarik bekleme etkisi oluşur.
- Teslim için tedarik tamamlanma şartı aranır.

### 8.4 `split`

Satır miktarı birden fazla kaynaktan karşılanır.

Örnek:

- 10 adet merkez depo
- 5 adet fabrika
- 3 adet tedarikçi

Kurallar:

- Split toplamı satır miktarına eşit olmalıdır.
- Her split parçası kendi kaynak kuralına göre workflow üretir.
- Teslim ve iade split parça geçmişini dikkate alır.

### 8.5 `auto`

Sistem stok, raf, fabrika snapshot ve tenant politikalarına göre kaynak önerisi üretir.

Kurallar:

- Sistem önerir, kullanıcı nihai seçimi görür.
- Auto sonucu `center_warehouse`, `factory`, `supplier` veya `split` planına dönüşür.
- Kullanıcı isterse öneriyi manuel değiştirebilir.

## 9. Sağ Operasyon Özeti Paneli

Sağ panel yalnızca toplam tutar paneli değildir. Operasyon etkisi panelidir.

Gösterilecek alanlar:

- Ara toplam
- İskonto toplamı
- KDV toplamı
- Genel toplam
- Tahsil edilen tutar
- Kalan tutar
- Satır sayısı
- Toplam miktar
- Depodan karşılanacak satır/miktar
- Fabrikadan karşılanacak satır/miktar
- Tedarik gerektiren satır/miktar
- Split kaynak uyarıları
- Stok yetersizliği uyarıları
- Raf/lokasyon eksikliği uyarıları
- Ödeme eksikliği uyarıları
- Teslim edilebilir miktar
- İade edilebilir miktar
- Oluşacak belge/mesaj taslakları

Sağ panel, kullanıcıya kayıt öncesi şu sorunun cevabını verir:

`Bu fişi kaydedersem sistem arka planda ne oluşturacak?`

## 10. Buton Davranışları

Ana butonlar:

- `Satış Olarak Kaydet`
- `Teklif Olarak Kaydet`
- `Taslaklara Kaydet`
- `Tahsilat Kaydet`
- `Ürün Teslim Et`
- `İade Al`
- `Belge Hazırla`
- `Bilgilendirme Mesajı Hazırla`
- `Temizle`

Kaldırılacak buton:

- `Onaya Gönder`

Onay gerekli işlemler backend policy tarafından otomatik belirlenir. Kullanıcı hızlı işlem masasında ayrıca `Onaya Gönder` butonu görmez. Policy gerekiyorsa sistem işlem sonucunda approval kaydı oluşturur veya kullanıcıya blokaj/uyarı gösterir.

Buton kilit kuralları:

- Satış başarılıysa satış butonu pasifleşir.
- Taslak başarılıysa taslak güncelleme dışında tekrar aynı payload ile kayıt engellenir.
- Tahsilat başarılıysa tahsilat butonu pasifleşir.
- Teslim başarılıysa aynı satırlar tekrar teslim edilemez.
- İade başarılıysa aynı miktar tekrar iade edilemez.
- Gerçekleşmiş satıştan yüklenen teslim bağlamında yalnızca `Ürün Teslim Et` çalışır.
- Gerçekleşmiş satıştan yüklenen iade bağlamında yalnızca `İade Al` çalışır.
- Teslim/iade bağlamında satış, teklif, taslak ve tahsilat butonları kilitlenir.

## 11. Müşteri Bilgilendirme Mesajları

Başarılı işlemden sonra sistem işlem tipine göre mesaj taslağı hazırlar. Tenant ayarına göre mesaj otomatik gönderilebilir veya kullanıcı onayına sunulabilir.

### 11.1 Sipariş mesajı

```text
Sayın {customer_name}, {order_no} numaralı siparişiniz {date} tarihinde oluşturulmuştur. Ürünler: {product_summary}. Toplam tutar: {grand_total}.
```

### 11.2 Tahsilat mesajı

```text
Sayın {customer_name}, {date} tarihinde {amount} tutarındaki tahsilatınız kayda alınmıştır. Referans no: {reference_no}.
```

### 11.3 Teslim mesajı

```text
Sayın {customer_name}, {order_no} numaralı siparişinize ait {product_summary} ürünleri {delivery_date} tarihinde teslim edilmiştir.
```

### 11.4 İade mesajı

```text
Sayın {customer_name}, {order_no} numaralı satışınıza ait {product_summary} için iade kaydınız oluşturulmuştur. İade no: {return_no}.
```

Mesaj kayıtları document/outbox/WhatsApp altyapısı ile ilişkilendirilir. Mesaj gönderimi auditlenir.

## 12. Arka Plan Kayıtları

Hızlı işlem ekranı tek formdur; fakat arka planda domain kayıtları ayrı kalır.

Oluşabilecek ana kayıtlar:

- `offers`
- `offer_lines`
- `sale_orders`
- `sale_order_lines`
- `order_source_plans`
- `stock_reservations`
- `stock_movements`
- `warehouse_orders`
- `warehouse_order_lines`
- `factory_orders`
- `factory_order_lines`
- `payment_receipts`
- `payment_allocations`
- `deliveries`
- `delivery_lines`
- `returns`
- `return_lines`
- `documents`
- `document_deliveries`
- `whatsapp_messages`
- `tasks`
- `workflow_instances`
- `approvals`
- `audit_events`
- `entity_timelines`

Hiçbir işlem tek tabloya sıkıştırılmaz. Ekranın sade olması domain ayrımını bozmaz.

## 13. Mükerrer Kayıt ve Güvenlik Kuralları

Zorunlu güvenlik kuralları:

- Her submit payload için idempotency key üretilir.
- Aynı payload ile ikinci kayıt engellenir.
- Başarılı işlem sonrası ilgili buton pasifleşir.
- Satıştan yüklenen veri, yeni satış/taslak/tahsilat olarak tekrar kaydedilemez.
- Teslim edilen miktar, sipariş satırının kalan teslim edilebilir miktarını aşamaz.
- İade edilen miktar, satırın kalan iade edilebilir miktarını aşamaz.
- Raf/depo/fabrika kaynak planı olmadan kaynak gerektiren satır finalize edilemez.
- Split kaynak toplamı satır miktarına eşit değilse kayıt yapılamaz.
- Stok yetersizliği varsa tenant politikasına göre blokaj veya uyarı uygulanır.
- Ödeme eksik teslim politikası tenant ayarına göre blokaj/uyarı/approval üretir.
- Kritik domain mutation'lar audit ve timeline kaydı üretmeden tamamlanmış sayılmaz.

## 14. Görsel Davranış Kuralları

Teslim/iade için satıştan çağrılan satırlar başlangıçta pasif ve soluk görünür.

Durumlar:

- `ghost`: Satır görünür ama işleme dahil değildir.
- `selectable`: Satır seçilebilir.
- `selected`: Satır işleme dahil edilmiştir.
- `locked_delivered`: Satır tamamen teslim edilmiştir, tekrar seçilemez.
- `locked_returned`: Satır tamamen iade edilmiştir, tekrar seçilemez.
- `partial_available`: Satırda kısmi kalan miktar vardır.
- `blocked`: Policy veya veri eksikliği nedeniyle işleme kapalıdır.

Seçilen satır normale döner, miktar ve neden/not alanları aktifleşir. Seçilmemiş satırlar yalnızca referans olarak görünür.

## 15. Kabul Kriterleri

Bu ekran tamamlanmış sayılmak için şu davranışları sağlamalıdır:

1. Tek sabit hızlı işlem masası olarak çalışır.
2. Satış, taslak, tahsilat, teslim ve iade aynı form iskeletini kullanır.
3. Ürün satırlarında kaynak, depo ve raf alanları bulunur.
4. Satır altı kaynak akordiyonu çalışır.
5. `center_warehouse`, `factory`, `supplier`, `split`, `auto` kaynakları desteklenir.
6. Satış kaydı source plan üretir.
7. Depo seçilen satırlar depo workflow etkisi üretir.
8. Fabrika seçilen satırlar fabrika workflow etkisi üretir.
9. Tedarikçi seçilen satırlar procurement/task etkisi üretir.
10. Split kaynak toplamı doğrulanır.
11. Taslak kaydı tüm satır ve kaynak bilgilerini saklar.
12. Tahsilat ürün seçmeden de kaydedilebilir.
13. Tahsilat sipariş/fatura/açık hesap allocation destekler.
14. Teslim için gerçekleşmiş satış şarttır.
15. İade için gerçekleşmiş satış şarttır.
16. Teslim/iade satırları satıştan yüklenir ve başlangıçta pasif/soluk görünür.
17. Satır seçilmeden teslim/iade yapılamaz.
18. Daha önce teslim edilen satır tekrar teslim edilemez.
19. Daha önce iade edilen miktar tekrar iade edilemez.
20. Gerçekleşmiş satıştan yüklenen teslim/iade bağlamında yanlış butonlar pasif olur.
21. Onaya gönder butonu ekrandan kaldırılır.
22. Policy gerekiyorsa approval backend tarafından otomatik oluşturulur.
23. Başarılı her işlem audit ve timeline kaydı üretir.
24. Başarılı her işlemden sonra ilgili buton pasifleşir.
25. Belge ve müşteri bilgilendirme mesajı taslakları işlem tipine göre hazırlanır.

## 16. Uygulama Notu

Bu doküman Hızlı İşlem Merkezi için nihai ürün ve iş akışı referansıdır. UI implementasyonu, domain servisleri, type tanımları ve testler bu dokümandaki davranışlara göre hizalanmalıdır.

Öncelik sırası:

1. Mevcut hızlı işlem ekranındaki `Onaya Gönder` aksiyonunu kaldır.
2. Tek ekran/tek masa yapısını koru.
3. Taslak kaydet ve taslaktan getir akışını ekle.
4. Gerçekleşmiş satış çağırma akışını ekle.
5. Teslim ve iade bağlamlarında satırları pasif/soluk yükle.
6. Satır seçimi yapılmadan teslim/iade butonlarını aktif etme.
7. Kaynak, depo, raf, fabrika, tedarik ve split planı alanlarını koru.
8. Sağ paneli operasyon etkisi paneli olarak genişlet.
9. Mükerrer kayıt/idempotency kilitlerini uygula.
10. Belge/WhatsApp/outbox/audit/timeline etkilerini bağla.
