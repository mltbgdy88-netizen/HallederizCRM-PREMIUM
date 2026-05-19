# API Offline Smoke Report

## Tarih / Ortam

| Alan | Değer |
|------|--------|
| **Tarih** | 2026-05-18 |
| **Branch** | `test/api-offline-smoke-report` |
| **Base commit (main)** | `2c219a4b14615fcc3865c6be5b483a024f37cf70` — `fix(customers): connect production finance summary safely (#107)` |
| **`NEXT_PUBLIC_USE_DEMO_DATA`** | `false` |
| **`NEXT_PUBLIC_API_BASE_URL`** | `http://localhost:4999` (erişilemeyen; yerel API kapalı) |
| **`NEXT_PUBLIC_ENABLE_DEMO_AUTH`** | Birincil senaryoda **yok** (login testi). Korumalı sayfa gezinmesi için ek oturum: `true` (yalnızca SPA içi gezinme; tam sayfa yenilemede oturum düşer) |
| **Dev server** | `http://localhost:3003` (`PORT=3003`) |
| **Karşılaştırma** | `docs/development/PRODUCTION_DATA_MODE_SMOKE_REPORT.md` (API **açık** iken) |

### Ortam notları

- API base env adı repoda: **`NEXT_PUBLIC_API_BASE_URL`** (`apps/web/src/lib/data-source.ts`, `auth-provider.tsx`).
- `NEXT_PUBLIC_*` değerleri dev sunucusu **başlatılırken** okunur; değişiklik için süreç yeniden başlatılmalıdır.
- Başlatma komutu (PowerShell):

```powershell
cd C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR
$env:NEXT_PUBLIC_USE_DEMO_DATA="false"
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:4999"
$env:PORT="3003"
pnpm --filter @hallederiz/web dev
```

---

## Genel Sonuç

| Kontrol | Sonuç |
|---------|--------|
| **Typecheck** (`@hallederiz/web`) | Geçti |
| **Smoke navigation** | Geçti (21 kritik bağlantı) |
| **HTTP shell (27 route)** | Next.js sayfa kabuğu yüklenir (oturum öncesi/sonrası **200** beklenir; derleme süresi uzayabilir) |
| **Kritik kırılma (P0)** | **Yok** — stack trace veya tam sayfa çöküşü gözlemlenmedi |
| **Demo/mock sızıntısı** | Çoğu modülde **yok**; istisna: Hızlı İşlem ön-doldurulmuş satır şablonları (aşağıda P1) |
| **Genel değerlendirme** | **Kısmen kabul edilebilir** — liste/hub ekranları çoğunlukla güvenli boş duruma düşer; **giriş ve oturum** API kapalıyken zayıf |

---

## Route Bazlı Kontrol Tablosu

Durum açıklamaları: **Shell** = sayfa kabuğu açılır; **SPA+** = `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` ile giriş sonrası client-side gezinme; **Login** = demo auth kapalı giriş denemesi.

| Route | Açılıyor mu? | API kapalı davranışı | Teknik hata/metin | Demo/mock sızıntısı | Kalan risk | Öncelik |
|-------|--------------|----------------------|-------------------|---------------------|------------|---------|
| `/login` | Evet | Giriş başarısız; oturum oluşmaz | **Evet:** `API'ye ulaşılamadı (http://localhost:4999). API sunucusunun çalıştığını ve CORS ayarlarını kontrol edin.` | Yok | URL + CORS kullanıcıya görünür | **P1** |
| `/dashboard` | Shell / SPA+ | KPI `—`, “Canlı veri bekleniyor”, öncelik/aktivite boş metinleri | Yok | Yok | — | — |
| `/panel` | Shell | `/dashboard` yönlendirmesi (production smoke ile uyumlu) | Yok | Yok | — | — |
| `/onaylar` | Shell / SPA+ | Liste boş; `ApprovalInboxError` ağ hatasında “Bağlantı kurulamadı…” (kod: `mapApprovalUiErrorMessage`) | Alt başlıkta “worker / outbox” (operatör dili) | Demo bandı **yok** | Worker gözlem panelinde `error.kind` sızabilir | **P2** |
| `/cariler` | Shell / SPA+ | “Henüz cari kaydı yok”; sağ panel “Listeden bir cari seçin” | Yok | Demo portföy fallback **yok** | KPI `—` (finans yok) | — |
| `/cariler/yeni` | Shell / SPA+ | `ProductPageShell` / needs-api hub uyarısı | Yok | Yok | — | — |
| `/cariler/customer_1` | Shell / SPA+ | API yok → detay bulunamadı / boş (beklenen) | Yok | Yok | Seed ID canlıda farklı davranabilir | — |
| `/stok` | Shell / SPA+ | Katalog boş; “Listeden bir ürün seçin” (catch → boş ürün listesi) | Yok | Demo katalog fallback **yok** | — | — |
| `/hizli-islem` | Shell / SPA+ | Alert: “Cari kayıtları şu an yüklenemedi…”; combobox “Cari kaydı yok” (disabled) | Yok | **Ön-doldurulmuş URN satırları** (şablon) hâlâ görünür | Canlı veri sanısı | **P1** |
| `/hizli-islem?customer=customer_1` | Shell / SPA+ | Cari yok; aynı uyarılar | Yok | Aynı satır şablonları | Parametre etkisiz | **P1** |
| `/hizli-islem?product=prod_1` | Shell | `findCatalogProduct` production’da `undefined`; satır şablonu kalır | — | Ürün API’siz eşleşmez | Kısa tarayıcı örnekleme | **P2** |
| `/teklifler` | Shell | Liste boş / hub pattern | Yok | Demo band **yok** | — | — |
| `/teklifler/yeni` | Shell / SPA+ | Güvenli hub metinleri | Yok | Yok | — | — |
| `/teklifler/yeni?customer=customer_1` | Shell / SPA+ | Hub + bağlam; canlı kayıt yok | Yok | Yok | — | — |
| `/siparisler` | Shell | Hub/liste boş | Yok | Yok | — | — |
| `/siparisler/yeni` | Shell / SPA+ | Hub | Yok | Yok | — | — |
| `/siparisler/yeni?customer=customer_1` | Shell / SPA+ | Hub + bağlam | Yok | Yok | — | — |
| `/tahsilatlar` | Shell | Hub/liste | Yok | Yok | — | — |
| `/tahsilatlar/yeni` | Shell / SPA+ | Hub | Yok | Yok | — | — |
| `/tahsilatlar/yeni?customer=customer_1` | Shell / SPA+ | Hub + bağlam | Yok | Yok | — | — |
| `/belgeler` | Shell / SPA+ | `getDocuments()` hata yakalamıyor → muhtemelen boş liste + loading biter | Konsol/network hatası; kullanıcıya zayıf geri bildirim | Yok | Açık hata bandı yok | **P1** |
| `/belgeler?customer=…&type=statement_pdf` | Shell / SPA+ | 0 belge; önizleme notu | Yok | Yok | — | — |
| `/archive` | Shell / SPA+ | `ARCHIVE_USE_DEMO_DATA=false` → “Kayıt bulunamadı” | Yok | Demo arşiv satırları **yok** | — | — |
| `/whatsapp` | Shell / SPA+ | Liste boş; `mapWhatsAppActionError` → bağlantı metni | Yok | Demo sohbet **yok** | QR / bağlantı “bekleniyor” dili korunur | — |
| `/whatsapp?customer=customer_1` | Shell / SPA+ | Eşleşen konuşma yok; boş durum | Yok | Yok | — | — |

---

## Modül Bazlı Bulgular

### Dashboard

- KPI ve kartlar `—` + “Canlı veri bekleniyor”; demo bandı görünmez.
- Öncelik ve aktivite: “henüz bağlı değil” metinleri; teknik hata yok.

### Onaylar

- Liste API hatasında `mapApprovalUiErrorMessage` → “Bağlantı kurulamadı. Sunucuya erişilemiyor.” (iyi).
- Onayla/Reddet: seçim yokken pasif; ağ hatasında toast Türkçe (kod incelemesi).
- Üst alt başlıkta “worker / outbox” terimleri (P2).

### Cariler

- `useCustomersData` catch → boş veri; “Henüz cari kaydı yok”.
- Sağ panel seçim yokken güvenli boşluk; finans `—` / “Finans özeti henüz bağlı değil” (cari yokken).
- `accountSummary` hatası listeyi kırmaz (per-cari try/catch loader).

### Stok

- `useStockCatalogQuery` catch → boş ürünler; demo fallback kapalı.

### Hızlı İşlem

- Cari: güvenli alert + disabled “Cari kaydı yok”.
- Finans paneli: “Finans özeti henüz bağlı değil.”
- **Sorun:** `seedQuickOperationLines()` production modda da dolu satır gösterir (URN-001 vb.) — canlı stok yokken örnek ürün hissi (P1).

### Teklifler / Siparişler / Tahsilatlar

- Hub sayfaları güvenli; doğrudan create API yok; sahte başarı toast’u yok (production smoke ile uyumlu).

### Belgeler

- `DocumentsPage` `getDocuments()` için `.catch` yok; API kapalıyken sessiz boş liste veya geliştirici konsol hatası (P1).

### Arşiv

- Demo kayıt bandı kapalı; “Kayıt bulunamadı”.

### WhatsApp

- Demo konuşma yok; liste hatası sanitize edilmiş Türkçe metin.
- Bağlantı paneli canlı kanal yok dilinde.

### Auth / oturum

- `hydrateSession` → `/auth/session` başarısız → `anonymous`.
- **Demo auth kapalı:** giriş yapılamaz; teknik URL mesajı (P1).
- **Tam sayfa yenileme** (ör. adres çubuğundan `/cariler`): oturum düşer, login’e yönlendirme — API kapalıyken uygulama kullanılamaz (P1 operasyonel).

---

## Bulunan Sorunlar

### P0

- Yok (sayfa çöküşü, stack trace, production’da demo portföy/satır listesi sızıntısı — Cariler/Stok/Arşiv tarafında doğrulandı).

### P1

1. **Login ağ hatası metni teknik** — `auth-provider.tsx`: API base URL ve CORS kullanıcıya gösteriliyor.
2. **API kapalıyken oturum sürdürülemez** — Session cookie/API hydrate olmadan tam sayfa yenilemede koruma login’e atar; demo auth olmadan operasyon ekranlarına erişim yok.
3. **Hızlı İşlem satır şablonları** — API kapalı + `USE_DEMO_DATA=false` iken ön-doldurulmuş ürün satırları görünür; canlı veri sanılabilir.
4. **Belgeler liste yükleme** — `getDocuments()` hata yakalamıyor; kullanıcıya “yüklenemedi” bandı zayıf.

### P2

1. Onaylar üst metin: “worker / outbox” operatör jargonu.
2. Worker kuyruk gözlem paneli: ham `error.kind` görünebilir.
3. Hızlı İşlem `?product=` production’da katalog eşleşmesi yok (beklenen; UX notu).
4. Login formu “iskelet” ifadesi (kozmetik).

---

## Önerilen Sonraki PR’lar

1. **API kapalı / ağ hatası kullanıcı metinleri** — Login: “Sunucuya şu an ulaşılamıyor. Bağlantıyı kontrol edip tekrar deneyin.” (URL/CORS kaldır). İsteğe bağlı: `ENABLE_DEMO_AUTH` ile sınırlı yerel oturum belgesi.
2. **Hızlı İşlem offline satırlar** — Production + cari/stok yokken tek boş satır veya “Ürün listesi yüklenemedi” bandı; `seedQuickOperationLines` yalnız demo modda.
3. **Belgeler / ortak fetch wrapper** — Liste sorgularında `.catch` + Türkçe hata bandı (Cariler pattern).
4. **CI offline smoke script** — `API_BASE=dead port` + headless route metin taraması (teknik kelime regex).
5. **Auth unavailable state** — Session hydrate başarısız + daha önce giriş: “Bağlantı kesildi” banner (logout zorlamadan).

---

## Test Komutları (bu rapor dalında)

```text
pnpm --filter @hallederiz/web typecheck   → geçti
pnpm smoke:navigation                     → geçti (21)
```

---

## Follow-up fixes (`fix/api-offline-empty-states`)

| Bulgu | Durum |
|-------|--------|
| **P1** Login teknik URL/CORS metni | Düzeltildi — `mapUserFacingLoginError` |
| **P1** Hızlı İşlem ön-doldurulmuş satırlar | Düzeltildi — `initialQuickOperationLines` yalnız demo modda seed |
| **P1** Belgeler liste `.catch` yok | Düzeltildi — yükleme hatası bandı + boş liste |
| **P1** Oturum tam sayfa yenileme | Düzeltildi — `fix/auth-hydrate-refresh-session`: demo oturum `sessionStorage` + `next` param |
| **P2** Onaylar worker/outbox jargonu | Düzeltildi — kullanıcı metinleri sadeleştirildi |
| **P2** Worker panel `error.kind` sızıntısı | Düzeltildi — `mapApprovalUiErrorMessage` |
| **P2** Login “iskelet” ifadesi | Düzeltildi |
| **P2** Hızlı İşlem `?product=` | Beklenen davranış; production’da boş satır |

Ortak yardımcı: `apps/web/src/lib/user-facing-data-error.ts`

Cariler: API hatasında “Henüz cari kaydı yok” yerine “Canlı veri şu anda alınamıyor.”

---

## Follow-up fixes (`fix/whatsapp-api-offline-error-copy`)

| Bulgu | Durum |
|-------|--------|
| `/whatsapp?customer=…` API offline iken **Failed to fetch** uyarısı | Düzeltildi — `mapWhatsAppInboxError` + `isOfflineLikeError` |
| Oturum tam sayfa yenileme (direct URL) | PR **#111** (`fix/auth-hydrate-refresh-session`) — bu PR kapsamı dışı |

WhatsApp liste hatası: “WhatsApp konuşmaları şu anda alınamıyor.” + “Bağlantı tekrar kurulduğunda iletişim geçmişi yenilenecek.”

---

## Referanslar

- `docs/development/PRODUCTION_DATA_MODE_SMOKE_REPORT.md`
- `docs/development/PRODUCTION_READINESS_SMOKE_REPORT.md`
- `docs/development/LIVE_API_INTEGRATION_MATRIX.md`
