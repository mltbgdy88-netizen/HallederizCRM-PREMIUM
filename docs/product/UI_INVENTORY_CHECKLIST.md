# HallederizCRM Premium — UI envanteri (Görev 01)

Bu doküman, `apps/web/app` altındaki **gerçek `page.tsx` dosyaları** ile `docs/product` ürün notlarını hizalayarak ekranları on gruba ayırır. Tamamlayıcı görev sırası ve kapsam için bkz. [UI_TRANSFORMATION_TASKS.md](./UI_TRANSFORMATION_TASKS.md); tasarım token’ları için bkz. [DESIGN_TOKENS.md](./DESIGN_TOKENS.md). Güncelleme: yeni route eklendiğinde bu listeyi ve `apps/web/src/navigation/product-route-manifest.ts` dosyasını birlikte gözden geçirin.

## Kaynaklar

| Kaynak | Açıklama |
|--------|----------|
| `apps/web/app/(platform)/layout.tsx` | `ProtectedRoute` + `PlatformShell` |
| `apps/web/app/(platform)/page.tsx` | `/` → `/dashboard` yönlendirmesi |
| `apps/web/app/(platform)/[...productSlug]/page.tsx` | Ürün ağacı / modül landing catch-all |
| `apps/web/src/navigation/product-route-manifest.ts` | Modül href ağacı, alias, statüler |
| `docs/product/PRODUCTION_ROUTE_MANIFEST.md` | Üretim route manifest özeti |
| `docs/product/README.md` | Onay inbox, operatör, hızlı işlem doküman indeksi |

**Not:** `(platform)` URL’de görünmez; aşağıdaki yollar kullanıcıya gösterilen path’lerdir.

---

## dashboard

- [ ] `/dashboard` — Gösterge paneli (AI sağ kolon yalnızca bu ana sayfada, proje UI kurallarına göre)
- [ ] `/` — Platform girişi; sunucu tarafında `/dashboard`’a yönlendirilir (`(platform)/page.tsx`)

---

## operator workspace

- [ ] `/gorevler` — Görev merkezi kökü
- [ ] `/gorevler/merkez` — Görev listesi / merkez
- [ ] `/gorevler/benim-gorevlerim` — Kişisel görevler
- [ ] `/gorevler/ekip-gorevleri` — Ekip görevleri
- [ ] `/gorevler/gecikenler` — Geciken işler
- [ ] `/gorevler/otomatik-gorevler` — Otomasyon görevleri
- [ ] `/gorevler/[taskId]` — Görev detayı (ayrıca: detay ekranları)
- [ ] `/workflow/[entityType]/[entityId]` — Varlığa bağlı iş akışı / timeline bağlamı
- [ ] `/erp` — ERP entegrasyon operasyon ekranı
- [ ] `/ai` — Tam sayfa AI asistan (dashboard’daki sağ kolon ile ürün sınırlarını dokümante tutun)
- [ ] `/ai/icgoruler` — İçgörü listesi
- [ ] `/ai/onaylar` — AI ↔ onay kesişimi (ayrıca: approval inbox)

---

## approval inbox

- [ ] `/onaylar` — Onay inbox ana giriş
- [ ] `/onaylar/bekleyenler` — Bekleyen onaylar
- [ ] `/onaylar/inceleme` — İnceleme kuyruğu
- [ ] `/onaylar/tamamlananlar` — Tamamlanan onaylar
- [ ] `/onaylar/kurallar` — Onay kuralları
- [ ] `/onaylar/limitler` — Limitler
- [ ] `/onaylar/[approvalId]` — Tekil onay detayı
- [ ] `/approvals` — `/onaylar` alias (yalnızca yönlendirme)
- [ ] `/dashboard/approvals` — `/onaylar` alias (yalnızca yönlendirme)

---

## hızlı işlem merkezi

- [ ] `/hizli-islem` — Hızlı İşlem Merkezi
- [ ] `/hizli-islem/[...hizliSlug]` — Alt varyantlar (catch-all)

---

## liste ekranları

- [ ] `/archive` — Arşiv
- [ ] `/cariler` — Cari kök / liste
- [ ] `/cariler/liste` — Cari liste (explicit)
- [ ] `/teklifler` — Teklif listesi
- [ ] `/teklifler/liste` — Teklif listesi (explicit)
- [ ] `/siparisler` — Sipariş listesi
- [ ] `/siparisler/liste` — Sipariş listesi (explicit)
- [ ] `/tahsilatlar` — Tahsilat listesi
- [ ] `/tahsilatlar/liste` — Tahsilat listesi (explicit)
- [ ] `/faturalar` — Fatura listesi
- [ ] `/faturalar/liste` — Fatura listesi (explicit)
- [ ] `/iadeler` — İade listesi
- [ ] `/stok` — Stok / ürün ana liste
- [ ] `/stok/[...stokSlug]` — Stok alt görünümleri (catch-all)
- [ ] `/depo` — Depo kökü
- [ ] `/belgeler` — Belge merkezi
- [ ] `/belgeler/liste` — Belge listesi
- [ ] `/belgeler/arsiv` — Belge arşivi
- [ ] `/belgeler/sablonlar` — Şablonlar
- [ ] `/teslimatlar` — Teslimat kökü
- [ ] `/teslimatlar/liste` — Teslimat listesi
- [ ] `/teslimatlar/rota` — Rota / sevkiyat planı
- [ ] `/fabrikalar/stoklar` — Fabrika stokları
- [ ] `/fabrikalar/siparisler` — Fabrika siparişleri
- [ ] `/gelen-kutu` — Omnichannel gelen kutu (konuşma listesi)
- [ ] `/kullanicilar` — Kullanıcı listesi (ayrıca: ayarlar)
- [ ] `/kullanicilar/roller` — Rol listesi (ayrıca: ayarlar)
- [ ] `/whatsapp` — WhatsApp operasyon ekranı (ayrıca: inbox/iletişim)
- [ ] `/raporlar` — Raporlar girişi (ayrıca: rapor ekranları)
- [ ] **Catch-all modül yolları** — `/[...productSlug]` (`panel`, `yardimci`, `gelen-kutu/*` alt dalları, `entegrasyonlar`, vb.): `product-route-manifest.ts` ile tanımlı; çoğu landing / shell / “API bekleniyor” yüzeyi

---

## detay ekranları

- [ ] `/cariler/[customerId]` — Cari detay
- [ ] `/teklifler/[offerId]` — Teklif detayı
- [ ] `/siparisler/[orderId]` — Sipariş detayı
- [ ] `/tahsilatlar/[paymentId]` — Tahsilat detayı
- [ ] `/faturalar/[invoiceId]` — Fatura detayı
- [ ] `/iadeler/[returnId]` — İade detayı
- [ ] `/belgeler/[documentId]` — Belge detayı
- [ ] `/teslimatlar/[deliveryId]` — Teslimat detayı
- [ ] `/depo/emirler/[warehouseOrderId]` — Depo emri detayı
- [ ] `/fabrikalar/siparisler/[factoryOrderId]` — Fabrika siparişi detayı
- [ ] `/gelen-kutu/konusma/[conversationId]` — Konuşma detayı (ayrıca: inbox/iletişim)

---

## form ekranları

- [ ] `/cariler/yeni` — Yeni cari
- [ ] `/teklifler/yeni` — Yeni teklif
- [ ] `/siparisler/yeni` — Yeni sipariş
- [ ] `/tahsilatlar/yeni` — Yeni tahsilat
- [ ] `/faturalar/yeni` — Yeni fatura
- [ ] `/iadeler/yeni` — Yeni iade
- [ ] `/belgeler/yeni` — Yeni belge
- [ ] `/teslimatlar/yeni` — Yeni teslimat

---

## inbox / iletişim ekranları

- [ ] `/gelen-kutu` — Birleşik gelen kutu
- [ ] `/gelen-kutu/konusma/[conversationId]` — Konuşma thread’i
- [ ] `/whatsapp` — WhatsApp kanalı

---

## rapor ekranları

- [ ] `/raporlar` — Raporlar kökü
- [ ] `/raporlar/[...raporSlug]` — Rapor alt türleri (catch-all)

---

## ayarlar ekranları

- [ ] `/ayarlar` — Ayarlar kökü
- [ ] `/ayarlar/[...ayarSlug]` — Tenant / modül / kanal catch-all
- [ ] `/ayarlar/pilot-hazirlik` — Pilot hazırlık
- [ ] `/ayarlar/staging-kontrol` — Staging kontrolü
- [ ] `/ayarlar/veri-yukleme` — Veri yükleme
- [ ] `/ayarlar/pilot-veri-yukleme` — Pilot veri yükleme
- [ ] `/ayarlar/canli-kullanim-hazirligi` — Canlı kullanım hazırlığı
- [ ] `/ayarlar/kullanim-hazirligi` — Kullanım hazırlığı
- [ ] `/ayarlar/operasyon-gozlem` — Operasyon ve gözlem (trace/tenant, release, haftalık pilot şablonu)
- [ ] `/kurulum/[...kurulumSlug]` — Kurulum sihirbazı catch-all
- [ ] `/kurulum/veri-yukleme` — Kurulum veri yükleme
- [ ] `/kullanicilar` — Kullanıcı yönetimi (liste + ayarlar sınırı)
- [ ] `/kullanicilar/roller` — Rol ve izin yüzeyi

---

## Kimlik doğrulama (on gruptan ayrı)

- [ ] `/login` — Oturum açma (`app/login/`; `(platform)` dışı)

---

## Belirsizlikler ve bakım notları

- **Manifest vs dosya:** `product-route-manifest.ts` içindeki `needs-api` / `implemented` statüleri ile gerçek UI derinliği her zaman örtüşmeyebilir; ekran dosyası varken bile içerik shell olabilir.
- **`/ai` vs dashboard AI kolonu:** Ürün ve `.cursor` UI kurallarında vurgu farklı olabilir; tek kaynakta karar dokümante edin.
- **Catch-all kapsamı:** `[...productSlug]` altındaki yüzlerce `href` için ayrı `page.tsx` yok; envanterde “modül landing” olarak gruplanır; detaylı ağaç için manifest flatten çıktısı kullanılmalıdır.

---

## Ek: UI dönüşüm görevleri 02–22 (faz özeti)

| Faz | Kısa not |
|-----|----------|
| 02 Design tokens | `globals.css` / Tailwind tema ile `packages/ui` hizası; shadcn uyumu |
| 03 Primitives | Mevcut `@hallederiz/ui` + web bileşenleri; state varyantları tekilleştirme |
| 04 AppShell | `platform-shell.tsx`, PageMeta bastırma desenleri |
| 05 FilterToolbar | Liste sayfalarında tekrar kullanım; mevcut sayfa-prefix CSS kurallarına uyum |
| 06 DataTable | Kompakt satır, sticky header, pagination — modül bazlı taşıma |
| 07 DetailPanel | 320–360px sağ panel; onay / önizleme ile paylaşım |
| 08 Dashboard | `DashboardHomePage` vb.; gösterişsiz hero |
| 09 Approval Inbox | `features/approvals` + `APPROVAL_INBOX_*` dokümanları |
| 10 Operator workspace | Görev + workflow + inbox birleşik workbench (konsept: `OPERATOR_WORKSPACE_PRODUCT_SPEC.md`) |
| 11 Quick operation | `hizli-islem`; fiş mantığına dokunmadan görünüm |
| 12–14 Entity list | Ortak şablon + cari / sipariş / teklif / tahsilat / stok |
| 15–16 Entity detail | Ortak layout + detay sayfaları |
| 17 Form system | Bölüm kartları, sticky aksiyon çubuğu |
| 18 Unified inbox | Gelen kutusu + WhatsApp CRM hissi |
| 19 Reports | `/raporlar` analytics şablonu |
| 20 Settings | Ayarlar kartları + `ayarlar/[...ayarSlug]` |
| 21 Shared states | Loading / empty / error ortak bileşenleri |
| 22 Polish | spacing, focus, a11y, görsel tutarlılık |

**Kalite kapıları (UI işleri):** `pnpm --filter @hallederiz/web typecheck`, `pnpm smoke:navigation`; `apps/web/tsconfig.tsbuildinfo` commit dışı.
