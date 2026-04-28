# HallederizCRM-PREMIUM Module Map

## 1. Amac
Bu dokuman, platformdaki ana menu yapisini, sayfa-modul iliskilerini ve kritik navigasyon akislarini resmi olarak tanimlar. Hedef; kullanici deneyimi, domain sinirlari ve teknik implementasyon arasinda tutarli bir sayfa haritasi olusturmaktir.

## 2. Ana Menu Listesi
Ana menu yapisi asagidaki sirayla korunur:

1. Gorev Merkezi
2. Cariler
3. Stok
4. Teklifler
5. Siparisler
6. Tahsilatlar
7. Depo
8. Teslimatlar
9. Faturalar
10. Iadeler
11. Fabrikalar
12. ERP
13. WhatsApp
14. AI
15. Belgeler
16. Raporlar
17. Kullanicilar
18. Ayarlar

## 3. Sayfa Baglantilari ve Modul Iliskisi

| Ana Menu | Temel Sayfalar | Iliskili Modul | Ana Kayitlar |
|---|---|---|---|
| Gorev Merkezi | `/`, `/tasks`, `/approvals` | Operasyon motoru | `tasks`, `approvals`, `alerts` |
| Cariler | `/cariler`, `/cariler/:id` | Cekirdek CRM | `customers`, `customer_accounts`, `customer_ledgers` |
| Stok | `/stok`, `/stok/urunler`, `/stok/depolar` | Urun ve stok | `products`, `warehouse_stocks`, `stock_movements` |
| Teklifler | `/teklifler`, `/teklifler/:id` | Ticari akis | `offers`, `offer_lines`, `offer_followups` |
| Siparisler | `/siparisler`, `/siparisler/:id` | Ticari akis + operasyon | `sale_orders`, `sale_order_lines`, `order_source_plans` |
| Tahsilatlar | `/tahsilatlar`, `/tahsilatlar/:id` | Finansal akis | `payment_receipts`, `payment_allocations`, `payment_reversals` |
| Depo | `/depo/emirler`, `/depo/hareketler` | Depo operasyonu | `warehouse_orders`, `warehouse_order_lines`, `product_locations` |
| Teslimatlar | `/teslimatlar`, `/teslimatlar/:id` | Lojistik akis | `deliveries`, `delivery_lines` |
| Faturalar | `/faturalar`, `/faturalar/:id` | Finansal akis | `invoices`, `invoice_lines` |
| Iadeler | `/iadeler`, `/iadeler/:id` | Satis sonrasi surec | `returns`, `return_lines` |
| Fabrikalar | `/fabrikalar`, `/fabrikalar/siparisler` | Fabrika entegrasyonu | `factories`, `factory_orders`, `factory_order_lines` |
| ERP | `/erp`, `/erp/senkronizasyon` | ERP entegrasyonu | `erp_connections`, `erp_sync_logs`, `erp_mappings` |
| WhatsApp | `/whatsapp`, `/whatsapp/konusmalar` | Kanal ve otomasyon | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_action_requests` |
| AI | `/ai`, `/ai/proposals`, `/ai/insights` | AI katmani | `ai_sessions`, `ai_action_proposals`, `ai_insights` |
| Belgeler | `/belgeler`, `/belgeler/:id` | Belge ve cikti sistemi | `documents`, `document_deliveries` |
| Raporlar | `/raporlar` | Analitik katman | Toplanmis ve hesaplanmis metrikler |
| Kullanicilar | `/kullanicilar`, `/kullanicilar/roller` | Platform core | `users`, `roles`, `permissions`, `user_roles` |
| Ayarlar | `/ayarlar`, `/ayarlar/moduller` | Platform + tenant ayarlari | `tenants`, `tenant_modules`, `approval_policies` |

## 4. Dashboard Kartlari ve Modul Yonlendirmeleri
Gorev Merkezi kartlari, sadece bilgi gostermek icin degil aksiyon baslatmak icin tasarlanir.

### 4.1 Sistem kartlari
1. Onay Bekleyenler
- Hedef sayfa: `/approvals`
- Iliskili modul: Approval engine

2. Geciken Gorevler
- Hedef sayfa: `/tasks`
- Iliskili modul: Task engine

3. Senkronizasyon Uyarilari
- Hedef sayfa: `/erp/senkronizasyon` veya `/fabrikalar`
- Iliskili modul: Entegrasyonlar

### 4.2 AI kartlari
1. AI Oneri Kuyrugu
- Hedef sayfa: `/ai/proposals`
- Iliskili modul: AI + approval

2. AI Icgoruler
- Hedef sayfa: `/ai/insights`
- Iliskili modul: AI analytics

Kart etkileşim modeli:
- Kart secimi -> modal acilir
- Modal icinde kayit ozeti + aksiyon butonlari yer alir
- Kullanici ilgili domain sayfasina tek tikla gider

## 5. Kritik Sayfa Akislari

### 5.1 Gorev Merkezi kartlari -> ilgili moduller
```text
Gorev Merkezi Karti -> Modal -> Ilgili Kayit -> Ilgili Modul Sayfasi
```

### 5.2 Cari listesi -> cari karti
```text
/cariler -> Cari Satiri -> /cariler/:id
```

### 5.3 Stok listesi -> urun karti modali
```text
/stok/urunler -> Urun Satiri -> Urun Karti Modali -> (Opsiyonel) /stok/urunler/:id
```

### 5.4 Teklif -> siparise donusum
```text
/teklifler/:id -> "Siparise Donustur" -> /siparisler/:id (yeni kayit)
```

### 5.5 Siparis -> tahsilat / depo / fabrika / teslim / belge
```text
/siparisler/:id
  -> Tahsilat Akisi (/tahsilatlar)
  -> Depo Emri (/depo/emirler)
  -> Fabrika Siparisi (/fabrikalar/siparisler)
  -> Teslimat (/teslimatlar)
  -> Belge Uretimi (/belgeler)
```

### 5.6 WhatsApp -> cari / siparis / belge / tahsilat
```text
/whatsapp/konusmalar/:id
  -> Cari Kaydi (/cariler/:id)
  -> Siparis Kaydi (/siparisler/:id)
  -> Belge Kaydi (/belgeler/:id)
  -> Tahsilat Kaydi (/tahsilatlar/:id)
```

### 5.7 AI -> proposal -> approval -> domain action
```text
/ai/proposals
  -> Proposal Detayi
  -> Approval Kaydi
  -> Server-side Domain Action
  -> Audit + Entity Timeline
```

## 6. Modul Gecis Mantigi
Moduller arasi gecisler bagimsiz sayfalar gibi degil, tek bir operasyon zinciri gibi ele alinir:

1. Cari -> Teklif -> Siparis -> Tahsilat
2. Siparis -> Depo -> Teslimat -> Fatura
3. WhatsApp ve AI -> Domain aksiyonu icin oneri/istek katmani
4. Ayarlar -> Tum modullerin davranis parametrelerini etkileyen governance katmani

Bu harita, hem tasarim sisteminin hem de route implementasyonunun referans cizelgesidir.

