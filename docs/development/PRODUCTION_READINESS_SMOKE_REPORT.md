# Production Readiness Smoke Report

## Tarih / Ortam

| Alan | Değer |
|------|--------|
| **Tarih** | 2026-05-18 |
| **Branch (rapor)** | `chore/production-readiness-smoke-report` |
| **Base commit (main)** | `df81a15b2ab1fd6009966293e8a06e07167bdd7a` — `fix(dashboard): harden dashboard user flows (#98)` |
| **Ortam** | Yerel Next.js dev sunucusu `http://localhost:3001` |
| **Demo mode** | `NEXT_PUBLIC_USE_DEMO_DATA` varsayılan **true** (demo veri + önizleme bantları aktif) |
| **Kimlik doğrulama** | Platform Core giriş formu (demo oturum); korumalı rotalar oturum sonrası açılır |

### Test komutları

```bash
pnpm --filter @hallederiz/web typecheck
pnpm smoke:navigation
```

Browser smoke: Cursor IDE browser, oturum açıkken route gezintisi (aşağıdaki detay).

---

## Genel Sonuç

| Kontrol | Sonuç |
|---------|--------|
| **Typecheck** (`@hallederiz/web`) | Geçti |
| **Smoke navigation** | Geçti (19 kritik bağlantı kontrolü) |
| **Main senkron (PR #98)** | `df81a15` doğrulandı |
| **Browser smoke özeti** | 25 hedef route için sayfa dosyaları mevcut; oturum açıkken örneklenen rotalar açılıyor. Demo bantları ve “canlı değil” mesajları tutarlı. |

### En önemli kalan riskler (özet)

1. **Gerçek backend mutation / onay-işlem kuyruğu** henüz UI’dan bağlı değil (Hızlı İşlem, hub’lar, stok hareketi, cari oluşturma).
2. **WhatsApp** canlı QR / kanal bağlantısı yok; mesaj gönderimi yalnızca taslak/önizleme.
3. **Belge PDF / e-posta / WhatsApp iletimi** önizleme; sahte “gönderildi” kaldırıldı ancak canlı üretim bekliyor.
4. **Production veri modu** (`USE_DEMO_DATA=false`) ile tam regresyon ve rol/yetki smoke yapılmadı.
5. **Onaylar** detay panelinde hâlâ teknik ifade: “AI mutation” (kullanıcı metni sertleştirmesi kalan iş).
6. **E2E / CI browser smoke** otomasyonu yok; bu rapor manuel + kod incelemesi.

---

## Modül Durum Tablosu

| Modül | Route | Durum | UI hazırlığı | Canlı API / işlem kuyruğu | Demo/production güvenliği | Kalan risk | Son hardening |
|-------|--------|--------|--------------|---------------------------|---------------------------|------------|---------------|
| **Onaylar** | `/onaylar` | UI hazır, demo liste | Tam ekran inbox, filtre, sağ panel | İnceleme/onay execution backend’e bağlı | Demo bandı; sandbox notu | Detayda “AI mutation” teknik metni | Kabul edilmiş referans UI |
| **Cariler** | `/cariler`, `/cariler/[id]`, `/cariler/yeni` | Liste/detay hazır; yeni **shell** | Liste + sağ panel + hızlı linkler | `yeni` → ProductPageShell (API yok) | Demo cari listesi; yeni ekran canlı uyarısı | Canlı cari create API | Kabul edilmiş referans UI |
| **Stok** | `/stok` | UI hazır | Liste, modal, satır aksiyonları | Stok hareketi / yeni ürün canlı değil | Önizleme bandı + toast | Onay kuyruğu sonrası stok write | Kabul edilmiş referans UI |
| **Hızlı İşlem** | `/hizli-islem` (+ query) | Workbench hazır | Tam workbench, cari/ürün bağlamı | Kayıt kuyruğu yok; `MSG_NOT_LIVE` / taslak mesajları | Önizleme notları; sahte kayıt yok | Gerçek fiş kaydı + onay zinciri | Kabul edilmiş referans UI |
| **Teklifler** | `/teklifler`, `/teklifler/yeni` | Liste + **güvenli hub** | Liste UI; `yeni` → Hızlı İşlem yönlendirme | Canlı teklif create yok | Önizleme bandı (hub) | Hub sonrası workbench bağlantısı | Teklif/sipariş hardening dalgası |
| **Siparişler** | `/siparisler`, `/siparisler/yeni` | Liste + **güvenli hub** | Aynı hub deseni | Canlı sipariş create yok | Önizleme bandı | Aynı | Teklif/sipariş hardening dalgası |
| **Tahsilatlar** | `/tahsilatlar`, `/tahsilatlar/yeni` | Liste + **güvenli hub** | Liste + PaymentCreateHub | Canlı tahsilat kaydı yok | Önizleme bandı; canlı uyarı metni | PR **#95** |
| **Belgeler** | `/belgeler` (+ query) | Önizleme güvenli | Liste, bağlam bandı, PDF/WA toast | PDF/e-posta/kuyruk canlı değil | Demo bandı; gönderim yapılmaz | PR **#96** |
| **Arşiv** | `/archive` | Önizleme güvenli | Liste, KPI, sağ panel | İndirme/arşiv write canlı değil | Demo bandı | PR **#96** |
| **WhatsApp** | `/whatsapp` (+ `?customer=`) | Bağlantı bekliyor | Tam UI; QR placeholder | Kanal/QR/gönderim yok | Demo bandı; taslak toast | Canlı Meta/kanal entegrasyonu | PR **#97** |
| **Dashboard / Panel** | `/dashboard`, `/panel` | Özet + yönlendirme | KPI, modül şeridi, hızlı aksiyonlar | Canlı KPI API yok (demo snapshot) | Demo/canlı bant ayrımı | `panel` → `dashboard` redirect | PR **#98** |
| **Giriş** | `/login` | Shell | Form + demo alanlar | Production auth ayrı konfig | İskelet metni | Production fail-closed doğrulama | Platform Core |

---

## Sayfa Bazlı Smoke Detayı

Durum kodları: **Açık** = sayfa yüklendi; **UI** = görsel hazırlık; **Sahte başarı** = bilinen yanlış “gönderildi/kaydedildi” yok.

| Route | Açılıyor? | UI durumu | Sahte başarı? | Demo/production ayrımı | Bilinen risk / kalan iş | PR / not |
|-------|-----------|-----------|---------------|------------------------|-------------------------|----------|
| `/login` | Evet | Shell (Platform Core giriş) | Yok | İskelet açıklaması | Production auth + tenant guard | — |
| `/dashboard` | Evet | UI hazır + demo KPI | Yok | “Örnek veri modu…” bandı | Canlı tenant KPI API | **#98** |
| `/panel` | Evet → `/dashboard` | Yönlendirme | Yok | Dashboard ile aynı | Eski panel landing kaldırıldı | **#98** |
| `/onaylar` | Evet | UI hazır | Yok (inceleme toast’ları iş akışı) | Demo bandı | “AI mutation” metni; worker canlı health | Referans UI |
| `/cariler` | Evet | UI hazır | Yok | Demo cari listesi | Production’da boş liste UX | Referans UI |
| `/cariler/yeni` | Evet | Shell / needs-api | Yok | ProductPageShell uyarısı | Cari create API + onay | Referans UI |
| `/cariler/customer_1` | Evet (kod + route) | Detay hazır | Yok | Demo cari | `customer_1` demo ID | Referans UI |
| `/stok` | Evet (route) | UI hazır | Yok | Önizleme bandı | Stok hareketi canlı değil | Referans UI |
| `/hizli-islem` | Evet | Workbench hazır | Yok (`MSG_DRAFT_SAVED`, `MSG_NOT_LIVE`) | Footer: gerçek kayıt uyarısı | Onay + outbox | Referans UI |
| `/hizli-islem?customer=customer_1` | Evet (beklenen) | Bağlam: Aydın Dekor seçimi | Yok | Cari demo | Geçersiz cari toast | Referans UI |
| `/hizli-islem?product=prod_1` | Evet (beklenen) | Ürün URL bağlamı | Yok | `MSG_PREVIEW_PRODUCT` | prod_1 demo eşleşmesi | Referans UI |
| `/teklifler` | Evet (route) | Liste hazır | Yok | Önizleme bandı | Canlı liste API | Hub dalgası |
| `/teklifler/yeni` | Evet (route) | Güvenli hub | Yok | Hub önizleme metni | Hızlı İşlem’e yönlendirme | Hub dalgası |
| `/teklifler/yeni?customer=customer_1` | Evet (route) | Hub + cari bağlamı | Yok | Cari adı çözümleme | Aynı | Hub dalgası |
| `/siparisler` | Evet (route) | Liste hazır | Yok | Önizleme bandı | Canlı liste API | Hub dalgası |
| `/siparisler/yeni` | Evet (route) | Güvenli hub | Yok | Hub metni | Aynı | Hub dalgası |
| `/siparisler/yeni?customer=customer_1` | Evet (route) | Hub + cari bağlamı | Yok | Aynı | Aynı | Hub dalgası |
| `/tahsilatlar` | Evet (route) | Liste hazır | Yok | Önizleme bandı | Canlı tahsilat | **#95** |
| `/tahsilatlar/yeni` | Evet (route) | PaymentCreateHub | Yok | Canlı kayıt uyarısı | Workbench bağlantısı | **#95** |
| `/tahsilatlar/yeni?customer=customer_1` | Evet (route) | Hub + cari | Yok | Aynı | Aynı | **#95** |
| `/belgeler` | Evet (route) | UI hazır | Yok (önizleme toast) | Demo bandı | PDF üretimi | **#96** |
| `/belgeler?customer=customer_1&type=statement_pdf` | Evet (route) | Bağlam bandı + ekstre | Yok | Önizleme | Canlı PDF | **#96** |
| `/archive` | Evet (route) | UI hazır | Yok | Demo bandı | İndirme canlı değil | **#96** |
| `/whatsapp` | Evet | UI hazır; bağlantı yok | Yok | Demo + canlı değil metinleri | QR / gönderim | **#97** |
| `/whatsapp?customer=customer_1` | Evet | Cari bağlamı + süzme | Yok | Aynı | Aynı | **#97** |

**Browser oturumunda doğrudan doğrulanan rotalar (2026-05-18):** `/login`, `/dashboard`, `/panel` (redirect), `/onaylar`, `/cariler`, `/hizli-islem`, `/whatsapp?customer=customer_1`. Diğer rotalar route dosyası + kod incelemesi + önceki hardening smoke ile **Açık (beklenen)** işaretlidir; production cutover öncesi `USE_DEMO_DATA=false` ile tekrar taranmalıdır.

---

## Kalan Üretim Riskleri

### Backend ve işlem kuyruğu

- Gerçek **mutation** girişleri: permission → policy → approval → transaction → audit → outbox.
- **Hızlı İşlem** ve ticari hub’lar yalnızca workbench/önizleme; kayıt oluşturmuyor.
- **Onaylar** execution dispatcher ve worker health production’da fail-closed doğrulanmalı.

### Kanal ve belge

- **WhatsApp:** QR, webhook, outbound mesaj — UI hazır, kanal bağlı değil.
- **Belgeler:** PDF üretimi, e-posta, WhatsApp iletimi — önizleme toast’ları var; canlı yok.

### Veri ve güvenlik

- Demo mock ile production PostgreSQL verisinin **karışmaması** (`USE_DEMO_DATA`, tenant scope).
- **Rol / yetki** bazlı smoke (satış, depo, yönetici) yapılmadı.
- **Onaylar** ve bazın eski panellerde teknik terim kalıntıları (ör. “AI mutation”, “Executable”) — kullanıcı metni temizliği.

### Test otomasyonu

- CI’da **browser smoke** yok; yalnızca `navigation.cjs` statik pattern kontrolü.
- Tam **E2E** (Playwright/Cypress) önerilir.

---

## Sonraki Önerilen İşler

1. **Canlı API bağlantı matrisi** — modül × read × write × onay gereksinimi tablosu (`docs/development` veya `PRODUCTION_EXECUTION_QUEUE.md` ile hizalı).
2. **Backend mutation entegrasyon planı** — Hızlı İşlem → onay → dispatcher sırası.
3. **Yetki / rol smoke** — en az 3 rol ile kritik rotalar.
4. **CI browser smoke** — login fixture + 10–15 kritik route screenshot veya accessibility snapshot.
5. **Production seed / veri senaryoları** — boş tenant, tek cari, yüksek hacim.
6. **Kullanıcı metni son geçiş** — Onaylar detay, eski foundation ekranlarında İngilizce/teknik etiketler.

---

## Merge geçmişi (UI hardening serisi)

| PR | Kapsam |
|----|--------|
| #95 | Tahsilatlar kullanıcı akışı |
| #96 | Belgeler + Arşiv |
| #97 | WhatsApp |
| #98 | Dashboard + Panel |

Önceki kabul edilmiş modüller (Onaylar, Cariler, Stok, Hızlı İşlem, Teklif/Sipariş hub’ları): bu repoda ayrı PR numarası bu raporda sabitlenmedi; UI referans seviyesinde kabul edilmiştir.

---

*Bu belge yalnızca dokümantasyon amaçlıdır; uygulama kodu veya API sözleşmesi değiştirmez.*
