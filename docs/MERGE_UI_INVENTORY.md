# UI Birleştirme Envanteri

**Otomatik üretim:** `node scripts/merge/list-merge-inventory.mjs` · **Tarih:** 2026-05-27

Kaynak UI: `hallederizcrm final` (read-only) → sandbox: `xxxhallederizcrm/apps/web`.

Doğrulama: `node scripts/merge/audit-reference-routes.mjs` (route eşleşmesi).

---

## Özet

| Metrik | Sayı |
|--------|------|
| **Final birleştirme route (A)** | **81** |
| Ana / liste / hub | 39 |
| Katman (`/katman/*`) | 21 |
| Detay (`/detay`) | 12 |
| Yeni / hub (`/yeni`) | 8 |
| Alt dashboard | 1 |
| **Taşınma — gerçekleşen** | **81** |
| Taşınma — kısmi | 0 |
| Taşınma — gerçekleşmeyen | 0 |
| Sandbox ekstra route (Final 81 dışı) | 94 (53 statik, 41 dinamik) |
| Tasarım paketi route/katman (B) | 53 |

**Durum etiketleri**

- **gerçekleşen:** Sandbox’ta route var; Final referans UI bileşeni bağlı (veya bilinçli alias).
- **kısmi:** Route var; farklı React bileşeni.
- **gerçekleşmeyen:** Sandbox’ta karşılık route yok.

---

## Bilinçli birleştirme farkları

| Sandbox route | Not |
|---------------|-----|
| `/dashboard` | Final gösterge paneli `/dashboard` köküne alındı (`DashboardGostergePaneliPage`) |
| `/hizli-islem` | Hızlı Satış masası ana yüzey (`HizliSatisMasasiPage`) |
| `/ai` | Yapay Zeka hub `/ai` (`AiOperatorHubPage`) |
| `/ai/operator-hub` | → `/ai` redirect |

---

## A — Final envanter (sıralı)

| # | Final route | Sandbox route | Tür | Bileşen | Durum | Not |
|---|-------------|---------------|-----|---------|--------|-----|
| 1 | `/ai/icgoruler` | `/ai/icgoruler` | ana | `AiIcgorulerPage` | **gerçekleşen** |  |
| 2 | `/ai/operator-hub` | `/ai/operator-hub` | ana | `AiOperatorHubPage` | **gerçekleşen** | → `/ai` redirect |
| 3 | `/ana-sayfa` | `/ana-sayfa` | ana | `AnaSayfaEmeraldGoldPage` | **gerçekleşen** |  |
| 4 | `/arsiv` | `/archive` | ana | `ArsivOperasyonMerkeziPage` | **gerçekleşen** |  |
| 5 | `/ayarlar` | `/ayarlar` | ana | `AyarlarHubPage` | **gerçekleşen** |  |
| 6 | `/belgeler` | `/belgeler` | ana | `BelgelerOperasyonPage` | **gerçekleşen** |  |
| 7 | `/belgeler/detay` | `/belgeler/detay` | detay | `BelgelerDetayPage` | **gerçekleşen** |  |
| 8 | `/belgeler/yeni` | `/belgeler/yeni` | yeni/hub | `BelgelerYeniFormPage` | **gerçekleşen** |  |
| 9 | `/cariler` | `/cariler` | ana | `CarilerOperasyonPage` | **gerçekleşen** |  |
| 10 | `/cariler/detay` | `/cariler/detay` | detay | `CarilerDetayMasasiPage` | **gerçekleşen** |  |
| 11 | `/cariler/katman/finans` | `/cariler/katman/finans` | katman | `CarilerKatmanFinansPage` | **gerçekleşen** |  |
| 12 | `/cariler/katman/iletisim` | `/cariler/katman/iletisim` | katman | `CarilerKatmanIletisimPage` | **gerçekleşen** |  |
| 13 | `/cariler/katman/ozet` | `/cariler/katman/ozet` | katman | `CarilerKatmanOzetPage` | **gerçekleşen** |  |
| 14 | `/cariler/katman/siparisler` | `/cariler/katman/siparisler` | katman | `CarilerKatmanSiparislerPage` | **gerçekleşen** |  |
| 15 | `/cariler/katman/tahsilatlar` | `/cariler/katman/tahsilatlar` | katman | `CarilerKatmanTahsilatlarPage` | **gerçekleşen** |  |
| 16 | `/cariler/katman/teklifler` | `/cariler/katman/teklifler` | katman | `CarilerKatmanTekliflerPage` | **gerçekleşen** |  |
| 17 | `/cariler/katman/timeline` | `/cariler/katman/timeline` | katman | `CarilerKatmanTimelinePage` | **gerçekleşen** |  |
| 18 | `/cariler/yeni` | `/cariler/yeni` | yeni/hub | `CarilerYeniFormPage` | **gerçekleşen** |  |
| 19 | `/dashboard` | `/dashboard` | ana | `DashboardReferencePage` | **gerçekleşen** | Final gösterge paneli `/dashboard` köküne alındı (`DashboardGostergePaneliPage`) |
| 20 | `/dashboard/gosterge-paneli` | `/dashboard/gosterge-paneli` | alt-dashboard | `DashboardGostergePaneliPage` | **gerçekleşen** | alias/redirect |
| 21 | `/demo` | `/demo-mode` | ana | `DemoModeStatePage` | **gerçekleşen** |  |
| 22 | `/depo` | `/depo` | ana | `DepoHazirlikPage` | **gerçekleşen** |  |
| 23 | `/depo/detay` | `/depo/detay` | detay | `DepoFisDetayPage` | **gerçekleşen** |  |
| 24 | `/empty` | `/live-empty` | ana | `LiveEmptyStatePage` | **gerçekleşen** |  |
| 25 | `/erp` | `/erp` | ana | `ErpEntegrasyonPage` | **gerçekleşen** |  |
| 26 | `/fabrikalar/siparis` | `/fabrikalar/siparis` | ana | `FabrikalarSiparisOperasyonPage` | **gerçekleşen** |  |
| 27 | `/fabrikalar/siparis/detay` | `/fabrikalar/siparis/detay` | detay | `FabrikalarSiparisDetayPage` | **gerçekleşen** |  |
| 28 | `/fabrikalar/stok` | `/fabrikalar/stok` | ana | `FabrikalarStokOperasyonPage` | **gerçekleşen** |  |
| 29 | `/faturalar` | `/faturalar` | ana | `FaturalarOperasyonPage` | **gerçekleşen** |  |
| 30 | `/faturalar/detay` | `/faturalar/detay` | detay | `FaturalarDetayMasasiPage` | **gerçekleşen** |  |
| 31 | `/faturalar/yeni` | `/faturalar/yeni` | yeni/hub | `FaturalarYeniFormPage` | **gerçekleşen** |  |
| 32 | `/gelen-kutu` | `/gelen-kutu` | ana | `GelenKutuOperasyonPaneliPage` | **gerçekleşen** |  |
| 33 | `/gelen-kutu/konusma` | `/gelen-kutu/konusma` | ana | `GelenKutuKonusmaDetayPage` | **gerçekleşen** |  |
| 34 | `/gelen-kutu/uc-panel` | `/gelen-kutu/uc-panel` | ana | `GelenKutuUcPanelPage` | **gerçekleşen** |  |
| 35 | `/gorevler` | `/gorevler` | ana | `GorevlerOperasyonPage` | **gerçekleşen** |  |
| 36 | `/gorevler/detay` | `/gorevler/detay` | detay | `GorevlerDetayPage` | **gerçekleşen** |  |
| 37 | `/hizli-islem` | `/hizli-islem` | ana | `HizliIslemMerkeziPage` | **gerçekleşen** | Hızlı Satış masası ana yüzey (`HizliSatisMasasiPage`) |
| 38 | `/hizli-islem/satis-masasi` | `/hizli-islem/satis-masasi` | ana | `HizliIslemSatisMasasiPage` | **gerçekleşen** | alias/redirect |
| 39 | `/hizli-satis` | `/hizli-satis` | ana | `HizliSatisMasasiPage` | **gerçekleşen** | alias/redirect |
| 40 | `/iadeler` | `/iadeler` | ana | `IadelerOperasyonPage` | **gerçekleşen** |  |
| 41 | `/iadeler/detay` | `/iadeler/detay` | detay | `IadelerDetayMasasiPage` | **gerçekleşen** |  |
| 42 | `/iadeler/yeni` | `/iadeler/yeni` | yeni/hub | `IadelerYeniFormPage` | **gerçekleşen** |  |
| 43 | `/kullanicilar` | `/kullanicilar` | ana | `KullanicilarOperasyonPage` | **gerçekleşen** |  |
| 44 | `/kullanicilar/roller` | `/kullanicilar/roller` | ana | `KullanicilarRollerMatrisPage` | **gerçekleşen** |  |
| 45 | `/login` | `/login` | ana | `LoginSplitPage` | **gerçekleşen** |  |
| 46 | `/offline` | `/offline-api` | ana | `OfflineApiStatePage` | **gerçekleşen** |  |
| 47 | `/onaylar` | `/onaylar` | ana | `OnaylarKomutMasasiPage` | **gerçekleşen** |  |
| 48 | `/onaylar/detay` | `/onaylar/detay` | detay | `OnaylarDetayKararPage` | **gerçekleşen** |  |
| 49 | `/onaylar/kurallar` | `/onaylar/kurallar` | ana | `OnaylarKurallarMatrisPage` | **gerçekleşen** |  |
| 50 | `/raporlar` | `/raporlar` | ana | `RaporOperasyonMerkeziPage` | **gerçekleşen** |  |
| 51 | `/siparisler` | `/siparisler` | ana | `SiparislerOperasyonPage` | **gerçekleşen** |  |
| 52 | `/siparisler/detay` | `/siparisler/detay` | detay | `SiparislerDetayMasasiPage` | **gerçekleşen** |  |
| 53 | `/siparisler/katman/depo-stok` | `/siparisler/katman/depo-stok` | katman | `SiparislerKatmanDepoStokPage` | **gerçekleşen** |  |
| 54 | `/siparisler/katman/fatura` | `/siparisler/katman/fatura` | katman | `SiparislerKatmanFaturaPage` | **gerçekleşen** |  |
| 55 | `/siparisler/katman/iade` | `/siparisler/katman/iade` | katman | `SiparislerKatmanIadePage` | **gerçekleşen** |  |
| 56 | `/siparisler/katman/odeme` | `/siparisler/katman/odeme` | katman | `SiparislerKatmanOdemePage` | **gerçekleşen** |  |
| 57 | `/siparisler/katman/ozet` | `/siparisler/katman/ozet` | katman | `SiparislerKatmanOzetPage` | **gerçekleşen** |  |
| 58 | `/siparisler/katman/satirlar` | `/siparisler/katman/satirlar` | katman | `SiparislerKatmanSatirlarPage` | **gerçekleşen** |  |
| 59 | `/siparisler/katman/teslimat` | `/siparisler/katman/teslimat` | katman | `SiparislerKatmanTeslimatPage` | **gerçekleşen** |  |
| 60 | `/siparisler/katman/timeline` | `/siparisler/katman/timeline` | katman | `SiparislerKatmanTimelinePage` | **gerçekleşen** |  |
| 61 | `/siparisler/yeni` | `/siparisler/yeni` | yeni/hub | `SiparislerYeniHubPage` | **gerçekleşen** |  |
| 62 | `/stok` | `/stok` | ana | `StokOperasyonPage` | **gerçekleşen** |  |
| 63 | `/tahsilatlar` | `/tahsilatlar` | ana | `TahsilatlarOperasyonPage` | **gerçekleşen** |  |
| 64 | `/tahsilatlar/detay` | `/tahsilatlar/detay` | detay | `TahsilatlarDetayMasasiPage` | **gerçekleşen** |  |
| 65 | `/tahsilatlar/yeni` | `/tahsilatlar/yeni` | yeni/hub | `TahsilatlarYeniFormPage` | **gerçekleşen** |  |
| 66 | `/teklifler` | `/teklifler` | ana | `TekliflerOperasyonPage` | **gerçekleşen** |  |
| 67 | `/teklifler/detay` | `/teklifler/detay` | detay | `TekliflerDetayMasasiPage` | **gerçekleşen** |  |
| 68 | `/teklifler/katman/belgeler` | `/teklifler/katman/belgeler` | katman | `TekliflerKatmanBelgelerPage` | **gerçekleşen** |  |
| 69 | `/teklifler/katman/donusum` | `/teklifler/katman/donusum` | katman | `TekliflerKatmanDonusumPage` | **gerçekleşen** |  |
| 70 | `/teklifler/katman/musteri` | `/teklifler/katman/musteri` | katman | `TekliflerKatmanMusteriPage` | **gerçekleşen** |  |
| 71 | `/teklifler/katman/ozet` | `/teklifler/katman/ozet` | katman | `TekliflerKatmanOzetPage` | **gerçekleşen** |  |
| 72 | `/teklifler/katman/satirlar` | `/teklifler/katman/satirlar` | katman | `TekliflerKatmanSatirlarPage` | **gerçekleşen** |  |
| 73 | `/teklifler/katman/timeline` | `/teklifler/katman/timeline` | katman | `TekliflerKatmanTimelinePage` | **gerçekleşen** |  |
| 74 | `/teklifler/yeni` | `/teklifler/yeni` | yeni/hub | `TekliflerYeniHubPage` | **gerçekleşen** |  |
| 75 | `/teslimatlar` | `/teslimatlar` | ana | `TeslimatlarOperasyonPage` | **gerçekleşen** |  |
| 76 | `/teslimatlar/detay` | `/teslimatlar/detay` | detay | `TeslimatlarDetayMasasiPage` | **gerçekleşen** |  |
| 77 | `/teslimatlar/rota` | `/teslimatlar/rota` | ana | `TeslimatlarRotaOperasyonPage` | **gerçekleşen** |  |
| 78 | `/teslimatlar/yeni` | `/teslimatlar/yeni` | yeni/hub | `TeslimatlarYeniFormPage` | **gerçekleşen** |  |
| 79 | `/unauthorized` | `/unauthorized` | ana | `UnauthorizedStatePage` | **gerçekleşen** |  |
| 80 | `/whatsapp` | `/whatsapp` | ana | `WhatsAppOperasyonPaneliPage` | **gerçekleşen** |  |
| 81 | `/workflow/timeline` | `/workflow/timeline` | ana | `WorkflowTimelineDetayPage` | **gerçekleşen** |  |

---

## Sandbox ekstra route (Final 81 dışı)

PREMIUM / birleştirme sonrası eklenen veya alias; Final envanterine dahil değil.

| Sandbox route | Not |
|---------------|-----|
| `/[...productSlug]` | Dynamic PREMIUM route |
| `/ai` | PREMIUM ek |
| `/ai/insights` | PREMIUM ek |
| `/ai/onaylar` | PREMIUM ek |
| `/ai/proposals` | PREMIUM ek |
| `/approvals` | PREMIUM ek |
| `/arsiv` | PREMIUM ek |
| `/ayarlar/[...ayarSlug]` | Dynamic PREMIUM route |
| `/ayarlar/canli-kullanim-hazirligi` | PREMIUM ek |
| `/ayarlar/kullanim-hazirligi` | PREMIUM ek |
| `/ayarlar/operasyon-gozlem` | PREMIUM ek |
| `/ayarlar/pilot-hazirlik` | PREMIUM ek |
| `/ayarlar/pilot-veri-yukleme` | PREMIUM ek |
| `/ayarlar/staging-kontrol` | PREMIUM ek |
| `/ayarlar/veri-yukleme` | PREMIUM ek |
| `/belgeler/[documentId]` | Dynamic PREMIUM route |
| `/belgeler/arsiv` | PREMIUM ek |
| `/belgeler/liste` | Liste alias |
| `/belgeler/sablonlar` | PREMIUM ek |
| `/cariler/[customerId]` | Dynamic PREMIUM route |
| `/cariler/[customerId]/finans` | Dynamic PREMIUM route |
| `/cariler/[customerId]/iletisim` | Dynamic PREMIUM route |
| `/cariler/[customerId]/ozet` | Dynamic PREMIUM route |
| `/cariler/[customerId]/siparisler` | Dynamic PREMIUM route |
| `/cariler/[customerId]/tahsilatlar` | Dynamic PREMIUM route |
| `/cariler/[customerId]/teklifler` | Dynamic PREMIUM route |
| `/cariler/[customerId]/timeline` | Dynamic PREMIUM route |
| `/cariler/liste` | Liste alias |
| `/dashboard/approvals` | PREMIUM ek |
| `/demo` | PREMIUM ek |
| `/depo/emirler/[warehouseOrderId]` | Dynamic PREMIUM route |
| `/empty` | PREMIUM ek |
| `/fabrikalar/siparisler` | PREMIUM ek |
| `/fabrikalar/siparisler/[factoryOrderId]` | Dynamic PREMIUM route |
| `/fabrikalar/stoklar` | PREMIUM ek |
| `/faturalar/[invoiceId]` | Dynamic PREMIUM route |
| `/faturalar/liste` | Liste alias |
| `/gelen-kutu/konusma/[conversationId]` | Dynamic PREMIUM route |
| `/gorevler/[taskId]` | Dynamic PREMIUM route |
| `/gorevler/benim-gorevlerim` | PREMIUM ek |
| `/gorevler/ekip-gorevleri` | PREMIUM ek |
| `/gorevler/gecikenler` | PREMIUM ek |
| `/gorevler/merkez` | PREMIUM ek |
| `/gorevler/otomatik-gorevler` | PREMIUM ek |
| `/hizli-islem/[...hizliSlug]` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/etki-analizi` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/iade` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/siparis` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/sonuc` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/tahsilat` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/teklif` | PREMIUM hızlı işlem adımları |
| `/hizli-islem/teslim` | PREMIUM hızlı işlem adımları |
| `/iadeler/[returnId]` | Dynamic PREMIUM route |
| `/kurulum/[...kurulumSlug]` | Dynamic PREMIUM route |
| `/kurulum/veri-yukleme` | PREMIUM ek |
| `/mobile-drawer` | PREMIUM ek |
| `/muhasebe` | Muhasebe hub (2026-05 IA) |
| `/offline` | PREMIUM ek |
| `/onaylar/[approvalId]` | Dynamic PREMIUM route |
| `/onaylar/bekleyenler` | PREMIUM ek |
| `/onaylar/inceleme` | PREMIUM ek |
| `/onaylar/limitler` | PREMIUM ek |
| `/onaylar/tamamlananlar` | PREMIUM ek |
| `/panel` | PREMIUM ek |
| `/print-export` | PREMIUM ek |
| `/raporlar/[...raporSlug]` | Dynamic PREMIUM route |
| `/siparisler/[orderId]` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/depo-stok-etkisi` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/fatura` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/iade` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/odeme-tahsilat` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/ozet` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/satirlar` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/teslimat` | Dynamic PREMIUM route |
| `/siparisler/[orderId]/timeline` | Dynamic PREMIUM route |
| `/siparisler/katman/depo-stok-etkisi` | PREMIUM ek |
| `/siparisler/katman/odeme-tahsilat` | PREMIUM ek |
| `/siparisler/liste` | Liste alias |
| `/stok/[...stokSlug]` | Dynamic PREMIUM route |
| `/tahsilatlar/[paymentId]` | Dynamic PREMIUM route |
| `/tahsilatlar/liste` | Liste alias |
| `/tasks` | PREMIUM ek |
| `/teklifler/[offerId]` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/belgeler` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/musteri` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/ozet` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/satirlar` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/siparise-donusturme` | Dynamic PREMIUM route |
| `/teklifler/[offerId]/timeline` | Dynamic PREMIUM route |
| `/teklifler/katman/siparise-donusturme` | PREMIUM ek |
| `/teklifler/liste` | Liste alias |
| `/teslimatlar/[deliveryId]` | Dynamic PREMIUM route |
| `/teslimatlar/liste` | Liste alias |
| `/workflow/[entityType]/[entityId]` | Dynamic PREMIUM route |

---

## B — Tasarım paketi (53 route/katman)

Kaynak: [`docs/product/UI_ROUTE_COVERAGE_MATRIX.md`](./product/UI_ROUTE_COVERAGE_MATRIX.md)

| Metrik | Durum |
|--------|--------|
| Toplam hedef | 53 |
| apps/web karşılığı | 48 route + 5 davranış katmanı |
| Dedicated route eksik | 0 (Agent 08–10 sonrası) |
| Mockup PNG repoda | Yok (paket ayrı ZIP) |

Final 81 ile bire bir aynı değildir: Final daha fazla **katman/detay** route içerir.

---

## Faz 4 — Henüz tam ürün sayılmayan (UI taşındı, bağ kısmi)

Kaynak: [`docs/MERGE_STATUS.md`](./MERGE_STATUS.md)

| Alan | Durum |
|------|--------|
| Hızlı İşlem → `QuickOperationPage` + canlı `submitQuickOperationRecord` | gerçekleşmedi |
| Gösterge KPI ↔ canlı API `cardValues` | kısmi |
| Tam cutover gate (`turbo typecheck --force`, `smoke:product-readiness`) | bekliyor |
| Eski PREMIUM CommandCenter temizliği | bekliyor |

---

## İlgili komutlar

```bash
node scripts/merge/audit-reference-routes.mjs
node scripts/merge/list-merge-inventory.mjs
pnpm smoke:navigation
```
