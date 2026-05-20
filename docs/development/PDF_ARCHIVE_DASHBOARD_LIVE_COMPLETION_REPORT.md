# PDF + Archive + Dashboard Live Completion Report

## Özet

Bu faz, belge indirme sözleşmesini HTTPS-only fail-closed davranışına sabitledi, arşiv okuma/indirme API temelini ekledi, `/archive` sayfasını canlı SDK’ya bağladı, dashboard özetini `DashboardClient` üzerinden çekti ve worker `document_render` / `document_archive` handler sözleşmelerini sahte completed olmadan güçlendirdi.

## Değişen modüller

- `packages/types` — `archive.ts`, genişletilmiş `DocumentDownloadLink`
- `apps/api` — download contract, archive routes/service, mock belge HTTPS örneği
- `packages/sdk` — `ArchiveClient`, `sdk.archive`
- `apps/web` — Archive live query, Dashboard live snapshot, document delivery HTTPS
- `packages/domain` — `document-job-handlers.ts`
- `scripts/smoke` — `/gelen-kutu`, `/archive?customer=`

## PDF/download contract durumu

- `GET /documents/:id/download-url` korundu.
- Yalnızca `https://` URL ile **200 ready**.
- HTTP, relative, boş URL kabul edilmez.
- Dosya yok → **404**; hazır değil → **202 pending/unavailable**.
- Sahte URL üretilmez.

## PDF storage metadata durumu

- `DocumentDownloadLink` alanları: `fileUrl`, `storageKey`, `fileId`, `fileName`, `mimeType`, `generatedAt`, `reason`, vb.
- Foundation mock’ta `invoice_pdf` belgesi gerçek HTTPS `downloadUrl` ile test edilebilir.
- Kalıcı S3/signed URL provider **yok** — sonraki faz.

## Document render/regenerate davranışı

- Regenerate mevcut render pipeline’ı kullanır; otomatik HTTPS URL yazımı yok.
- Worker `document_render`: payload doğrulama + renderer yoksa `deferred` (ok: false).
- PDF renderer implementasyonu **bu fazda yok**.

## Archive API

- `GET /archive` — sayfalı liste, `liveReady` bayrağı
- `GET /archive/:id` — detay
- `GET /archive/:id/download-url` — belge download contract delegasyonu
- Foundation: commercial `listDocuments` → archive kayıtları
- Postgres: boş liste + `liveReady: false` veya **503**

## Archive SDK

- `ArchiveClient.list/detail/getDownloadUrl`
- `createHallederizSdk().archive`

## Archive Web UI

- Demo mod: mevcut `ARCHIVE_DEMO_RECORDS`
- Production: `sdk.archive.list()` → UI mapper
- Boş: “Arşiv kaydı bulunamadı.”
- Offline: “Arşiv kayıtları şu anda alınamıyor.”

## Document → Archive bağlantısı

- `queueSave` → jobId varsa “Arşiv işlemi kuyruğa alındı.”
- archiveId varsa arşiv hazır mesajı (sahte arşivlendi yok)

## Dashboard live summary

- Production: `sdk.dashboard.summary()` + `cards()` + `cardTasks()`
- Offline/empty: `—` ve “Canlı veri bekleniyor”
- Demo: mevcut mock snapshot korunur
- Sahte KPI üretilmez

## Worker document handlers

- `document_render` / `document_archive`: tenantId, documentId, idempotencyKey zorunlu
- Renderer/archive repository yoksa **completed değil**, `mutation_executed:false`

## Demo / Production davranışı

| Yüzey | Demo | Production |
|-------|------|------------|
| Archive list | Demo kayıtlar | SDK/API |
| Dashboard KPI | Mock snapshot | API summary (boşsa `—`) |
| Document download | Preview mesajları | HTTPS-only contract |

## Güvenlik ve kullanıcı metinleri

- UI’da API/mock/worker/fallback teknik terimleri filtrelenir.
- Türkçe güvenli mesajlar: hazırlanıyor, alınamıyor, kuyruğa alındı.

## Smoke / test kapsamı

- `document-download-contract.test.ts` — 200/202/404
- `archive-api-contract.test.ts`
- `worker-document-handlers.test.ts`
- `document-download-link.test.ts` (web)
- `dashboard-live-summary.test.ts` (web)
- Smoke: `/gelen-kutu`, `/archive`, `/archive?customer=customer_1`

## Kalan boşluklar

- Gerçek PDF renderer / local-agent storage write-back
- S3 veya signed URL provider
- Postgres archive tablosu ve repository
- Dashboard zengin KPI aggregation (finans/stok/whatsapp)
- E2E browser acceptance

## Sonraki faz önerileri

1. Document render → storage metadata persist + worker live handler
2. Archive DB repository + file-save job → archiveId
3. Dashboard aggregation servisi
4. Production-data smoke archive satırları

## Test sonuçları

Yerel doğrulama komutları (branch push öncesi):

```text
pnpm --filter @hallederiz/types build
pnpm --filter @hallederiz/database build
pnpm --filter @hallederiz/domain build
pnpm --filter @hallederiz/sdk build
pnpm --filter @hallederiz/api typecheck
pnpm --filter @hallederiz/web typecheck
pnpm --filter @hallederiz/web build
pnpm test
pnpm test:web-navigation
pnpm smoke:routes
pnpm smoke:navigation
pnpm smoke:api-offline
pnpm smoke:all
```

Sonuçlar (2026-05-20, branch `feat/pdf-archive-dashboard-live-completion`):

| Komut | Sonuç |
|-------|--------|
| types build | OK |
| domain build | OK |
| sdk build | OK |
| api typecheck | OK |
| web typecheck | OK |
| web build | OK |
| pnpm test | OK — 384/384 |
| test:web-navigation | OK — 3/3 |
| smoke:routes | OK |
| smoke:navigation | OK |
| smoke:api-offline | OK — 26/26 |
| smoke:all | OK |
