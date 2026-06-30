# Smoke Otomasyonu

Manuel üretim doğrulama kontrollerinin script ve CI karşılığı. UI veya API contract değiştirmez; mevcut `scripts/smoke/navigation.cjs` modeli genişletilir.

## Komutlar

| Komut | Ne test eder |
|--------|----------------|
| `pnpm smoke:navigation` | Statik route dosyaları + kritik navigasyon pattern'leri (24 kontrol) |
| `pnpm smoke:production-data` | `NEXT_PUBLIC_USE_DEMO_DATA=false` + canlı API ile HTTP route kabuğu (`next build` + `next start`) |
| `pnpm smoke:api-offline` | Demo kapalı + erişilemeyen API base (`http://localhost:4999`) ile HTTP route kabuğu (`next build` + `next start`) |
| `pnpm smoke:all` | Sırayla: navigation → production-data → api-offline |

İlgili mevcut komutlar (değişmedi):

- `pnpm smoke:routes` — sayfa dosyası varlığı
- `pnpm smoke:e2e` — routes + navigation

## Ortam değişkenleri

| Değişken | Varsayılan | Kullanım |
|----------|------------|----------|
| `NEXT_PUBLIC_USE_DEMO_DATA` | (script tarafından set) | Production-data / api-offline script'leri `false` yazar |
| `SMOKE_API_BASE_URL` | `http://127.0.0.1:4000` | Production-data health + web build env (öncelikli) |
| `NEXT_PUBLIC_API_BASE_URL` | — | Production-data için yedek |
| `SMOKE_OFFLINE_API_BASE_URL` | `http://localhost:4999` | Api-offline smoke build env |
| `SMOKE_PRODUCTION_DATA_PORT` | `3198` | Production-data `next start` portu |
| `SMOKE_API_OFFLINE_PORT` | `3197` | Api-offline `next start` portu |
| `SMOKE_SKIP_WEB_BUILD` | — | `1` ise mevcut `.next` kullanılır (aşağıdaki uyarıya bakın) |
| `SMOKE_SKIP_PRODUCTION_DATA` | — | `1` ise production-data smoke atlanır (exit 0) |
| `SMOKE_PRODUCTION_DATA_REQUIRED` | — | `1` ise API yokken production-data **fail** |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | api-offline: `true` | HTTP shell testinde oturum (isteğe bağlı) |

`NEXT_PUBLIC_*` değerleri **build zamanında** Next.js bundle'ına gömülür. Her smoke modu kendi `envExtra` ile build alır.

### `SMOKE_SKIP_WEB_BUILD` uyarısı

`SMOKE_SKIP_WEB_BUILD=1` yalnızca **aynı smoke modunu** tekrar koşarken kullanın (ör. ikinci `production-data` denemesi).

**Farklı smoke türleri arasında skip kullanmayın:**

| Önce | Sonra (skip ile) | Risk |
|------|------------------|------|
| `production-data` (API `4000`) | `api-offline` (API `4999`) | Yanlış `NEXT_PUBLIC_API_BASE_URL` ile test |
| `api-offline` | `production-data` | Aynı şekilde yanlış pozitif/negatif |

Script skip kullanıldığında konsola uyarı yazar.

## Yerel çalıştırma

### 1. Navigation (API gerekmez)

```powershell
cd C:\HallederizCRM-PREMIUM-CURSOR
pnpm smoke:navigation
```

### 2. Production data mode (yerel API gerekir)

```powershell
# Terminal 1 — API
pnpm --filter @hallederiz/api dev

# Terminal 2 — smoke (API /health 200 olmalı)
$env:SMOKE_API_BASE_URL="http://127.0.0.1:4000"
pnpm smoke:production-data
```

API kapalıysa script **exit 0** ile atlar ve uyarı yazar. Zorunlu kılmak için:

```powershell
$env:SMOKE_PRODUCTION_DATA_REQUIRED="1"
pnpm smoke:production-data
```

Hızlı tekrar (aynı mod, build atla):

```powershell
$env:SMOKE_SKIP_WEB_BUILD="1"
pnpm smoke:production-data
```

### Production-data smoke doğrulama notları

| Koşul | Davranış |
|--------|----------|
| Yerel API açık (`SMOKE_API_BASE_URL`, `/health` 200) | `pnpm smoke:production-data` → **29/29** route HTTP kontrolü geçer |
| API kapalı | Varsayılan: uyarı + **exit 0** (skip); CI'ı kırmaz |
| Zorunlu fail | `SMOKE_PRODUCTION_DATA_REQUIRED=1` → API yokken **exit 1** |
| `pnpm smoke:all` | Production-data adımı aynı kurallarla çalışır; API açıkken tam suite geçer |

Health check `SMOKE_API_BASE_URL` kullanır; shell'de kalmış offline URL ile karışmaz.

### 3. API offline (gerçek API gerekmez)

```powershell
pnpm smoke:api-offline
```

Script geçici olarak `next build` + `next start` açar, route listesine HTTP isteği atar, Next hata sayfası / crash HTML arar; api-offline modunda teknik hata sızıntısı (`Failed to fetch`, `ECONNREFUSED`) da kontrol edilir.

### 4. Tümü

```powershell
pnpm smoke:all
```

`smoke:all` sırasında production-data ve api-offline **farklı build env** kullanır; her adım kendi build'ini alır (skip kullanılmaz).

## HTTP route listesi

`scripts/smoke/http-smoke-lib.cjs` içindeki liste (29 rota):

`/login`, `/dashboard`, `/panel`, `/onaylar`, `/cariler`, `/cariler/yeni`, `/cariler/customer_1`, `/stok`, `/hizli-islem`, teklif/sipariş/tahsilat hub'ları, `/belgeler`, `/gelen-kutu`, `/archive`, `/whatsapp`, `/erp`, `/fabrikalar/stoklar`, `/fabrikalar/siparisler` (+ seçili query parametreleri).

Kabul: HTTP **200–399** veya `/login` yönlendirmesi; gövdede Next crash / Internal Server Error yok.

## CI

Workflow: `.github/workflows/smoke.yml`

| Job | Koşar | Not |
|-----|--------|-----|
| `smoke-static` | `pnpm --filter @hallederiz/web typecheck`, `pnpm smoke:navigation` | Her PR / push |
| `smoke-api-offline` | `pnpm smoke:api-offline` | Gerçek API gerekmez; full `next build` (~6–10 dk) |
| `smoke-production-data` | `pnpm smoke:production-data` | Yalnızca `workflow_dispatch` (canlı API gerekir) |

`quality-gate.yml` içindeki `smoke:routes` + `smoke:navigation` adımı aynen kalır.

## Manuel raporlarla ilişki

Otomasyon, aşağıdaki manuel smoke raporlarının **HTTP / statik** alt kümesini tekrarlar; tarayıcı içi finans/KPI doğrulaması yerine geçmez:

- [PRODUCTION_READINESS_SMOKE_REPORT.md](./PRODUCTION_READINESS_SMOKE_REPORT.md)
- [PRODUCTION_DATA_MODE_SMOKE_REPORT.md](./PRODUCTION_DATA_MODE_SMOKE_REPORT.md)
- [API_OFFLINE_SMOKE_REPORT.md](./API_OFFLINE_SMOKE_REPORT.md)

## Bilinen sınırlamalar

- HTTP smoke yalnızca **sayfa kabuğu** seviyesindedir; oturum sonrası finans özeti, KPI veya sağ panel doluluğu doğrulanmaz.
- Production-data smoke CI'da varsayılan olarak **koşmaz** (API yok).
- İlk `next build` 1–3 dakika sürebilir; route probe timeout 90s, sunucu hazır bekleme 180s.
- Windows'ta sunucu kapatma `taskkill` ile yapılır; port çakışması olursa `SMOKE_*_PORT` değiştirin.
- Api-offline: Hızlı İşlem ön-doldurulmuş satır şablonları HTTP ile ayrı kontrol edilmez (manuel rapor P1).
- Oturum yenileme / `next` parametresi: HTTP smoke oturum çerezi veya tarayıcı depolamasını doğrulamaz; demo auth açıkken manuel tarayıcı testi gerekir (`login` → protected route → F5).

## Dosya yapısı

```
scripts/smoke/
  navigation.cjs          # mevcut statik smoke
  http-smoke-lib.cjs      # paylaşılan HTTP + build/start sunucu
  production-data.cjs
  api-offline.cjs
  all.cjs
```
