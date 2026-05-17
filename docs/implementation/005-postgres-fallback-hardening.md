# Postgres Fallback Hardening

Bu tur, `PERSISTENCE_MODE=postgres` veya production ortamında veritabanı hatalarının sessizce demo/mock store'a düşmesi riskini kapatır. Amaç, canlı/pilot veri yolunda başarısız DB operasyonlarının başarılı mock cevap gibi görünmesini engellemektir.

**Durum (repo):** Davranış `persistence-policy` + repository `handleDbFailure` ile uygulanır; yürütme kuyruğu `docs/development/PRODUCTION_EXECUTION_QUEUE.md` Faz B ilgili madde tamamlandı olarak işaretlendi.

## Kapatılan Risk

Önceki foundation davranışında bazı repository catch blokları DB sorgusu hata verdiğinde demo store sonucuna dönebiliyordu. Bu davranış development demo için kullanışlı olsa da production/postgres modunda yanlış başarı algısı ve veri tutarsızlığı riski oluşturur.

Yeni davranış:

- `NODE_ENV=production` ise demo/mock fallback kapalıdır.
- `PERSISTENCE_MODE=postgres` ise DB hatası mock fallback'e düşmez.
- DB bağlantısı eksik veya operasyon başarısızsa API kontrollü `persistence_unavailable` hatası döndürür.
- Demo persistence modu mevcut geliştirme/demo deneyimini korur.

## pg Dependency

Postgres executor `pg` modülünü runtime'da kullandığı için dependency doğru workspace paketine eklendi:

- `packages/database/package.json`
- dependency: `pg`
- devDependency: `@types/pg`

Bu sayede `@hallederiz/database` build/runtime yolu kendi Postgres bağımlılığını taşır; dependency yalnızca API paketine eklenmedi.

## Fallback Policy

Merkezi policy:

- `apps/api/src/shared/persistence-policy.ts`

Policy alanları:

- `persistenceMode`
- `isProduction`
- `demoFallbackAllowed`
- `dbFallbackAllowed`
- `shouldThrowOnDbFailure`

Varsayılan `ALLOW_DEMO_FALLBACK=false` değeridir. Development/demo ortamda geçici mock fallback gerekiyorsa açıkça `true` yapılabilir. Production ve postgres modunda false kalmalıdır.

## İlgili Env Değişkenleri

- `PERSISTENCE_MODE`
- `POSTGRES_URL`
- `DATABASE_URL`
- `ALLOW_DEMO_FALLBACK`

Önerilen canlı/pilot ayar:

```env
PERSISTENCE_MODE=postgres
POSTGRES_URL=postgresql://...
ALLOW_DEMO_FALLBACK=false
```

Önerilen local demo ayar:

```env
PERSISTENCE_MODE=demo
ALLOW_DEMO_FALLBACK=false
```

Sadece kontrollü development fallback denemeleri için:

```env
PERSISTENCE_MODE=demo
ALLOW_DEMO_FALLBACK=true
```

## Repository Davranışı

Repository runtime artık postgres modda DB yolunu aktif kabul eder. DB URL yoksa veya sorgu hata verirse catch bloğu önce policy'yi kontrol eder:

- fallback yasaksa `persistence_unavailable` fırlatılır
- fallback açık ve demo/development moddaysa mevcut mock fallback korunur

Business success response shape değiştirilmedi.

## Test Kapsamı

Eklenen testler (`apps/api/src/tests/`):

- `persistence-policy.test.ts`: production + postgres modda fallback kapalıdır; development + demo modda açık flag ile fallback policy izin verebilir; postgres modda DB URL yokken mock başarı dönmez, `503 persistence_unavailable` döner; demo modda DB URL olmadan mevcut demo store davranışı korunur
- `whatsapp-workflow-persistence.test.ts`: WhatsApp workflow store için aynı fail-closed / açık fallback ayrımı

## Sonraki İş

Sıradaki planlı güvenlik işi: WhatsApp webhook security and workflow port.
