# Production Data Mode Smoke Report

## Tarih / Ortam

| Alan | Değer |
|------|--------|
| **Tarih** | 2026-05-18 |
| **Branch** | `test/production-data-mode-smoke` |
| **Base commit (main)** | `cb05b48372864d0f09d5f0f22f878928da1e88c0` — `fix(whatsapp): verify outbound qr readiness (#105)` |
| **`NEXT_PUBLIC_USE_DEMO_DATA`** | `false` (dev sunucusu başlatılırken ayarlandı) |
| **Dev server** | `http://localhost:3002` (`PORT=3002`, ayrı süreç) |
| **Karşılaştırma** | `http://localhost:3001` hâlâ varsayılan demo modda çalışıyor olabilir |
| **Auth** | Platform Core giriş formu; yerel demo oturum (`admin@hallederiz.com`) |
| **API** | `http://localhost:4000` — `/health` **200** (yerel API bu smoke sırasında **çalışıyordu**) |

### Demo modu kapatma mekanizması

| Kaynak | Davranış |
|--------|----------|
| **Env** | `NEXT_PUBLIC_USE_DEMO_DATA=false` veya `0` |
| **Kod** | `apps/web/src/lib/data-source.ts` → `dataSourceConfig.useDemoData` |
| **Varsayılan** | Ortam değişkeni yoksa **`true`** (demo mod) |
| **Next.js** | `NEXT_PUBLIC_*` değerleri dev sunucusu **başlatılırken** derlenir; çalışan süreçte sonradan değiştirmek etkisizdir |
| **Yerel override** | PowerShell: `$env:NEXT_PUBLIC_USE_DEMO_DATA="false"; $env:PORT="3002"; pnpm --filter @hallederiz/web dev` |
| **Repo içi .env** | `apps/web` altında commit’li `.env*` dosyası **yok**; isteğe bağlı `.env.local` kullanılabilir |
| **İlgili env** | `NEXT_PUBLIC_API_BASE_URL` (varsayılan `http://localhost:4000`), `NEXT_PUBLIC_TENANT_ID`, `NEXT_PUBLIC_USER_ID`, `NEXT_PUBLIC_SESSION_TOKEN` |

---

## Genel Sonuç

| Kontrol | Sonuç |
|---------|--------|
| **Typecheck** (`@hallederiz/web`) | Geçti |
| **Smoke navigation** | Geçti (21 kritik bağlantı kontrolü) |
| **HTTP (27 route)** | Tümü **200** (oturum öncesi/sonrası Next shell) |
| **Demo kapalı mod — genel** | **Kabul edilebilir** — sayfalar kırılmıyor; demo bantları ve `hz_demo_*` cari fallback **görünmedi** |
| **Önemli koşul** | Bu smoke **yerel API ayaktayken** yapıldı. API kapalıyken liste/detaylar boş kalır veya sessizce boş döner; aşağıdaki “API yok” notlarına bakın |

### Demo mod ile fark (doğrulanan)

| Alan | Demo (`true`, port 3001) | Production data (`false`, port 3002) |
|------|--------------------------|--------------------------------------|
| Dashboard KPI | Sayısal demo değerler + “Örnek veri modu” bandı | `—` + “Canlı veri bekleniyor” + “Canlı özet bağlantısı bekleniyor” |
| Cariler | Demo fallback satırları mümkün | API `sdk.customers.list()`; demo portföy fallback **kapalı** |
| WhatsApp | 6 demo sohbet + demo bandı | API’den gelen konuşma(lar); demo bandı **yok**; bağlantı paneli aynı (canlı kanal yok) |
| Arşiv / Belgeler (boş API) | Demo kayıt listesi + demo bandı | “Kayıt bulunamadı” / 0 kayıt; demo bandı **yok** |
| Onaylar | Demo onay listesi | API listesi (bu ortamda **0 kayıt**); demo bandı **yok** |

---

## Route Bazlı Kontrol Tablosu

Durum: **Açık** = oturum sonrası sayfa yüklendi, anlamlı içerik veya güvenli boş durum. **API+** = yerel API ayaktayken gözlemlenen veri.

| Route | Açılıyor mu? | Veri durumu | Demo/mock sızıntısı | Boş durum güvenliği | Teknik metin/hata | Kalan risk |
|-------|--------------|-------------|---------------------|---------------------|-------------------|------------|
| `/login` | Evet | Shell form | Yok | — | “iskelet” (ürün metni) | P2 kozmetik |
| `/dashboard` | Evet | KPI `—`, canlı bekleme metinleri | Yok | Evet | Yok | Canlı KPI API UI’da yok |
| `/panel` | Evet | `/dashboard` yönlendirmesi | Yok | — | Yok | — |
| `/onaylar` | Evet | API: 0 onay | Yok | “Listeden bir onay satırı seçin” | Yok | Kuyruk bağlı değil mesajı (bilinçli) |
| `/cariler` | Evet | API+: en az 1 cari (Aydin Dekor) | `hz_demo_*` fallback **yok** | Sağ panel: finans bağlı değil | Yok | Liste finans KPI API’den gelmiyor |
| `/cariler/yeni` | Evet | ProductPageShell / needs-api | Yok | Hub uyarısı | Yok | Create API yok |
| `/cariler/customer_1` | Evet | API+: cari detay (seed DB) | Demo-only ID engeli yalnızca `hz_demo_*` | Detay dolu | Yok | `customer_1` seed ile eşleşirse canlı kayıt görünür (beklenen) |
| `/stok` | Evet | API+: ürün satırları | Demo katalog fallback **yok** | “Listeden bir ürün seçin” | Yok | Marka/depo filtreleri boş (API kısmi) |
| `/hizli-islem` | Evet | API cari + stok satırları | Demo bandı **yok** | Cari API’den | Yok | Varsayılan dolu satırlar (UX) |
| `/hizli-islem?customer=customer_1` | Evet | Aydin Dekor seçili | Yok | — | Yok | Aynı |
| `/hizli-islem?product=prod_1` | Evet (HTTP) | Tarayıcıda ayrı doğrulanmadı | — | — | — | `prod_1` eşleşmesi API’ye bağlı |
| `/teklifler` | Evet (HTTP) | Liste API modu | Demo band beklenmez | — | — | Kısa tarayıcı örnekleme |
| `/teklifler/yeni` | Evet | Güvenli hub | Yok | Hub metinleri | Yok | — |
| `/teklifler/yeni?customer=customer_1` | Evet | Hub + cari bağlamı | Yok | Gönderim simülasyonu yok | Yok | — |
| `/siparisler` | Evet (HTTP) | — | — | — | — | Hub/liste pattern teklif ile aynı |
| `/siparisler/yeni` | Evet (HTTP) | Hub | Yok | — | — | — |
| `/siparisler/yeni?customer=customer_1` | Evet (HTTP) | Hub + bağlam | Yok | — | — | — |
| `/tahsilatlar` | Evet (HTTP) | — | — | — | — | — |
| `/tahsilatlar/yeni` | Evet (HTTP) | Hub | Yok | — | — | — |
| `/tahsilatlar/yeni?customer=customer_1` | Evet (HTTP) | Hub + bağlam | Yok | — | — | — |
| `/belgeler` | Evet (HTTP) | API: 0 belge | Yok | “Bir belge seçin” | Yok | — |
| `/belgeler?customer=customer_1&type=statement_pdf` | Evet | 0 kayıt, bağlam bandı | Yok | Önizleme notu (canlı değil) | Yok | Ekstre PDF canlı değil |
| `/archive` | Evet | 0 kayıt | Demo arşiv satırları **yok** | “Kayıt bulunamadı” | Yok | Arşiv API yok |
| `/whatsapp` | Evet | API+: 1 konuşma | 6 demo sohbet **yok** | Bağlantı/QR placeholder | **P2:** kuyruk alt metninde `intent` / `approval` İngilizce karışımı | Kanal hâlâ “canlı değil” (doğru) |
| `/whatsapp?customer=customer_1` | Evet (HTTP) | Cari süzme (API) | Demo band **yok** | — | — | Kısa örnekleme |

---

## Modül Bazlı Riskler

### Dashboard

- **Güçlü:** Demo bandı yok; KPI `—`; “Canlı veri bekleniyor”; öncelik/aktivite boş metinleri güvenli.
- **Risk:** Canlı dashboard snapshot API’si UI’a bağlı değil (bilinen backlog).

### Onaylar

- **Güçlü:** Demo bandı yok; liste API’den; boş listede güvenli seçim metni; “işlem kuyruğu bağlantısı” uyarısı.
- **Risk (P2):** Kayıt varken detayda “AI mutation” ifadesi hâlâ kodda olabilir (bu smoke’ta kayıt yoktu).

### Cariler

- **Güçlü:** `usingDemoFallback` yalnızca `useDemoData && boş liste`; production modda **CUSTOMERS_PORTFOLIO_DEMO_ROWS** kullanılmıyor.
- **Güçlü:** `isCustomersDemoRowId` yalnızca `hz_demo_*` — `customer_1` seed ID’si engellenmez (doğru).
- **Risk (P1):** Liste sağ panelinde hesap özeti production path’te boş (`accounts` API’den doldurulmuyor) → “Finans özeti henüz bağlı değil”.

### Stok

- **Güçlü:** `getStockCatalog()` demo dışında SDK; demo `stockCatalog` import’u kullanılmıyor.
- **Risk (P2):** Marka/fabrika/depo referansları boş dizi; filtre UX kısıtlı. İlk satır otomatik seçilmeyebilir.

### Hızlı İşlem

- **Güçlü:** Cari listesi `sdk.customers` / katalog; demo bandı yok; footer “Gerçek kayıt için onay ve işlem kuyruğu bağlantısı gerekir”.
- **Risk (P2):** Workbench açılışta çok satırlı dolu tablo (bileşen varsayılanı); canlı kayıt yokken operasyon etkisi/ Belge & Kanal “Hazır” etiketleri yanıltıcı olabilir.

### Teklifler / Siparişler / Tahsilatlar

- **Güçlü:** `/yeni` hub’ları demo bandı olmadan güvenli yönlendirme; sahte create yok.

### Belgeler

- **Güçlü:** Demo bandı yok; API boşken 0 kayıt; “Filtreler önizleme amaçlıdır; canlı gönderim…” bilinçli uyarı.
- **Risk:** API’de belge yokken aksiyon butonları görünür (gönderim yine güvenli toast ile).

### Arşiv

- **Güçlü:** `ARCHIVE_USE_DEMO_DATA === false` iken `archive-demo-records` kullanılmaz; boş tablo + “Kayıt bulunamadı”.
- **Güçlü:** Demo bandı (`Örnek veri modu: arşiv listesi…`) **görünmedi**.

### WhatsApp

- **Güçlü:** Demo sohbet seti ve demo bandı yok; API konuşması; bağlantı/QR/gönderim güvenli mesajları korunuyor.
- **Risk (P2):** API seed konuşma metninde teknik alt satır; yan panel “Cari Eşleşmedi” / başlık tutarsızlığı.

---

## Bulunan Blokörler

### P0

Yok — production data modunda sayfa kırılması, demo bandı sızıntısı veya sahte “gönderildi / bağlandı” dili **gözlemlenmedi**.

### P1

| # | Bulgu | Etki |
|---|--------|------|
| 1 | Cariler liste: production path hesap/ledger SDK’dan panelde birleştirilmiyor | Finans özeti her zaman “henüz bağlı değil” |
| 2 | API kapalı ortamda davranış bu raporda **doğrulanmadı** | Liste hook’ları çoğunlukla sessiz `catch → []` (kullanıcıya hata yok) |

### P2

| # | Bulgu |
|---|--------|
| 1 | WhatsApp kuyruk alt metni: `Siparis intent'i approval zincirine baglanir.` |
| 2 | Stok: depo/marka filtreleri boş; sağ panel ilk seçim yok |
| 3 | Hızlı İşlem: varsayılan dolu satır tablosu |
| 4 | Onaylar detay: olası “AI mutation” (kayıt varken doğrulanmalı) |
| 5 | Login “iskelet” ürün metni |

---

## API Kapalı Senaryosu (kod incelemesi — bu smoke’ta çalıştırılmadı)

Aşağıdakiler `useDemoData === false` iken tipik davranıştır; **tahmin değil**, hook/query kaynaklarından:

| Modül | API yok / hata |
|--------|----------------|
| Cariler | `useCustomersData` → boş liste, hata mesajı **göstermez** |
| Stok | `use-stock-data` → boş ürünler |
| Onaylar | API hata → toast/map (inceleme gerekir) |
| WhatsApp | `mapWhatsAppActionError` → Türkçe güvenli metin (PR #105) |
| Dashboard | Zaten boş snapshot |

**Öneri:** Ayrı smoke: API kapalı + `USE_DEMO_DATA=false` + kullanıcıya görünür hata/boş durum tutarlılığı.

---

## Önerilen Sonraki PR’lar

1. **P1:** Cariler production path — `accountSummary` / ledger’ı liste sağ panelinde birleştir veya net “veri yok” KPI.
2. **P2:** WhatsApp API konuşma alt metinlerini kullanıcı diline çevir; teknik `intent`/`approval` kaldır.
3. **P2:** Stok production modda ilk ürünü seç + depo/marka API genişlemesi veya filtre gizleme.
4. **P1:** API hata durumunda ortak boş/hata bandı (en azından cariler, stok, belgeler).
5. **CI:** `NEXT_PUBLIC_USE_DEMO_DATA=false` ile route smoke (Playwright veya mevcut script genişletmesi) — API mock veya test container ile.

---

## Test Komutları (bu rapor dalında)

```powershell
cd C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR
pnpm --filter @hallederiz/web typecheck
pnpm smoke:navigation
```

Production mod dev (manuel):

```powershell
$env:NEXT_PUBLIC_USE_DEMO_DATA="false"
$env:PORT="3002"
pnpm --filter @hallederiz/web dev
```

---

## Referanslar

- `docs/development/PRODUCTION_READINESS_SMOKE_REPORT.md` (demo mod, PR #98–#105)
- `docs/development/LIVE_API_INTEGRATION_MATRIX.md`
- `apps/web/src/lib/data-source.ts`
