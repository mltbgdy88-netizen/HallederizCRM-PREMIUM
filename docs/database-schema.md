# HallederizCRM-PREMIUM Database Schema Referansi

## 1. Amac ve Tasarim Ilkeleri
Bu dokuman, HallederizCRM-PREMIUM platformunun PostgreSQL uzerindeki kanonik veri modelini ust seviye olarak tanimlar. Amaç, tablo ailelerini, sorumluluklarini ve aralarindaki iliski mantigini urun kararlarina uygun bicimde sabitlemektir.

Temel ilkeler:
1. PostgreSQL kanonik veri kaynagidir.
2. Tum is alanlari tenant baglaminda izole edilir.
3. Yazma etkisi olan kritik domain aksiyonlari audit/timeline ile izlenir.
4. Entegrasyon ve AI tarafinda gelen/verilen veri, domain tablolariyla kontrollu sekilde baglanir.

## 2. Platform Tablolari

```text
tenants
tenant_modules
users
roles
permissions
user_roles
approval_policies
```

### Aciklama
- `tenants`: Her musteri organizasyonunun temel kimlik ve calisma baglami.
- `tenant_modules`: Tenant bazli acik modul, paket ve konfigurasyon durumu.
- `users`: Platform kullanicilari, kimlik, durum ve temel profil alanlari.
- `roles`: Tenant bagimli rol tanimlari.
- `permissions`: Moduler izin anahtarlari.
- `user_roles`: Kullanici-rol iliskisi (coktan coga).
- `approval_policies`: Hangi aksiyonun hangi seviyede onay gerektirdigi.

## 3. Cari Tablolari

```text
customers
customer_contacts
customer_addresses
customer_accounts
customer_ledgers
customer_pricing_profiles
```

### Aciklama
- `customers`: Cari kart ana kaydi.
- `customer_contacts`: Yetkili kisiler, iletisim ve gorev baglami.
- `customer_addresses`: Fatura/teslimat ve operasyon adresleri.
- `customer_accounts`: Cari finansal hesap ust bilgileri.
- `customer_ledgers`: Cari hareket ve bakiye izleri.
- `customer_pricing_profiles`: Cariye ozel fiyatlandirma kurallari.

## 4. Urun ve Stok Tablolari

```text
brands
factories
collections
products
product_barcode_aliases
product_category_values
warehouses
warehouse_stocks
product_locations
stock_movements
stock_reservations
```

### Aciklama
- `brands`, `collections`: Katalog yapisinin ticari siniflandirmasi.
- `factories`: Fabrika kayitlari ve urun tedarik baglami.
- `products`: Urun ana karti, varyant ve satis kimligi.
- `product_barcode_aliases`: Urun icin barkod/alias/QR kimlik havuzu.
- `product_category_values`: Esnek kategori alan degerleri.
- `warehouses`: Depo tanimlari.
- `warehouse_stocks`: Depo bazli stok bakiyesi.
- `product_locations`: Raf/bolge gibi fiziksel lokasyon baglami.
- `stock_movements`: Giris-cikis-transfer hareketleri.
- `stock_reservations`: Siparis veya operasyon bagimli stok rezervleri.

## 5. Doviz ve Fiyatlandirma Tablolari

```text
exchange_rates
exchange_rate_policies
price_slot_configs
category_slot_configs
product_price_tiers
order_price_snapshots
```

### Aciklama
- `exchange_rates`: Kur degerlerinin tarihsel kaydi.
- `exchange_rate_policies`: Kur secimi (manuel/API), yuvarlama ve gecerlilik kurallari.
- `price_slot_configs`: Esnek fiyat slot tanimlari.
- `category_slot_configs`: Esnek kategori slot tanimlari.
- `product_price_tiers`: Urun bazli fiyat seviyeleri.
- `order_price_snapshots`: Siparis anindaki fiyat/kur goruntusu (immutable snapshot).

## 6. Ticari Akis Tablolari

```text
offers
offer_lines
offer_followups
sale_orders
sale_order_lines
order_source_plans
payment_receipts
payment_allocations
payment_reversals
warehouse_orders
warehouse_order_lines
deliveries
delivery_lines
invoices
invoice_lines
returns
return_lines
```

### Aciklama
- `offers`, `offer_lines`, `offer_followups`: Teklif olusumu, satir detayi ve takip sureci.
- `sale_orders`, `sale_order_lines`: Satis siparisi ve urun satirlari.
- `order_source_plans`: Siparisin hangi kaynaktan karsilanacagini gosteren plan.
- `payment_receipts`: Tahsilat giris kayitlari.
- `payment_allocations`: Tahsilatin birden fazla belge/borca dagitimi.
- `payment_reversals`: Yanlis veya iptal tahsilat duzeltmeleri.
- `warehouse_orders`, `warehouse_order_lines`: Depo operasyon emirleri.
- `deliveries`, `delivery_lines`: Teslimat planlari ve kalemleri.
- `invoices`, `invoice_lines`: Faturalasma kayitlari.
- `returns`, `return_lines`: Iade sureci ve iade kalemleri.

## 7. Operasyon Tablolari

```text
workflow_instances
workflow_steps
tasks
task_comments
approvals
alerts
```

### Aciklama
- `workflow_instances`: Bir surecin canli ornek kaydi.
- `workflow_steps`: Surec icindeki adimlar, durum ve gecisler.
- `tasks`: Kullanicilara veya role atanan operasyonel gorevler.
- `task_comments`: Gorev icindeki is birligi ve karar notlari.
- `approvals`: Onay bekleyen domain aksiyonlari.
- `alerts`: Istisna, gecikme ve operasyonel uyari kayitlari.

## 8. WhatsApp Tablolari

```text
whatsapp_contacts
whatsapp_conversations
whatsapp_messages
whatsapp_templates
whatsapp_action_requests
```

### Aciklama
- `whatsapp_contacts`: Numara-musteri/kullanici eslesmeleri.
- `whatsapp_conversations`: Konusma oturumu ve kanal baglami.
- `whatsapp_messages`: Mesaj icerigi, yonu, durum ve teslim metrikleri.
- `whatsapp_templates`: Onayli veya kurumsal mesaj sablonlari.
- `whatsapp_action_requests`: Mesajdan dogan domain aksiyon talebi (approval ile bagli).

## 9. AI Tablolari

```text
ai_sessions
ai_messages
ai_action_proposals
ai_insights
```

### Aciklama
- `ai_sessions`: AI etkileşim oturumu ve baglam kimligi.
- `ai_messages`: Kullanici/AI mesaj gecmisi.
- `ai_action_proposals`: AI tarafindan onerilen domain aksiyonlari.
- `ai_insights`: Ozet, risk, trend ve karar destek ciktilari.

## 10. Belge Tablolari

```text
documents
document_deliveries
```

### Aciklama
- `documents`: Uretilen belge metadata'si, versiyon ve bagli domain kaydi.
- `document_deliveries`: Belgenin hangi kanalla, kime ve ne zaman iletildigi.

## 11. Entegrasyon Tablolari

```text
erp_connections
erp_mappings
erp_sync_logs
factory_integrations
factory_stock_snapshots
factory_stock_items
factory_orders
factory_order_lines
integration_logs
```

### Aciklama
- `erp_connections`: ERP baglanti ayarlari ve kimlik bilgisi referanslari.
- `erp_mappings`: Domain alanlarinin dis sistem alanlariyla map edilmesi.
- `erp_sync_logs`: Senkronizasyon denemeleri, hata kodlari ve sonuc durumlari.
- `factory_integrations`: Fabrika baglanti konfigurasyonlari.
- `factory_stock_snapshots`: Fabrikadan gelen stok ozet goruntuleri.
- `factory_stock_items`: Snapshot icindeki urun seviyesinde satirlar.
- `factory_orders`, `factory_order_lines`: Fabrikaya acilan is/siparis kayitlari.
- `integration_logs`: ERP/fabrika/kanal genelinde butunlesik entegrasyon olay gunlugu.

## 12. Audit Tablolari

```text
audit_events
entity_timelines
```

### Aciklama
- `audit_events`: Kim, ne zaman, hangi aksiyonu gerceklestirdi bilgisinin degistirilemez izi.
- `entity_timelines`: Bir varlik etrafindaki olaylarin kronolojik birlesik akisi.

## 13. Kritik Is Kararlari ve Semaya Etkileri
Bu platformda alinmis kritik kararlar semayi dogrudan etkiler:

1. 6 esnek fiyat slotu
- `price_slot_configs` + `product_price_tiers` birlikte kullanilir.
- Slot yapisi hard-code degil, tenant bazli konfigure edilir.

2. 4 esnek kategori alani
- `category_slot_configs` ve `product_category_values` ile dinamik alan modeli uygulanir.

3. Barkod + alias + QR
- `product_barcode_aliases` urun kimliklendirmede coklu anahtar yapisini tasir.

4. Depo bazli stok ve raf
- `warehouse_stocks`, `product_locations`, `stock_movements` birlikte fiziksel ve mantiksal stok takibi saglar.

5. Kur politikasi
- `exchange_rates` yalnizca degeri; `exchange_rate_policies` karar mekanizmasini tasir.

6. Payment allocation
- Tahsilat dagitimi `payment_allocations` ile belge ve borc bazli takip edilir.

7. Approval engine
- Mutation onayi `approval_policies` + `approvals` ile uygulanir.

8. AI proposal engine
- AI'nin karar destek onerileri `ai_action_proposals` uzerinden kayitlanir ve onayla iliskilendirilir.

## 14. Sonuc
Bu sema referansi, detayli DDL dosyalari olusmadan once urun, mimari ve operasyon ekiplerinin ortak veri sozlesmesini temsil eder. Sonraki asamada tablo alanlari, index stratejileri, unique kurallari ve migration planlari bu referansa bagli olarak detaylandirilir.

