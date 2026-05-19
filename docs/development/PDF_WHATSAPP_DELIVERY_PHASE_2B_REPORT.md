# PDF + WhatsApp Delivery Phase 2B Report

## Özet

Faz 2B, belge indirme ve WhatsApp iletim için **contract seviyesinde** eksikleri tamamlar: `GET /documents/:id/download-url` (200/202/404), SDK `getDownloadUrl` / `sendOutbound` / `getSession`, web’de güvenli indirme ve outbound hazırlığı. Sahte URL, sahte QR veya sahte “gönderildi” üretilmez.

## Değişen modüller

| Katman | Dosyalar |
|--------|----------|
| Types | `packages/types/src/commercial-operations.ts` — `DocumentDownloadLink`, `DocumentFileStatus`, `WhatsAppSessionSnapshot`, `WhatsAppOutboundPayload`, opsiyonel `Document.downloadUrl` |
| API | `download-contract.ts`, `commercial-operations/routes.ts`, `integrations/routes.ts`, `integrations/service.ts`, `ai-local-output-store.ts` |
| SDK | `base.ts` (`getWithStatus`), `documents.client.ts`, `whatsapp.client.ts` |
| Web belgeler | `document-delivery-utils.ts`, `document-action-feedback.ts`, `DocumentsPage.tsx`, `DocumentDetailPage.tsx`, mesajlar |
| Web WhatsApp | `whatsapp-channel-health.ts`, `whatsapp-outbound-feedback.ts`, `WhatsAppPage.tsx`, mesajlar |
| Test | `document-delivery-utils.test.ts`, `whatsapp-outbound-feedback.test.ts`, `whatsapp-channel-health.test.ts`, `document-download-contract.test.ts` |

## PDF/download endpoint contract

| HTTP | Anlam | Gövde |
|------|--------|--------|
| **200** | Doğrulanmış HTTPS `downloadUrl` var | `{ item: { status: "ready", downloadUrl } }` |
| **202** | Belge var, dosya hazır değil / iş kuyrukta | `{ item: { status: "pending" \| "unavailable", jobId? } }` |
| **404** | Belge yok | `{ message: "Document not found" }` |

Kaynaklar: `Document.downloadUrl`, HTTPS `previewText`, tamamlanmış `file-save` job (URL yoksa yine 202). **Sahte URL dönülmez.**

## Document SDK değişiklikleri

- `documents.getDownloadUrl(id)` → `getWithStatus` ile 202/404 işlenir
- `documents.queueSave` → `FileSaveJob` tipi

## Document UI davranışı

- Önce yerel HTTPS URL; yoksa canlıda `getDownloadUrl` çağrısı
- 202 → “Belge dosyası hazırlanıyor…”
- 404 → “Belge dosyası henüz hazır değil.”
- Offline → “Belge dosyası şu anda alınamıyor.”
- Demo → önizleme toast; sahte indirme yok

## WhatsApp outbound endpoint contract

- **POST `/whatsapp/outbound`** — mevcut; gövde `Partial<WhatsAppMessage>` (`conversationId`, `body`, `type`, …)
- Policy: `whatsapp_outbound`, izinler `integrations.write`, `whatsapp.write`
- Yanıt: `{ item: WhatsAppMessage }` — `status`: `queued` \| `sent` \| `delivered` \| `failed`

## WhatsApp SDK değişiklikleri

- `whatsapp.sendOutbound(payload)`
- `whatsapp.getSession()` → `GET /whatsapp/session`
- `whatsapp.getChannelHealth()` — tip genişletildi

## QR/session contract

- **GET `/whatsapp/session`** — yeni
- `connectionStatus`: `connected` \| `pending` \| `disconnected`
- `qrDataUrl`: yalnızca gerçek `data:image/` veya HTTPS; yoksa placeholder
- **connected** UI’da yalnızca session `connected` iken; health `healthy` tek başına bağlı sayılmaz
- Provider QR üretimi **Faz 2C** (health.details.qrDataUrl şimdilik boş)

## Archive/file-save contract

- `POST /documents/:id/queue-save` → `FileSaveJob` (`id`, `documentId`, `status`, …)
- UI: “Arşiv kaydı kuyruğa alındı.” — `archiveId` / public URL yoksa sahte arşiv başarısı yok
- Canlı arşiv listesi API hâlâ yok (Faz 3)

## Demo / production davranışı

| Mod | İndirme | WhatsApp gönder |
|-----|---------|-----------------|
| Demo | Toast blok | Composer readOnly; gönder demo toast |
| Production | `getDownloadUrl` contract | Outbound yalnızca `session.connected`; aksi halde “Canlı bağlantı gerekir” |

## Kalan boşluklar

1. Kalıcı PDF storage + signed URL üretimi (worker/local-agent)
2. QR provider entegrasyonu (`qrDataUrl` gerçek kaynak)
3. `session.connected` kanıtı (gerçek session store)
4. Arşiv read API + `archiveId` link
5. Onaylı outbound UI (composer → action-request → confirm)

## Faz 2C / Faz 3 önerileri

- **2C:** Storage adapter; completed file-save → `downloadUrl`; WhatsApp session/QR provider
- **3:** Arşiv API; belge–arşiv link; onaylı gönderim akışı

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/types build` | Geçti |
| `pnpm --filter @hallederiz/sdk build` | Geçti |
| `pnpm --filter @hallederiz/api typecheck` | Geçti |
| `pnpm --filter @hallederiz/web typecheck` | Geçti |
| `pnpm --filter @hallederiz/web build` | Geçti |
| `pnpm smoke:navigation` | 24/24 geçti |
| `pnpm smoke:api-offline` | 24/24 geçti |
| `pnpm smoke:all` | Geçti |
| API `document-download-contract.test.ts` | 2/2 geçti |
| Web unit (belge + WhatsApp) | 23/23 geçti |

Browser hızlı kontrol: bu oturumda manuel tarayıcı doğrulaması yapılmadı; `smoke:api-offline` hedef rotaları HTTP ile doğruladı.
