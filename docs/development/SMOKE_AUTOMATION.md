# Smoke Otomasyonu

Manuel üretim doğrulama kontrollerinin script ve CI karşılığı. UI veya API contract değiştirmez; mevcut `scripts/smoke/navigation.cjs` modeli genişletilir.

## Komutlar

| Komut | Ne test eder |
|--------|----------------|
| `pnpm smoke:navigation` | Statik route dosyaları + kritik navigasyon pattern’leri (21 kontrol) |
| `pnpm smoke:production-data` | `NEXT_PUBLIC_USE_DEMO_DATA=false` + canlı API ile HTTP route kabuğu |
| `pnpm smoke:api-offline` | Demo kapalı + erişilemeyen API base (`http://localhost:4999`) ile HTTP route kabuğu |
| `pnpm smoke:all` | Sırayla: navigation → production-data → api-offline |

İlgili mevcut komutlar (değişmedi):

- `pnpm smoke:routes` — sayfa dosyası varlığı
- `pnpm smoke:e2e` — routes + navigation

## Ortam değişkenleri

| Değişken | Varsayılan | Kullanım |
|----------|------------|----------|
| `NEXT_PUBLIC_USE_DEMO_DATA` | (script tarafından set) | Production-data / api-offline script’leri `false` yazar |
| `SMOKE_API_BASE_URL` | `http://localhost:4000` | Production-data health + web (öncelikli; shell’deki offline URL ile karışmaz) |
| `NEXT_PUBLIC_API_BASE_URL` | — | Production-data için yedek (web dev env) |
| `SMOKE_OFFLINE_API_BASE_URL` | `http://localhost:4999` | Api-offline smoke |
| `SMOKE_PRODUCTION_DATA_PORT` | `3198` | Production-data dev sunucu portu |
| `SMOKE_API_OFFLINE_PORT` | `3197` | Api-offline dev sunucu portu |
| `SMOKE_SKIP_PRODUCTION_DATA` | — | `1` ise production-data smoke atlanır (exit 0) |
| `SMOKE_PRODUCTION_DATA_REQUIRED` | — | `1` ise API yokken production-data **fail** |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | api-offline: `true` | HTTP shell testinde oturum (isteğe bağlı) |

`NEXT_PUBLIC_*` değerleri **dev sunucusu başlarken** okunur; script her koşuda yeni süreç açar.

## Yerel çalıştırma

### 1. Navigation (API gerekmez)

```powershell
cd C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR
pnpm smoke:navigation
```

### 2. Production data mode (yerel API gerekir)

```powershell
# Terminal 1 — API
pnpm --filter @hallederiz/api dev

# Terminal 2 — smoke (API /health 200 olmalı)
pnpm smoke:production-data
```

API kapalıysa script **exit 0** ile atlar ve uyarı yazar. Zorunlu kılmak için:

```powershell
$env:SMOKE_PRODUCTION_DATA_REQUIRED="1"
pnpm smoke:production-data
```

### Production-data smoke doğrulama notları

| Koşul | Davranış |
|--------|----------|
| Yerel API açık (`SMOKE_API_BASE_URL` / `localhost:4000`, `/health` 200) | `pnpm smoke:production-data` → **24/24** route HTTP kontrolü geçer |
| API kapalı | Varsayılan: uyarı + **exit 0** (skip); CI’ı kırmaz |
| Zorunlu fail | `SMOKE_PRODUCTION_DATA_REQUIRED=1` → API yokken **exit 1** |
| `pnpm smoke:all` | Production-data adımı aynı kurallarla çalışır; API açıkken tam suite geçer |

Health check `SMOKE_API_BASE_URL` kullanır; shell’de kalmış `NEXT_PUBLIC_API_BASE_URL=http://localhost:4999` (offline) ile karışmaz.

### 3. API offline (gerçek API gerekmez)

```powershell
pnpm smoke:api-offline
```

Script geçici olarak `@hallederiz/web dev` başlatır, route listesine HTTP isteği atar, Next hata sayfası / crash HTML arar.

### 4. Tümü

```powershell
pnpm smoke:all
```

## HTTP route listesi

`scripts/smoke/http-smoke-lib.cjs` içindeki liste; manuel raporlarla uyumlu:

`/login`, `/dashboard`, `/panel`, `/onaylar`, `/cariler`, `/cariler/yeni`, `/cariler/customer_1`, `/stok`, `/hizli-islem`, teklif/sipariş/tahsilat hub’ları, `/belgeler`, `/archive`, `/whatsapp` (+ seçili query parametreleri).

Kabul: HTTP **200–399** veya `/login` yönlendirmesi; gövdede Next crash / Internal Server Error yok.

## CI

Workflow: `.github/workflows/smoke.yml`

| Job | Koşar | Not |
|-----|--------|-----|
| `smoke-static` | `pnpm --filter @hallederiz/web typecheck`, `pnpm smoke:navigation` | Her PR / push |
| `smoke-api-offline` | `pnpm smoke:api-offline` | Gerçek API gerekmez |
| `smoke-production-data` | `pnpm smoke:production-data` | Yalnızca `workflow_dispatch` (canlı API gerekir) |

`quality-gate.yml` içindeki `smoke:routes` + `smoke:navigation` adımı aynen kalır.

## Manuel raporlarla ilişki

Otomasyon, aşağıdaki manuel smoke raporlarının **HTTP / statik** alt kümesini tekrarlar; tarayıcı içi finans/KPI doğrulaması yerine geçmez:

- [PRODUCTION_READINESS_SMOKE_REPORT.md](./PRODUCTION_READINESS_SMOKE_REPORT.md)
- [PRODUCTION_DATA_MODE_SMOKE_REPORT.md](./PRODUCTION_DATA_MODE_SMOKE_REPORT.md)
- [API_OFFLINE_SMOKE_REPORT.md](./API_OFFLINE_SMOKE_REPORT.md)

## Bilinen sınırlamalar

- HTTP smoke yalnızca **sayfa kabuğu** seviyesindedir; oturum sonrası finans özeti, KPI veya sağ panel doluluğu doğrulanmaz.
- Production-data smoke CI’da varsayılan olarak **koşmaz** (API yok).
- İlk `next dev` derlemesi 2–4 dakika sürebilir; timeout 240s.
- Windows’ta dev sunucu kapatma `taskkill` ile yapılır; port çakışması olursa `SMOKE_*_PORT` değiştirin.
- Api-offline: Hızlı İşlem ön-doldurulmuş satır şablonları HTTP ile ayrı kontrol edilmez (manuel rapor P1).

## Dosya yapısı

```
scripts/smoke/
  navigation.cjs          # mevcut statik smoke
  http-smoke-lib.cjs      # paylaşılan HTTP + dev server
  production-data.cjs
  api-offline.cjs
  all.cjs
```
