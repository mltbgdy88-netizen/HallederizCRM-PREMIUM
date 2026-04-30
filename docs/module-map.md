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
| Gorev Merkezi | `/`, `/gorevler`, `/onaylar` | Operasyon motoru | `tasks`, `approvals`, `alerts` |
| Cariler | `/cariler`, `/cariler/:id` | Cekirdek CRM | `customers`, `customer_accounts`, `customer_ledgers` |
| Stok | `/stok`, `/stok/urunler`, `/stok/depolar` | Urun ve stok | `products`, `warehouse_stocks`, `stock_movements` |
| Teklifler | `/teklifler`, `/teklifler/:id` | Ticari akis | `offers`, `offer_lines`, `offer_followups` |
| Siparisler | `/siparisler`, `/siparisler/:id` | Ticari akis + operasyon | `sale_orders`, `sale_order_lines`, `order_source_plans` |
| Tahsilatlar | `/tahsilatlar`, `/tahsilatlar/:id` | Finansal akis | `payment_receipts`, `payment_allocations`, `payment_reversals` |
| Depo | `/depo`, `/depo/emirler/:warehouseOrderId` | Depo operasyonu | `warehouse_orders`, `warehouse_order_lines`, `product_locations` |
| Teslimatlar | `/teslimatlar`, `/teslimatlar/:id` | Lojistik akis | `deliveries`, `delivery_lines` |
| Faturalar | `/faturalar`, `/faturalar/:id` | Finansal akis | `invoices`, `invoice_lines` |
| Iadeler | `/iadeler`, `/iadeler/:id` | Satis sonrasi surec | `returns`, `return_lines` |
| Fabrikalar | `/fabrikalar/stoklar`, `/fabrikalar/siparisler` | Fabrika entegrasyonu | `factories`, `factory_orders`, `factory_order_lines` |
| ERP | `/erp` | ERP entegrasyonu | `erp_connections`, `erp_sync_logs`, `erp_mappings` |
| WhatsApp | `/whatsapp` | Kanal ve otomasyon | `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_action_requests` |
| AI | `/ai`, `/ai/onaylar`, `/ai/icgoruler` | Local-first AI katmani | `ai_sessions`, `ai_action_proposals`, `ai_insights` |
| Belgeler | `/belgeler`, `/belgeler/:id` | Belge ve cikti sistemi | `documents`, `document_deliveries` |
| Raporlar | `/raporlar` | Analitik katman | Toplanmis ve hesaplanmis metrikler |
| Kullanicilar | `/kullanicilar`, `/kullanicilar/roller` | Platform core | `users`, `roles`, `permissions`, `user_roles` |
| Ayarlar | `/ayarlar`, `/ayarlar/kullanim-hazirligi`, `/ayarlar/veri-yukleme`, `/ayarlar/staging-kontrol` | Platform + tenant ayarlari | `tenants`, `tenant_modules`, `approval_policies` |

## 4. Dashboard Kartlari ve Modul Yonlendirmeleri
Gorev Merkezi kartlari, sadece bilgi gostermek icin degil aksiyon baslatmak icin tasarlanir.

### 4.1 Sistem kartlari
1. Onay Bekleyenler
- Hedef sayfa: `/onaylar`
- Iliskili modul: Approval engine

2. Geciken Gorevler
- Hedef sayfa: `/gorevler`
- Iliskili modul: Task engine

3. Senkronizasyon Uyarilari
- Hedef sayfa: `/erp` veya `/fabrikalar/stoklar`
- Iliskili modul: Entegrasyonlar

### 4.2 AI kartlari
1. AI Oneri Kuyrugu
- Hedef sayfa: `/ai/onaylar`
- Iliskili modul: AI + approval

2. AI Icgoruler
- Hedef sayfa: `/ai/icgoruler`
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
/whatsapp (konusma secimi)
  -> Cari Kaydi (/cariler/:id)
  -> Siparis Kaydi (/siparisler/:id)
  -> Belge Kaydi (/belgeler/:id)
  -> Tahsilat Kaydi (/tahsilatlar/:id)
```

### 5.7 AI -> proposal -> approval -> domain action
```text
/ai/onaylar
  -> Proposal Detayi
  -> Approval Kaydi
  -> Server-side Domain Action
  -> Audit + Entity Timeline
```

## 7. Kullanici Erisim Karari
- Web uygulama (`/login` sonrasi tum cockpit ekranlari) ic personel rollerine yoneliktir.
- Ayrik bir dis bayi/musteri web portal route'u bu repoda yoktur.
- Dis kanal erisimi agirlikla WhatsApp ve belge paylasim akislari uzerinden saglanir.

## 6. Modul Gecis Mantigi
Moduller arasi gecisler bagimsiz sayfalar gibi degil, tek bir operasyon zinciri gibi ele alinir:

1. Cari -> Teklif -> Siparis -> Tahsilat
2. Siparis -> Depo -> Teslimat -> Fatura
3. WhatsApp ve AI -> Domain aksiyonu icin oneri/istek katmani
4. Ayarlar -> Tum modullerin davranis parametrelerini etkileyen governance katmani

Bu harita, hem tasarim sisteminin hem de route implementasyonunun referans cizelgesidir.


## Route Name Alignment (2026-04-29)
- `Tasks` canonical route: `/gorevler` (legacy docs alias: `/tasks`)
- `Approvals` canonical route: `/onaylar` (legacy docs alias: `/approvals`)
- `AI approvals` canonical route: `/ai/onaylar` (legacy docs alias: `/ai/proposals`)
- `AI insights` canonical route: `/ai/icgoruler` (legacy docs alias: `/ai/insights`)
- `Usage readiness` canonical route: `/ayarlar/kullanim-hazirligi` (legacy alias: `/ayarlar/pilot-hazirlik`)
- `Data loading` canonical route: `/ayarlar/veri-yukleme` (legacy alias: `/ayarlar/pilot-veri-yukleme`)
- `Staging validation` canonical route: `/ayarlar/staging-kontrol`
