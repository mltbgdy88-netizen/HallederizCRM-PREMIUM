# Director Inbox — QA hatırlatmaları

Design Auditor her tur sonunda buraya yazar. Director okur → yeni görev dağıtır.

### 2026-05-27 — Final re-QA: Teklifler #15 + Siparişler #19–27 + Cariler #30–37

**Build:** `pnpm stop-dev` → `pnpm build` — **PASS** (85 route)

**Özet:** **15 PASS** | **2 FAIL** | **1 atlandı** (#22 iade `done`)

| # | Slug | Route | Karar | Rapor |
|---|------|-------|-------|-------|
| 15 | teklifler-katman-donusum | /teklifler/katman/donusum | **FAIL** | `teklifler-katman-donusum.md` |
| 19 | siparisler-detay-masasi | /siparisler/detay | **FAIL** | `siparisler-w3-batch-qa.md` |
| 20 | siparisler-katman-depo-stok | /siparisler/katman/depo-stok | **PASS** | `siparisler-w3-batch-qa.md` |
| 21 | siparisler-katman-fatura | /siparisler/katman/fatura | **PASS** | `siparisler-w3-batch-qa.md` |
| 23 | siparisler-katman-odeme | /siparisler/katman/odeme | **PASS** | `siparisler-w3-batch-qa.md` |
| 24 | siparisler-katman-ozet | /siparisler/katman/ozet | **PASS** | `siparisler-w3-batch-qa.md` |
| 25 | siparisler-katman-satirlar | /siparisler/katman/satirlar | **PASS** | `siparisler-w3-batch-qa.md` |
| 26 | siparisler-katman-teslimat | /siparisler/katman/teslimat | **PASS** | `siparisler-w3-batch-qa.md` |
| 27 | siparisler-katman-timeline | /siparisler/katman/timeline | **PASS** | `siparisler-w3-batch-qa.md` |
| 30 | cariler-detay-masasi | /cariler/detay | **PASS** | `cariler-w4-batch-qa.md` |
| 31 | cariler-katman-finans | /cariler/katman/finans | **PASS** | `cariler-w4-batch-qa.md` |
| 32 | cariler-katman-iletisim | /cariler/katman/iletisim | **PASS** | `cariler-w4-batch-qa.md` |
| 33 | cariler-katman-ozet | /cariler/katman/ozet | **PASS** | `cariler-w4-batch-qa.md` |
| 34 | cariler-katman-teklifler | /cariler/katman/teklifler | **PASS** | `cariler-w4-batch-qa.md` |
| 35 | cariler-katman-siparisler | /cariler/katman/siparisler | **PASS** | `cariler-w4-batch-qa.md` |
| 36 | cariler-katman-tahsilatlar | /cariler/katman/tahsilatlar | **PASS** | `cariler-w4-batch-qa.md` |
| 37 | cariler-katman-timeline | /cariler/katman/timeline | **PASS** | `cariler-w4-batch-qa.md` |

**Batch rapor:** `docs/design/qa-reports/w2-w4-final-reqa-2026-05-27.md`

**Director aksiyonu:**
1. **qa-pass (15)** → `done` işaretle (W3 katmanlar + W4 cariler tamamı).
2. **REVIZE #15** → `DONUSUM_STEPS`: PNG stepper adım 1 ✓, adım 2 bekliyor (içerik Stok Onayı).
3. **REVIZE #19** → `SiparislerDetayMasasiPage` footer: “Toplam 8 satır” (`SDM_LINES` 4 satır kalabilir).

---

### 2026-05-27 — Re-QA: qa-review batch (21 ekran, post-REVIZE)

**Build:** `pnpm stop-dev` → clean `.next` → `pnpm build` — **PASS** (85 route)

**Özet:** **20 PASS** | **1 FAIL**

| # | Slug | Route | Karar | Rapor |
|---|------|-------|-------|-------|
| 40 | tahsilatlar-detay-masasi | /tahsilatlar/detay | **PASS** | `tahsilatlar-detay-masasi.md` |
| 42 | tahsilatlar-yeni-form | /tahsilatlar/yeni | **PASS** | `tahsilatlar-yeni-form.md` |
| 43 | teslimatlar-detay-masasi | /teslimatlar/detay | **PASS** | `teslimatlar-detay-masasi.md` |
| 44 | teslimatlar-operasyon-masasi | /teslimatlar | **PASS** | `teslimatlar-operasyon-masasi.md` |
| 45 | teslimatlar-rota-operasyon-masasi | /teslimatlar/rota | **PASS** | `teslimatlar-rota-operasyon-masasi.md` |
| 47 | faturalar-detay-masasi | /faturalar/detay | **PASS** | `faturalar-detay-masasi.md` |
| 48 | faturalar-operasyon-masasi | /faturalar | **PASS** | `faturalar-operasyon-masasi.md` |
| 51 | iadeler-operasyon-masasi | /iadeler | **PASS** | `iadeler-operasyon-masasi.md` |
| 52 | iadeler-yeni-form | /iadeler/yeni | **PASS** | `iadeler-yeni-form.md` |
| 55 | fabrikalar-siparis-detay | /fabrikalar/siparis/detay | **PASS** | `fabrikalar-siparis-detay.md` |
| 56 | fabrikalar-siparis-operasyon-masasi | /fabrikalar/siparis | **FAIL** | `fabrikalar-siparis-operasyon-masasi.md` |
| 59 | belgeler-operasyon-masasi | /belgeler | **PASS** | `belgeler-operasyon-masasi.md` |
| 62 | gorevler-operasyon-masasi | /gorevler | **PASS** | `gorevler-operasyon-masasi.md` |
| 63 | kullanicilar-operasyon-masasi | /kullanicilar | **PASS** | `kullanicilar-operasyon-masasi.md` |
| 64 | kullanicilar-roller-matris | /kullanicilar/roller | **PASS** | `kullanicilar-roller-matris.md` |
| 65 | erp-entegrasyon-masasi | /erp | **PASS** | `erp-entegrasyon-masasi.md` |
| **68** | **onaylar-komut-masasi** | **/onaylar** | **PASS** | `onaylar-komut-masasi.md` |
| 71 | hizli-islem-satis-masasi | /hizli-islem/satis-masasi | **PASS** | `hizli-islem-satis-masasi.md` |
| 74 | gelen-kutu-konusma-detay | /gelen-kutu/konusma | **PASS** | `gelen-kutu-konusma-detay.md` |
| 76 | workflow-timeline-detay | /workflow/timeline | **PASS** | `workflow-timeline-detay.md` |
| 80 | offline-api-state | /offline | **PASS** | `offline-api-state.md` |

**Batch rapor:** `docs/design/qa-reports/qa-review-reqa-batch-2026-05-27.md`

**Director aksiyonu:**
1. **qa-pass (20)** → `done` işaretle (öncelik **#68** `/onaylar`).
2. **REVIZE #56** → `FabrikalarSiparisOperasyonPage.tsx`: `useState("Tüm Durumlar")`.

---

### 2026-05-27 — REVIZE W5 kalan (11 qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `.next` temizle → `pnpm build` — **PASS** (85 route)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 40 | tahsilatlar-detay-masasi | /tahsilatlar/detay | `qa-review` |
| 42 | tahsilatlar-yeni-form | /tahsilatlar/yeni | `qa-review` |
| 43 | teslimatlar-detay-masasi | /teslimatlar/detay | `qa-review` |
| 44 | teslimatlar-operasyon-masasi | /teslimatlar | `qa-review` |
| 45 | teslimatlar-rota-operasyon-masasi | /teslimatlar/rota | `qa-review` |
| 47 | faturalar-detay-masasi | /faturalar/detay | `qa-review` |
| 48 | faturalar-operasyon-masasi | /faturalar | `qa-review` |
| 51 | iadeler-operasyon-masasi | /iadeler | `qa-review` |
| 52 | iadeler-yeni-form | /iadeler/yeni | `qa-review` |
| 59 | belgeler-operasyon-masasi | /belgeler | `qa-review` |
| 62 | gorevler-operasyon-masasi | /gorevler | `qa-review` |

**Özet düzeltmeler (PNG-exact mock):**
- **#40 Tahsilat detay:** `THDM_OVERVIEW` eşleşen/kalan; `THDM_DIST_FOOTER` orijinal ₺68.750; FAT-0501 kısmi ₺23.300; bağlı faturalar ₺17.000; adım saatleri 14:33–14:34
- **#42 Yeni tahsilat:** backdrop `StokOperasyonPage`
- **#43–45 Teslimatlar:** detay SPB 1600 / 7.5 kW; liste şoför Mehmet Yıldız; rota 48,6 km / 11:05; bakım uyarı metni PNG
- **#47–48 Faturalar:** bağlam CAR-1001; detay belge A1B2C3D4E5F6
- **#51–52 İadeler:** liste SP-2025-001245 + ABC Mağazacılık; bağlam 22.05.2025 / koli hasarlı; yeni form ₺290
- **#59 Belgeler:** tablo BEL-2025-000124 + ABC Otomotiv 20.05.2025 14:35; bağlam/geçmiş hizalı
- **#62 Görevler:** tablo satır 2 UR-10001; bağlam Yusuf Kaya (mock doğrulandı)

**Director:** Design Auditor yeniden QA (`qa-pass` veya `qa-fail`).

---

### 2026-05-27 — REVIZE re-QA: Teklifler #15 + Siparişler #19–27 + Cariler #30–37 (qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `pnpm clean` → `pnpm build` — **PASS** (85 route)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 15 | teklifler-katman-donusum | /teklifler/katman/donusum | `qa-review` |
| 19 | siparisler-detay-masasi | /siparisler/detay | `qa-review` |
| 20 | siparisler-katman-depo-stok | /siparisler/katman/depo-stok | `qa-review` |
| 21 | siparisler-katman-fatura | /siparisler/katman/fatura | `qa-review` |
| 23 | siparisler-katman-odeme | /siparisler/katman/odeme | `qa-review` |
| 24 | siparisler-katman-ozet | /siparisler/katman/ozet | `qa-review` |
| 25 | siparisler-katman-satirlar | /siparisler/katman/satirlar | `qa-review` |
| 26 | siparisler-katman-teslimat | /siparisler/katman/teslimat | `qa-review` |
| 27 | siparisler-katman-timeline | /siparisler/katman/timeline | `qa-review` |
| 30 | cariler-detay-masasi | /cariler/detay | `qa-review` |
| 31 | cariler-katman-finans | /cariler/katman/finans | `qa-review` |
| 32 | cariler-katman-iletisim | /cariler/katman/iletisim | `qa-review` |
| 33 | cariler-katman-ozet | /cariler/katman/ozet | `qa-review` |
| 34 | cariler-katman-siparisler | /cariler/katman/siparisler | `qa-review` |
| 35 | cariler-katman-tahsilatlar | /cariler/katman/tahsilatlar | `qa-review` |
| 36 | cariler-katman-teklifler | /cariler/katman/teklifler | `qa-review` |
| 37 | cariler-katman-timeline | /cariler/katman/timeline | `qa-review` |

**Özet düzeltmeler (QA-B `siparisler-w3` + `cariler-w4` raporları):**
- **#15 Dönüşüm:** Adım 2 aktif; 6 stok kalemi (Dişli Kısmi 30/75); Rulman A.Ş. bağlam adres/vergi/telefon PNG
- **#19 Detay:** 24.05.2025, Web Sitesi, C-1024, 4 satır, onay 14:35–14:40, iç not
- **#20 Depo:** 7. satır UR-10004 Hava Filtresi eksik 20 adet + Stok Eksik
- **#21 Fatura:** INV vade 30.05 / 07.06 / 14.06
- **#23 Ödeme:** RCPT-156/187/221 + banka açıklamaları (Akbank, Garanti, İş Bankası)
- **#25 Satırlar:** SIP-2025-000246 — 6 satır SPB/Hidrolik Yağ/Küresel Vana; stok bağlam SKF 2.450 adet
- **#30–37 Cariler:** `CKM_HEADERS` route başına PNG cari; özet Son Tahsilat 16.05; finans emerald Yıldız Grup

**Director:** Design Auditor yeniden QA — `siparisler-w3-batch-qa.md` + `cariler-w4-batch-qa.md` şablonu doldurulsun.

---

### 2026-05-27 — REVIZE batch W6+W7 (10 ekran → qa-review)

**Build:** `pnpm stop-dev` → `pnpm build` — implementer doğrulayacak

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 55 | fabrikalar-siparis-detay | /fabrikalar/siparis/detay | `qa-review` |
| 56 | fabrikalar-siparis-operasyon-masasi | /fabrikalar/siparis | `qa-review` |
| 63 | kullanicilar-operasyon-masasi | /kullanicilar | `qa-review` |
| 64 | kullanicilar-roller-matris | /kullanicilar/roller | `qa-review` |
| 65 | erp-entegrasyon-masasi | /erp | `qa-review` |
| 68 | onaylar-komut-masasi | /onaylar | `qa-review` |
| 71 | hizli-islem-satis-masasi | /hizli-islem/satis-masasi | `qa-review` |
| 74 | gelen-kutu-konusma-detay | /gelen-kutu/konusma | `qa-review` |
| 76 | workflow-timeline-detay | /workflow/timeline | `qa-review` |
| 80 | offline-api-state | /offline | `qa-review` |

**Özet düzeltmeler:**
- **#55–56 Fabrikalar sipariş:** detay 24.05.2025 + UR-10003/10005; liste FO-2025-00124…00115, Tamamlandı, Hatalı Kayıt, `Sipariş no...`
- **#63–64 Kullanıcılar:** KPI Aktif 5, 10 satır PNG; roller `KRM_SUBTITLE`, Modül Grubu, mavi footer bilgi kutusu
- **#65 ERP:** `EEM_TABLE_TOTAL` → Toplam 1.246 kayıt
- **#68 Onaylar:** 2025 tarihleri; Rulman 6205 2RS; 850→1.600 adet; ₺85 / ₺136.000; öncelik Orta
- **#71 Satış masası:** `HISM_RECENT` 5 kart; `HISM_LINES` endüstriyel 5 satır + ₺13.284
- **#74 Konuşma:** 8 thread; stok yanıtı 850 adet; Fatura #FA-10008
- **#76 Timeline:** `WFT_EVENTS` 14:32–15:02; bağlam 10.05.2025
- **#80 Offline:** `(offline-shell)` + `OfflineShell` (Müşteriler/Fırsatlar, ÇEVRİMDIŞI MOD)

**Director:** Design Auditor yeniden QA (`qa-pass` veya `qa-fail`).

---

### 2026-05-27 — REVIZE batch (5 qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `pnpm build` — **PASS** (85 route)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 15 | teklifler-katman-donusum | /teklifler/katman/donusum | `qa-review` |
| 71 | hizli-islem-satis-masasi | /hizli-islem/satis-masasi | `qa-review` |
| 74 | gelen-kutu-konusma-detay | /gelen-kutu/konusma | `qa-review` |
| 76 | workflow-timeline-detay | /workflow/timeline | `qa-review` |
| 80 | offline-api-state | /offline | `qa-review` |

**Özet düzeltmeler:**
- **#15 Dönüşüm:** stepper adım 2 aktif; geçerlilik 30.06.2025; 6 stok satırı PNG (Dişli Çark 30/75); tahmini teslimat 18.06.2025
- **#71 Satış masası:** `HISM_RECENT` 5 kart (SF-0245…0241); `HISM_LINES` endüstriyel 5 satır + özet ₺11.070 / ₺13.284
- **#74 Konuşma:** 8 thread; stok mesajı 850 adet; 7 mesaj + Fatura #FA-10008 etkileşimi
- **#76 Timeline:** `WFT_EVENTS` 24.05.2025 14:32–15:02; bağlam 10.05.2025 oluşturma
- **#80 Offline:** `(offline-shell)` + `OfflineShell` (Müşteriler/Fırsatlar menü, ÇEVRİMDIŞI MOD şeridi)

**Director:** Design Auditor yeniden QA (`qa-pass` veya `qa-fail`).

---

### 2026-05-27 — Re-QA: REVIZE batch (9 ekran) — Design Auditor

**Özet:** 9 ekran — **8 PASS**, **1 FAIL** | `pnpm stop-dev` → `pnpm build` **PASS** (85 route)

| # | Slug | Route | Karar | Rapor |
|---|------|-------|-------|-------|
| 5 | `hizli-satis-masasi` | /hizli-satis | **PASS** | `docs/design/qa-reports/hizli-satis-masasi.md` |
| 7 | `rapor-operasyon-merkezi` | /raporlar | **PASS** | `docs/design/qa-reports/rapor-operasyon-merkezi.md` |
| 13 | `teklifler-katman-ozet` | /teklifler/katman/ozet | **PASS** | `docs/design/qa-reports/teklifler-katman-ozet.md` |
| 14 | `teklifler-katman-satirlar` | /teklifler/katman/satirlar | **PASS** | `docs/design/qa-reports/teklifler-katman-satirlar.md` |
| 16 | `teklifler-katman-timeline` | /teklifler/katman/timeline | **PASS** | `docs/design/qa-reports/teklifler-katman-timeline.md` |
| 17 | `teklifler-operasyon-masasi` | /teklifler | **PASS** | `docs/design/qa-reports/teklifler-operasyon-masasi.md` |
| 18 | `teklifler-yeni-hub` | /teklifler/yeni | **PASS** | `docs/design/qa-reports/teklifler-yeni-hub.md` |
| 28 | `siparisler-operasyon-masasi` | /siparisler | **PASS** | `docs/design/qa-reports/siparisler-operasyon-masasi.md` |
| 68 | `onaylar-komut-masasi` | /onaylar | **FAIL** | `docs/design/qa-reports/onaylar-komut-masasi.md` |

**Kuyruk:** #5, #7, #13, #14, #16, #17, #18, #28 → `qa-pass` (Director `done` bekliyor). #68 → `qa-fail`.

**Director aksiyonu:**
1. **qa-pass (8)** → Director final sign-off → `done`.
2. **REVIZE #68** → `onaylar-komut-masasi-mock.ts`: tüm tarihler **2025** (liste + detay + geçmiş); `OKM_DETAIL` ürün **Rulman 6205 2RS**, mevcut **850**, önerilen **1.600**, birim **₺85,00**, tahmini **₺136.000,00**; açıklama metni PNG.
3. REVIZE sonrası yeniden `qa-review` → Auditor.

---

### 2026-05-27 — REVIZE batch W5+W6 (16 qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `pnpm build` (REVIZE implementer)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 40 | tahsilatlar-detay-masasi | /tahsilatlar/detay | `qa-review` |
| 42 | tahsilatlar-yeni-form | /tahsilatlar/yeni | `qa-review` |
| 43 | teslimatlar-detay-masasi | /teslimatlar/detay | `qa-review` |
| 44 | teslimatlar-operasyon-masasi | /teslimatlar | `qa-review` |
| 45 | teslimatlar-rota-operasyon-masasi | /teslimatlar/rota | `qa-review` |
| 47 | faturalar-detay-masasi | /faturalar/detay | `qa-review` |
| 48 | faturalar-operasyon-masasi | /faturalar | `qa-review` |
| 51 | iadeler-operasyon-masasi | /iadeler | `qa-review` |
| 52 | iadeler-yeni-form | /iadeler/yeni | `qa-review` |
| 55 | fabrikalar-siparis-detay | /fabrikalar/siparis/detay | `qa-review` |
| 56 | fabrikalar-siparis-operasyon-masasi | /fabrikalar/siparis | `qa-review` |
| 59 | belgeler-operasyon-masasi | /belgeler | `qa-review` |
| 62 | gorevler-operasyon-masasi | /gorevler | `qa-review` |
| 63 | kullanicilar-operasyon-masasi | /kullanicilar | `qa-review` |
| 64 | kullanicilar-roller-matris | /kullanicilar/roller | `qa-review` |
| 65 | erp-entegrasyon-masasi | /erp | `qa-review` |

**Özet düzeltmeler:**
- **Tahsilatlar:** detay özet ₺53.750 / ₺15.000; yeni form backdrop → `StokOperasyonPage`
- **Teslimatlar:** şoför Mehmet Yıldız; detay SPB 1600 + 7.5 kW; rota 48,6 km / 11:05
- **Faturalar:** bağlam CAR-1001; detay belge A1B2C3D4E5F6
- **İadeler:** liste SP-2025-001245 + ABC Mağazacılık; yeni form 4 satır / ₺290
- **Fabrikalar sipariş:** 10 satır SP-2025, Tamamlandı, Hatalı Kayıt; detay 24.05 + UR-10003/10005
- **Belgeler / Görevler / Kullanıcılar / ERP:** bağlam ve tablo mock PNG hizası; roller footer bilgi kutusu

**Director:** Design Auditor yeniden QA (16 ekran).

---

### 2026-05-27 — QA turu: W6+W7 batch (21 ekran) — Design Auditor

**Özet:** 21 ekran — **11 PASS**, **10 FAIL** | Raporlar: `docs/design/qa-reports/*.md`

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `fabrikalar-siparis-operasyon-masasi` | /fabrikalar/siparis | **FAIL** | `fabrikalar-siparis-operasyon-masasi.md` |
| `fabrikalar-siparis-detay` | /fabrikalar/siparis/detay | **FAIL** | `fabrikalar-siparis-detay.md` |
| `fabrikalar-stok-operasyon-masasi` | /fabrikalar/stok | **PASS** | `fabrikalar-stok-operasyon-masasi.md` |
| `kullanicilar-operasyon-masasi` | /kullanicilar | **FAIL** | `kullanicilar-operasyon-masasi.md` |
| `kullanicilar-roller-matris` | /kullanicilar/roller | **FAIL** | `kullanicilar-roller-matris.md` |
| `erp-entegrasyon-masasi` | /erp | **FAIL** | `erp-entegrasyon-masasi.md` |
| `ayarlar-hub` | /ayarlar | **PASS** | `ayarlar-hub.md` |
| `onaylar-detay-karar` | /onaylar/detay | **PASS** | `onaylar-detay-karar.md` |
| `onaylar-kurallar-matris` | /onaylar/kurallar | **PASS** | `onaylar-kurallar-matris.md` |
| `login-split` | /login | **PASS** | `login-split.md` |
| `demo-mode-state` | /demo | **PASS** | `demo-mode-state.md` |
| `live-empty-state` | /empty | **PASS** | `live-empty-state.md` |
| `offline-api-state` | /offline | **FAIL** | `offline-api-state.md` |
| `unauthorized-state` | /unauthorized | **PASS** | `unauthorized-state.md` |
| `ai-operator-hub` | /ai/operator-hub | **PASS** | `ai-operator-hub.md` |
| `ai-icgoruler` | /ai/icgoruler | **PASS** | `ai-icgoruler.md` |
| `gelen-kutu-konusma-detay` | /gelen-kutu/konusma | **FAIL** | `gelen-kutu-konusma-detay.md` |
| `gelen-kutu-uc-panel` | /gelen-kutu/uc-panel | **PASS** | `gelen-kutu-uc-panel.md` |
| `workflow-timeline-detay` | /workflow/timeline | **FAIL** | `workflow-timeline-detay.md` |
| `hizli-islem-satis-masasi` | /hizli-islem/satis-masasi | **FAIL** | `hizli-islem-satis-masasi.md` |

**Scroll / route:** 21/21 HTTP 200; body scroll yok (CSS `overflow: hidden` + `100dvh`). `pnpm build` bu turda dev 3011 aktif olduğu için koşturulamadı.

**Director aksiyonu (qa-pass → done adayı — yalnızca Director `done`):** #57, #66, #67, #69, #72, #73, #75, #77, #78, #79, #81.

**Director aksiyonu (REVIZE — kritik):**
1. `#56` `/fabrikalar/siparis` — `fabrikalar-siparis-operasyon-mock.ts`: FO-2025 tablo, KPI “Tamamlandı”, “Hatalı Kayıt”, 10 satır.
2. `#55` `/fabrikalar/siparis/detay` — tarihler 24.05.2025, kalemler PNG, `FSD_CONTEXT.errors` UR-10003/10005.
3. `#63` `/kullanicilar` — KPI Aktif **5**, tablo 10 kullanıcı PNG.
4. `#64` `/kullanicilar/roller` — `KRM_SUBTITLE`, Modül Grubu filtresi, footer bilgi kutusu.
5. `#65` `/erp` — `EEM_TABLE_TOTAL` → **Toplam 1.246 kayıt**.
6. `#80` `/offline` — kabuk PNG (minimal offline shell) veya PNG güncelleme kararı.
7. `#74` `/gelen-kutu/konusma` — 8 thread, stok mesajı 850, Fatura etkileşimi.
8. `#76` `/workflow/timeline` — `WFT_EVENTS` saatleri 14:32–15:02 PNG.
9. `#71` `/hizli-islem/satis-masasi` — `HISM_RECENT` 5 kart + `HISM_LINES` PNG ürünleri.

---

### 2026-05-27 — QA turu: W5–W6 Tahsilatlar → Görevler (20 ekran) — Design Auditor

**Özet:** 20 ekran — **9 PASS**, **11 FAIL** | Raporlar: `docs/design/qa-reports/*.md`

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `tahsilatlar-operasyon-masasi` | /tahsilatlar | **PASS** | `tahsilatlar-operasyon-masasi.md` |
| `tahsilatlar-yeni-form` | /tahsilatlar/yeni | **FAIL** | `tahsilatlar-yeni-form.md` |
| `tahsilatlar-detay-masasi` | /tahsilatlar/detay | **FAIL** | `tahsilatlar-detay-masasi.md` |
| `teslimatlar-operasyon-masasi` | /teslimatlar | **FAIL** | `teslimatlar-operasyon-masasi.md` |
| `teslimatlar-yeni-form` | /teslimatlar/yeni | **PASS** | `teslimatlar-yeni-form.md` |
| `teslimatlar-detay-masasi` | /teslimatlar/detay | **FAIL** | `teslimatlar-detay-masasi.md` |
| `teslimatlar-rota-operasyon-masasi` | /teslimatlar/rota | **FAIL** | `teslimatlar-rota-operasyon-masasi.md` |
| `faturalar-operasyon-masasi` | /faturalar | **FAIL** | `faturalar-operasyon-masasi.md` |
| `faturalar-detay-masasi` | /faturalar/detay | **FAIL** | `faturalar-detay-masasi.md` |
| `faturalar-yeni-form` | /faturalar/yeni | **PASS** | `faturalar-yeni-form.md` |
| `iadeler-operasyon-masasi` | /iadeler | **FAIL** | `iadeler-operasyon-masasi.md` |
| `iadeler-detay-masasi` | /iadeler/detay | **PASS** | `iadeler-detay-masasi.md` |
| `iadeler-yeni-form` | /iadeler/yeni | **FAIL** | `iadeler-yeni-form.md` |
| `depo-hazirlik-masasi` | /depo | **PASS** | `depo-hazirlik-masasi.md` |
| `depo-fis-detay-masasi` | /depo/detay | **PASS** | `depo-fis-detay-masasi.md` |
| `belgeler-operasyon-masasi` | /belgeler | **FAIL** | `belgeler-operasyon-masasi.md` |
| `belgeler-detay-masasi` | /belgeler/detay | **PASS** | `belgeler-detay-masasi.md` |
| `belgeler-yeni-form` | /belgeler/yeni | **PASS** | `belgeler-yeni-form.md` |
| `gorevler-operasyon-masasi` | /gorevler | **FAIL** | `gorevler-operasyon-masasi.md` |
| `gorevler-detay-masasi` | /gorevler/detay | **PASS** | `gorevler-detay-masasi.md` |

**Scroll / route:** 20 route HTTP 200; body scroll yok (`overflow: hidden` + canlı `/tahsilatlar`). `pnpm build` dev 3011 aktifken atlandı.

**Director aksiyonu (REVIZE — 11):** tahsilatlar yeni backdrop Stok; tahsilatlar detay özet tutarlar; teslimatlar liste şoför + detay kalemler + rota bağlam; faturalar liste cari kod + detay belge no; iadeler liste/yeni mock; belgeler liste bağlam; gorevler liste tablo/bağlam.

**Director aksiyonu (qa-pass → done — 9):** #41, #46, #49, #50, #53, #54, #58, #60, #61.

**Kuyruk:** `UI_REFERENCE_MASTER_QUEUE.md` #40–#62 güncellendi.

---

### 2026-05-27 — REVIZE batch (9 qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `pnpm build` (REVIZE implementer)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 5 | hizli-satis-masasi | /hizli-satis | `qa-review` |
| 7 | rapor-operasyon-merkezi | /raporlar | `qa-review` |
| 13 | teklifler-katman-ozet | /teklifler/katman/ozet | `qa-review` |
| 14 | teklifler-katman-satirlar | /teklifler/katman/satirlar | `qa-review` |
| 16 | teklifler-katman-timeline | /teklifler/katman/timeline | `qa-review` |
| 17 | teklifler-operasyon-masasi | /teklifler | `qa-review` |
| 18 | teklifler-yeni-hub | /teklifler/yeni | `qa-review` |
| 28 | siparisler-operasyon-masasi | /siparisler | `qa-review` |
| 68 | onaylar-komut-masasi | /onaylar | `qa-review` |

**Özet düzeltmeler:**
- **Hızlı satış:** 6 ürün satırı PNG; ara 4.025 / KDV 805; Onaylayan ve Onay Tarihi `--`
- **Raporlar:** KPI trend %; tablo dönem `01.05.2025 - 31.05.2025`; fark %31,6 / %53,3; bağlam `01.06.2025 09:41` + 4 link/4 aksiyon
- **Teklifler liste/yeni/katman:** tablo/bağlam tarihleri; TYH_DRAFTS 3 kart; 6 katman sekmesi + M-10015; Kalemler/Timeline 7–9 detay sekmesi; TIMELINE_EVENTS + stok uyarı metinleri
- **Siparişler liste:** 8 müşteri unvanı + ABC İnşaat bağlam
- **Onaylar:** 2026 tarihler; Müşteri Onayı KPI; ürün detayı Premium Duvar Kağıdı

**Director:** Design Auditor yeniden QA (`qa-pass` veya `qa-fail`).

---

### 2026-05-27 — REVIZE: Siparişler + Cariler (qa-fail → qa-review)

**Build:** `pnpm stop-dev` → `pnpm build` (REVIZE implementer)

| # | Slug | Route | Durum |
|---|------|-------|--------|
| 19 | siparisler-detay-masasi | /siparisler/detay | `qa-review` |
| 20 | siparisler-katman-depo-stok | /siparisler/katman/depo-stok | `qa-review` |
| 21 | siparisler-katman-fatura | /siparisler/katman/fatura | `qa-review` |
| 23 | siparisler-katman-odeme | /siparisler/katman/odeme | `qa-review` |
| 24 | siparisler-katman-ozet | /siparisler/katman/ozet | `qa-review` |
| 25 | siparisler-katman-satirlar | /siparisler/katman/satirlar | `qa-review` |
| 26 | siparisler-katman-teslimat | /siparisler/katman/teslimat | `qa-review` |
| 27 | siparisler-katman-timeline | /siparisler/katman/timeline | `qa-review` |
| 30 | cariler-detay-masasi | /cariler/detay | `qa-review` |
| 31 | cariler-katman-finans | /cariler/katman/finans | `qa-review` |
| 32 | cariler-katman-iletisim | /cariler/katman/iletisim | `qa-review` |
| 33 | cariler-katman-ozet | /cariler/katman/ozet | `qa-review` |
| 34 | cariler-katman-siparisler | /cariler/katman/siparisler | `qa-review` |
| 35 | cariler-katman-tahsilatlar | /cariler/katman/tahsilatlar | `qa-review` |
| 36 | cariler-katman-teklifler | /cariler/katman/teklifler | `qa-review` |
| 37 | cariler-katman-timeline | /cariler/katman/timeline | `qa-review` |

**Özet düzeltmeler:**
- **Siparişler detay:** 24.05.2025, Web Sitesi, C-1024, 4 satır, onay 14:35–14:40, iç not PNG
- **Sipariş katman:** XYZ Üretim Hattı; depo UR-10004 Hava Filtresi eksik 20; fatura/ödeme/teslimat/timeline/satırlar mock bire bir
- **Cariler detay:** performans KPI ₺1.245.680 / 42 sipariş / ₺143.330 açık; sonraki adım 25.05
- **Cariler katman:** route başına PNG cari (ABC Duvar / ABC A.Ş. / Yıldız Grup / Katman C / AKSİYON / Örnek Sanayi / ABC Teknoloji); özet Son Tahsilat 16.05; finans emerald tema

**Director:** Design Auditor yeniden QA (`siparisler-w3-batch-qa.md` + `cariler-w4-batch-qa.md`).

---

### 2026-05-27 — QA-B: Siparişler + Cariler (qa-review turu)

**Raporlar:** `docs/design/qa-reports/siparisler-w3-batch-qa.md` · `docs/design/qa-reports/cariler-w4-batch-qa.md`  
**Build:** `pnpm stop-dev` → `pnpm build` — **PASS** (85 route)

| Modül | PASS | FAIL | Atlanan |
|-------|------|------|---------|
| Siparişler (#19–27) | 1 (iade) | 8 | #28 liste (önceki fail), #29 yeni (done) |
| Cariler (#30–39) | 1 (yeni form) | 8 | #38 liste (önceki pass) |

**qa-pass (Director `done` bekliyor):** `/siparisler/katman/iade` · `/cariler/yeni`

**REVIZE öncelik (siparişler):** `siparisler-detay-mock.ts` + `siparisler-katman-mock.ts` — sipariş no tutarlılığı, detay 4 satır PNG, satırlar/ödeme/teslimat/timeline metinleri.

**REVIZE öncelik (cariler):** Katman PNG’leri farklı cari kimlikleri; detay performans KPI PNG rakamları. Director: katman başına PNG cari mi tek ABC Duvar Kağıdı mi.

---

### 2026-05-27 gece — Director otomasyon (kullanıcı uyku / tam yetki)

- **Build:** `pnpm build` OK — ~85 statik route
- **Director onayı:** 15 ekran `qa-pass` → `done` (`DONE_SCREENS.md` güncellendi)
- **Duplicate:** #82 arsiv, #83 raporlar → `done` (aynı route #6/#7)
- **Paralel ajanlar (5):** REVIZE-ALL | QA-A (teklifler+W1) | QA-B (sipariş+cari) | QA-C (W5) | QA-D (W6+W7)
- **Kalan:** 9 `qa-fail` REVIZE | ~52 `qa-review` QA bekliyor

---

### 2026-05-27 — W6 batch: Fabrikalar + Kullanıcılar + ERP + Ayarlar + Onaylar (10 ekran)

- **Implementer teslim:** `qa-review` — Design Auditor PNG + scroll testi bekleniyor
- **Routes:** `/fabrikalar/siparis` | `/fabrikalar/siparis/detay` | `/fabrikalar/stok` | `/kullanicilar` | `/kullanicilar/roller` | `/erp` | `/ayarlar` | `/onaylar/detay` | `/onaylar/kurallar`
- **Modüller:** `fabrikalar/`, `kullanicilar/`, `erp/`, `ayarlar/`, `onaylar/` + 10 `*-reference.css`
- **Nav:** Fabrika Siparişleri, Entegrasyon, Ayarlar (`/ayarlar`)
- **Build:** `pnpm stop-dev` → `pnpm build`

### 2026-05-27 — W7 batch (login, sistem state, AI, gelen kutu, workflow, hızlı işlem satış)

**Implementer teslim (11 ekran) → `qa-review`:**

| # | Slug | Route | Layout |
|---|------|-------|--------|
| 79 | login-split-acik-mod | /login | `(auth)` — AppShell yok |
| 77 | demo-mode-state-acik-mod | /demo | platform + AppShell + modal |
| 78 | live-empty-state-acik-mod | /empty | platform + stok backdrop |
| 80 | offline-api-state-acik-mod | /offline | platform |
| 81 | unauthorized-state-acik-mod | /unauthorized | platform |
| 73 | ai-operator-hub-acik-mod | /ai/operator-hub | platform |
| 72 | ai-icgoruler-acik-mod | /ai/icgoruler | platform |
| 74 | gelen-kutu-konusma-detay-acik-mod | /gelen-kutu/konusma | platform |
| 75 | gelen-kutu-uc-panel-acik-mod | /gelen-kutu/uc-panel | platform |
| 76 | workflow-timeline-detay-acik-mod | /workflow/timeline | platform |
| 71 | hizli-islem-satis-masasi-acik-mod | /hizli-islem/satis-masasi | platform |

- **Modüller:** `auth`, `sistem`, `ai`, `gelen-kutu`, `workflow`, `hizli-islem`
- **CSS:** `login-split-reference.css`, `sistem-state-reference.css`, `ai-*`, `gelen-kutu-*`, `workflow-timeline-reference.css`, `hizli-islem-satis-masasi-reference.css`
- **Route map:** `docs/design/ROUTE_MAP.md` güncellendi
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer doğrulayacak)
- **QA:** Design Auditor — PNG karşılaştırması + scroll testi + `QA_VISUAL_REPORT` (batch veya 11 rapor)

---

### 2026-05-27 — W5 Faturalar + İadeler (6 ekran, #47–#52)
- **Implementer teslim:** `06-faturalar` liste/detay/yeni → `/faturalar`, `/faturalar/detay`, `/faturalar/yeni`; `07-iadeler` liste/detay/yeni → `/iadeler`, `/iadeler/detay`, `/iadeler/yeni`
- **Modül:** `apps/web/src/features/faturalar/`, `apps/web/src/features/iadeler/`; CSS `faturalar-*-reference.css`, `iadeler-*-reference.css`
- **Nav:** `Fatura` → `/faturalar`, `İadeler` → `/iadeler` (`dashboard-reference-mock.ts`)
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi (6 rapor veya batch)
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer; derleme OK, Next `.next` ENOENT yeniden denenecek)

### 2026-05-27 — Tahsilatlar + Teslimatlar (W5 #40–#46)
- **Implementer teslim:** 04-tahsilatlar (liste, yeni, detay) + 05-teslimatlar (liste, yeni, detay, rota)
- **Routes:** `/tahsilatlar` · `/tahsilatlar/yeni` · `/tahsilatlar/detay` · `/teslimatlar` · `/teslimatlar/yeni` · `/teslimatlar/detay` · `/teslimatlar/rota`
- **Dosyalar:** `features/tahsilatlar/`, `features/teslimatlar/` + 7× `*-reference.css`; `globals.css` import
- **Nav:** Tahsilatlar, Teslimatlar (`dashboard-reference-mock.ts`, `IconTruck`)
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — Depo + Belgeler + Görevler (W5–W6 #53–62)
- **Implementer teslim:** `08-depo`, `10-belgeler`, `11-gorevler` PNG seti
- **Routes:** `/depo` · `/depo/detay` · `/belgeler` · `/belgeler/detay` · `/belgeler/yeni` · `/gorevler` · `/gorevler/detay`
- **Dosyalar:** `features/depo/`, `features/belgeler/`, `features/gorevler/` + 7× `*-reference.css`
- **Nav:** Depo Hazırlık, Belgeler, Görevler (`dashboard-reference-mock.ts`)
- **Durum:** `qa-review` — Design Auditor PNG + scroll testi bekleniyor
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — Cariler katman (7 ekran, W4 #31–#37)
- **Implementer teslim:** `cariler-katman-*` → `/cariler/katman/{ozet,iletisim,finans,teklifler,siparisler,tahsilatlar,timeline}`
- **Modül:** `apps/web/src/features/cariler/` — `cariler-katman-mock.ts`, `CarilerKatmanShared.tsx`, 7× `CarilerKatman*Page.tsx`, `cariler-katman-reference.css`
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi (7 satır veya batch)
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — Tahsilatlar liste + yeni form (W5 #41–42)
- **Implementer:** `/tahsilatlar` — `tahsilatlar-operasyon-masasi-acik-mod.png`; `/tahsilatlar/yeni` — `tahsilatlar-yeni-form-acik-mod.png` (modal, liste backdrop).
- **Nav:** Tahsilatlar → `/tahsilatlar` (`dashboard-reference-mock.ts`, `IconWallet`).
- **Dosyalar:** `TahsilatlarOperasyonPage.tsx`, `TahsilatlarYeniFormPage.tsx`, `tahsilatlar-*-mock.ts`, `tahsilatlar-*-reference.css`.
- **Durum:** `qa-review` — Design Auditor PNG + scroll testi bekleniyor.
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — Cariler detay + yeni form (W4 #30, #39)
- **Implementer teslim:** `cariler-detay-masasi-acik-mod` → `/cariler/detay`; `cariler-yeni-form-acik-mod` → `/cariler/yeni`
- **Dosyalar:** `CarilerDetayMasasiPage.tsx`, `cariler-detay-mock.ts`, `cariler-detay-reference.css`; `CarilerYeniFormPage.tsx`, `cariler-yeni-form-mock.ts`, `cariler-yeni-form-reference.css`
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — Dalga 3 başlatıldı (Dalga 2 sonrası)
- **Director:** 7 implementer + 1 re-QA; kalan ~50 pending PNG
- **Plan:** `docs/design/WAVE3_PLAN.md`

### 2026-05-27 — Cariler liste (W4 #38)
- **Implementer:** `/cariler` — `cariler-operasyon-masasi-acik-mod.png` (Stok POC kalıbı, `com-*` CSS).
- **Nav:** Cariler → `/cariler` (`dashboard-reference-mock.ts`).
- **Durum:** `qa-review` — Design Auditor PNG + scroll testi bekleniyor.

### 2026-05-27 — Dalga 2 başlatıldı
- **Director:** REVIZE×1, QA×2, Implementer×4 paralel
- **Hedef:** qa-fail düzeltmeleri + W2/W3/W4/W5 pending ekranlar

### 2026-05-27 — Pipeline başlatıldı
- **Director:** Sürekli hattı açıldı; W1 pending + qa-review kuyruğu işleniyor.
- **Aktif:** 4 implementer + 2 QA + 2 REVIZE (arka plan)

### 2026-05-27 — W2 Teklifler katman (4 ekran)
- **Implementer teslim:** `teklifler-katman-ozet`, `satirlar`, `musteri`, `timeline` → `qa-review`
- **QA:** PNG karşılaştırması + `docs/design/templates/QA_VISUAL_REPORT.md` (4 rapor veya batch)
- **Routes:** `/teklifler/katman/ozet` | `satirlar` | `musteri` | `timeline`
- **Modül:** `apps/web/src/features/teklifler/` + `teklifler-katman-reference.css`
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer doğruladı)

### 2026-05-27 — Implementer teslim: gelen-kutu (#3)
- **Route:** `/gelen-kutu` (platform AppShell, WhatsApp nav aktif)
- **PNG:** `gelen-kutu-operasyon-paneli-acik-mod.png`
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor

### 2026-05-27 — siparisler-operasyon-masasi
- **Implementer:** W3 liste teslim — `/siparisler`, 5 KPI, tablo + bağlam paneli, mock bire bir.
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekliyor.

### 2026-05-27 — siparisler-yeni-hub
- **Implementer:** W3 yeni hub teslim — `/siparisler/yeni`, 3 kart + alt özellik çubuğu, koyu yeşil/altın tema.
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekliyor.

### 2026-05-27 — siparisler detay + katman (4 ekran)
- **Implementer:** W3 teslim — detay masası + katman özet / satırlar / depo-stok.
- **Routes:** `/siparisler/detay` | `/siparisler/katman/ozet` | `/siparisler/katman/satirlar` | `/siparisler/katman/depo-stok`
- **Modül:** `apps/web/src/features/siparisler/` + `siparisler-detay-reference.css`, `siparisler-katman-reference.css`
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi (4 satır)

### 2026-05-27 — siparisler katman (fatura, iade, ödeme, teslimat, timeline)
- **Implementer:** W3 teslim — 5 kalan katman ekranı; sekme şeridi tüm href’lerle bağlandı.
- **Routes:** `/siparisler/katman/fatura` | `/siparisler/katman/iade` | `/siparisler/katman/odeme` | `/siparisler/katman/teslimat` | `/siparisler/katman/timeline`
- **Dosyalar:** `SiparislerKatman{Fatura,Iade,Odeme,Teslimat,Timeline}Page.tsx`; mock `siparisler-katman-mock.ts`; CSS `siparisler-katman-reference.css` (layer blokları)
- **Durum:** `qa-review` (#21–23, #26–27) — Design Auditor PNG + scroll testi
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — W2 Teklifler katman (belgeler + dönüşüm)
- **Implementer teslim:** `teklifler-katman-belgeler`, `teklifler-katman-donusum` → `qa-review`
- **Routes:** `/teklifler/katman/belgeler` | `/teklifler/katman/donusum`
- **Dosyalar:** `TekliflerKatmanBelgelerPage.tsx`, `TekliflerKatmanDonusumPage.tsx`; mock `teklifler-katman-mock.ts`; CSS `teklifler-katman-reference.css`
- **QA:** PNG karşılaştırması + scroll testi + `QA_VISUAL_REPORT` (2 rapor veya batch)
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer doğrulayacak)

### 2026-05-27 — W2 Teklifler (detay + yeni hub)
- **QA:** `#10` `/teklifler/detay` — `teklifler-detay-masasi-acik-mod.png` — `qa-review`, implementer teslim.
- **QA:** `#18` `/teklifler/yeni` — `teklifler-yeni-hub-acik-mod.png` — `qa-review`, implementer teslim.
- **Not:** Platform `AppShell`; ayrı mock + CSS (`teklifler-detay-reference.css`, `teklifler-yeni-reference.css`); sidebar **Teklifler** aktif link eklendi.

---

### 2026-05-27 — QA turu: `/dashboard` + `/ana-sayfa` (Design Auditor)

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `dashboard-operasyon-acik-mod` | /dashboard | **FAIL** | `docs/design/qa-reports/dashboard-operasyon-acik-mod.md` |
| `ana-sayfa-emerald-gold-acik-mod` | /ana-sayfa | **FAIL** | `docs/design/qa-reports/ana-sayfa-emerald-gold-acik-mod.md` |

**Önceki bilinen sorunlar (yeniden kontrol):**
- `/dashboard`: Nav aktif, 8 akış satırı, footer © 2025 → **düzelmiş**. Kalan: referansta olmayan **Siparişler** sidebar öğesi.
- `/ana-sayfa`: Kart/AI/görev drift’inin çoğu **düzelmiş**. Kalan: **Operasyon Akış Özeti** alt başlıkları (hepsi “Bugün”), Son İşlemler satır metinleri PNG ile tam değil.

**Director aksiyonu:**
1. **REVIZE** → `dashboard-operasyon-acik-mod`: `NAV_ITEMS` içinden `Siparişler` kaldır (veya PNG güncelleme kararı); akış panel alt başlığına sondaki nokta.
2. **REVIZE** → `ana-sayfa-emerald-gold-acik-mod`: `EG_FLOW` subtitle’ları PNG’den; `EG_RECENT` 6 satır bire bir.
3. Sonraki QA’dan sonra Director `qa-pass` / `done` (yalnızca Director).

**Sıradaki kuyruk önerisi (qa-review bekleyen):** #4 hizli-islem, #8/#84 stok, #9/#85 whatsapp — paralel implementer ataması.

### 2026-05-27 — Rapor Operasyon Merkezi (W1 #7)
- **Route:** `/raporlar` — KPI + sekmeler + tablo + sağ bağlam paneli
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor
- **Build:** `pnpm stop-dev` → `pnpm build` (implementer)

### 2026-05-27 — stok-operasyon-masasi
- Sonuç: qa-pass
- Rapor: docs/design/qa-reports/stok-operasyon-masasi.md
- Director aksiyon: Final sign-off → `done` (kozmetik thumb/kategori isteğe bağlı); build doğrulaması için dev kapatılıp `pnpm build` koşturulsun.

### 2026-05-27 — hizli-islem-merkezi
- Sonuç: qa-fail
- Rapor: docs/design/qa-reports/hizli-islem-merkezi.md
- Director aksiyon: REVIZE → `hizli-islem-mock.ts` içindeki `HI_RECENT` dizisini PNG’deki 5 satıra bire bir (ref, cari, süre, durum, sıra) güncelle; ardından yeniden `qa-review`.

### 2026-05-27 — whatsapp-operasyon-paneli
- Sonuç: qa-fail
- Rapor: docs/design/qa-reports/whatsapp-operasyon-paneli.md
- Director aksiyon: REVIZE → seçili satır SLA (2s 15dk), saat 10:24, maskeli telefon, başlangıç 22.05.2025, önerilen yanıt metinleri ve KPI “Dün'e göre” etiketi PNG ile hizalansın; ardından yeniden `qa-review`.

### 2026-05-27 — Onaylar Komut Masası (W6 #68)
- **Implementer teslim:** `/onaylar` — `onaylar-komut-masasi-acik-mod.png` (3 sütun: liste + detay + işlemler, 5 KPI).
- **QA:** Design Auditor PNG karşılaştırması + `docs/design/templates/QA_VISUAL_REPORT.md` doldurulsun.
- **Nav:** Sidebar Onaylar → `/onaylar` (badge 7).

### 2026-05-27 — Hızlı Satış Masası (W1 #5)
- **Implementer teslim:** `hizli-satis-masasi-acik-mod` → `/hizli-satis` (platform, AppShell).
- **Dosyalar:** `HizliSatisMasasiPage.tsx`, `hizli-satis-masasi-mock.ts`, `hizli-satis-masasi-reference.css`.
- **Kuyruk:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor.
- **Not:** Sidebar aktif menü `Hızlı İşlem` (`/hizli-satis` path ile highlight).

### 2026-05-27 — Implementer teslim: arsiv-operasyon-merkezi
- **Ekran:** `arsiv-operasyon-merkezi-acik-mod.png` → `/arsiv` (platform, AppShell)
- **Dosyalar:** `ArsivOperasyonMerkeziPage.tsx`, `arsiv-operasyon-mock.ts`, `arsiv-operasyon-reference.css`
- **Nav:** `dashboard-reference-mock` Arşiv → `/arsiv`
- **Durum:** `qa-review` — Design Auditor PNG karşılaştırması + `QA_VISUAL_REPORT` şablonu bekleniyor
- **Build:** `pnpm stop-dev` OK; `tsc` yeşil; `next build` compile+lint yeşil — tam paketleme bazen `.next` manifest ENOENT (paralel süreç; QA öncesi tekrar dene)

### 2026-05-27 — W0 REVIZE complete
- **Screen Implementer:** W0 REVIZE complete — `/dashboard` (operasyon) + `/ana-sayfa` (emerald/gold) PNG mock eşlemesi; `pnpm build` OK.
- **Kuyruk:** #1 `/ana-sayfa`, #70 `/dashboard` → `qa-review`. Ready for QA.

### 2026-05-27 — Teklifler Operasyon Masası (W2 #17)
- **Implementer teslim:** `teklifler-operasyon-masasi-acik-mod` → `/teklifler` (platform, AppShell).
- **Dosyalar:** `TekliflerOperasyonPage.tsx`, `teklifler-operasyon-mock.ts`, `teklifler-operasyon-reference.css`.
- **Kuyruk:** `qa-review` — Design Auditor PNG karşılaştırması + scroll testi bekleniyor.
- **Not:** 5 KPI, filtre şeridi, tablo + sağ Teklif Bağlamı paneli; sidebar Teklifler aktif.

### 2026-05-27 — QA turu: W2/W3/W4 Teklifler + Siparişler + Cariler (Design Auditor)

**Özet:** 10 ekran — **4 PASS**, **6 FAIL** | Raporlar: `docs/design/qa-reports/*.md`

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `teklifler-operasyon-masasi` | /teklifler | **FAIL** | `teklifler-operasyon-masasi.md` |
| `teklifler-detay-masasi` | /teklifler/detay | **PASS** | `teklifler-detay-masasi.md` |
| `teklifler-yeni-hub` | /teklifler/yeni | **FAIL** | `teklifler-yeni-hub.md` |
| `teklifler-katman-ozet` | /teklifler/katman/ozet | **FAIL** | `teklifler-katman-ozet.md` |
| `teklifler-katman-satirlar` | /teklifler/katman/satirlar | **FAIL** | `teklifler-katman-satirlar.md` |
| `teklifler-katman-musteri` | /teklifler/katman/musteri | **PASS** | `teklifler-katman-musteri.md` |
| `teklifler-katman-timeline` | /teklifler/katman/timeline | **FAIL** | `teklifler-katman-timeline.md` |
| `siparisler-operasyon-masasi` | /siparisler | **FAIL** | `siparisler-operasyon-masasi.md` |
| `siparisler-yeni-hub` | /siparisler/yeni | **PASS** | `siparisler-yeni-hub.md` |
| `cariler-operasyon-masasi` | /cariler | **PASS** | `cariler-operasyon-masasi.md` |

**Ortak not:** `pnpm build` compile+lint yeşil; paketleme `.next/build-manifest.json` ENOENT (tekrar `pnpm stop-dev` → `pnpm build`).

**Director aksiyonu (REVIZE):**
1. `#17` `/teklifler` — `teklifler-operasyon-mock.ts` tablo tarihleri + bağlam yetkili/tarih PNG.
2. `#18` `/teklifler/yeni` — `TYH_DRAFTS` 3 taslak kartı bire bir.
3. `#13–14, #16` katman — sekme şeritleri (6–8 sekme PNG) + `KATMAN_CONTEXT` müşteri kodu; `TIMELINE_EVENTS` / stok metinleri.
4. `#28` `/siparisler` — `SIP_TABLE_ROWS` + bağlam müşteri unvanları PNG.

**Director aksiyonu (qa-pass → done adayı):** `#10` detay, `#12` katman müşteri, `#29` sipariş yeni hub, `#38` cariler liste.

### 2026-05-27 — QA turu: W1/W6 batch (5 ekran) — Design Auditor

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `gelen-kutu-operasyon-paneli` | /gelen-kutu | **PASS** | `docs/design/qa-reports/gelen-kutu-operasyon-paneli.md` |
| `arsiv-operasyon-merkezi` | /arsiv | **PASS** | `docs/design/qa-reports/arsiv-operasyon-merkezi.md` |
| `rapor-operasyon-merkezi` | /raporlar | **FAIL** | `docs/design/qa-reports/rapor-operasyon-merkezi.md` |
| `hizli-satis-masasi` | /hizli-satis | **FAIL** | `docs/design/qa-reports/hizli-satis-masasi.md` |
| `onaylar-komut-masasi` | /onaylar | **FAIL** | `docs/design/qa-reports/onaylar-komut-masasi.md` |

**Scroll testi:** Beş route HTTP 200; body scroll yok (CSS `overflow: hidden` + canlı 1440×900). `pnpm build` bu turda dev açık olduğu için koşturulamadı.

**Director aksiyonu (zorunlu — yalnızca Director `done` yapar):**
1. **qa-pass (#3, #6)** → Director final sign-off → `done` (gelen-kutu, arsiv).
2. **REVIZE (#5, #7, #68)** → mock PNG bire bir; ardından yeniden `qa-review`:
   - `hizli-satis-masasi-mock.ts` — 6 ürün satırı + ara/KDV + Onaylayan/Onay Tarihi
   - `rapor-operasyon-mock.ts` — KPI trend %, tablo dönem/fark, bağlam tarih/aksiyonlar
   - `onaylar-komut-masasi-mock.ts` — 2025 tarihleri, UR-10001 Rulman detayı, Müşteri Onayı etiketi
3. QA PASS sonrası Director `qa-pass` / `done` — implementer veya auditor **asla** `done` işaretlemez.

### 2026-05-27 — Re-QA batch (post-REVIZE): hizli-islem, whatsapp, dashboard, ana-sayfa

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `hizli-islem-merkezi` | /hizli-islem | **PASS** | `docs/design/qa-reports/hizli-islem-merkezi.md` |
| `whatsapp-operasyon-paneli` | /whatsapp | **PASS** | `docs/design/qa-reports/whatsapp-operasyon-paneli.md` |
| `dashboard-operasyon-acik-mod` | /dashboard | **PASS** | `docs/design/qa-reports/dashboard-operasyon-acik-mod.md` |
| `ana-sayfa-emerald-gold-acik-mod` | /ana-sayfa | **PASS** | `docs/design/qa-reports/ana-sayfa-emerald-gold-acik-mod.md` |

**Kuyruk:** #1, #4, #9, #70, #85 → `qa-pass` (Director yalnızca `done` işaretler).

**Director aksiyonu:**
1. Final sign-off → `done` (4 ekran).
2. `pnpm stop-dev` → `pnpm build` doğrulaması (QA turunda dev aktifti).
3. Kozmetik kabuk: paylaşılan AppShell’de **Teklifler** menüsü operasyon PNG’lerinde yok — isteğe bağlı temizlik veya kabul.

---

### 2026-05-27 — QA turu: Teklifler batch + W1/W6 (hizli-satis, raporlar, onaylar) — Design Auditor

**Özet:** 10 ekran — **1 PASS**, **9 FAIL**

| Slug | Route | Karar | Rapor |
|------|-------|-------|-------|
| `teklifler-operasyon-masasi` | /teklifler | **FAIL** | `docs/design/qa-reports/teklifler-operasyon-masasi.md` |
| `teklifler-yeni-hub` | /teklifler/yeni | **FAIL** | `docs/design/qa-reports/teklifler-yeni-hub.md` |
| `teklifler-katman-ozet` | /teklifler/katman/ozet | **FAIL** | `docs/design/qa-reports/teklifler-katman-ozet.md` |
| `teklifler-katman-satirlar` | /teklifler/katman/satirlar | **FAIL** | `docs/design/qa-reports/teklifler-katman-satirlar.md` |
| `teklifler-katman-timeline` | /teklifler/katman/timeline | **FAIL** | `docs/design/qa-reports/teklifler-katman-timeline.md` |
| `teklifler-katman-belgeler` | /teklifler/katman/belgeler | **PASS** | `docs/design/qa-reports/teklifler-katman-belgeler.md` |
| `teklifler-katman-donusum` | /teklifler/katman/donusum | **FAIL** | `docs/design/qa-reports/teklifler-katman-donusum.md` |
| `hizli-satis-masasi` | /hizli-satis | **FAIL** | `docs/design/qa-reports/hizli-satis-masasi.md` |
| `rapor-operasyon-merkezi` | /raporlar | **FAIL** | `docs/design/qa-reports/rapor-operasyon-merkezi.md` |
| `onaylar-komut-masasi` | /onaylar | **FAIL** | `docs/design/qa-reports/onaylar-komut-masasi.md` |

**Scroll testi:** Tüm hedef route’larda `*-reference.css` + `overflow: hidden` sözleşmesi; body scroll yok (CSS + önceki canlı tur). `pnpm build` bu turda koşturulmadı.

**Paralel REVIZE notu:** `#5` hizli-satis, `#7` raporlar, `#68` onaylar — mock hâlâ PNG’den sapıyor; REVIZE tamamlanınca yeniden `qa-review`.

**Director aksiyonu:**
1. **qa-pass (#11)** → Director `done` adayı: `teklifler-katman-belgeler` (kozmetik işlem ikonları isteğe bağlı).
2. **REVIZE** → `#17` liste tablo/bağlam tarih; `#18` `TYH_DRAFTS`; `#13` sekme sırası + `M-10015`; `#14` 7’li Kalemler şeridi + satır/stok metinleri; `#16` çift sekme şeridi + `TIMELINE_EVENTS`; `#15` `DONUSUM_*` stepper/stok.
3. **REVIZE (W1/W6)** → `#5` ara 4.025 / KDV 805; `#7` KPI trend % + bağlam; `#68` 2025 tarih + Rulman 6205 2RS detayı.

---

### 2026-05-27 — REVIZE batch (qa-fail → qa-review)
- **Implementer:** W1/W0 REVIZE — 4 ekran PNG mock hizalaması; `pnpm stop-dev` → `pnpm build` OK.
- **#4 `/hizli-islem`:** `HI_RECENT` 5 satır (Sipariş→Tahsilat→Teslim→Teklif→İade) ref/cari/süre/durum PNG bire bir.
- **#9/#85 `/whatsapp`:** SLA `2s 15dk`, saat `10:24`, `905*******34`, başlangıç `22.05.2025`, önerilen yanıtlar, KPI `Geçen güne göre`.
- **#70 `/dashboard`:** `NAV_ITEMS` içinden Siparişler kaldırıldı (9 menü); akış alt başlığına sondaki nokta.
- **#1 `/ana-sayfa`:** `EG_FLOW` alt başlıkları (Toplam / Bugün vadesi gelen / Onay bekleyen / Yanıt bekleyen); `EG_RECENT` 2025 tarihleri korundu.
- **Kuyruk:** #1, #4, #9, #70, #85 → `qa-review` — Design Auditor yeniden PNG + scroll.
