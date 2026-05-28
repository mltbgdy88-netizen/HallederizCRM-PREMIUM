# Live Operation Chain Phase 1 Report

## Özet

Phase 1, Hızlı İşlem → Onaylar → (execute/queue) → Teklif/Sipariş/Tahsilat/Belge zincirini **mevcut API/SDK yüzeyi** üzerinden netleştirir. Sahte başarı mesajları kaldırıldı; canlı/demo ayrımı korundu; kullanıcı metinleri standart Türkçe operasyon diline çekildi. Yeni backend endpoint veya API contract değişikliği yapılmadı.

**Branch:** `feat/live-operation-chain-phase-1`  
**Commit:** `feat(operations): connect live operation chain phase 1`

---

## Değişen modüller

| Alan | Dosyalar |
|------|----------|
| Ortak rotalar | `apps/web/src/lib/operation-entity-links.ts` |
| Hızlı İşlem | `quick-operation-messages.ts`, `quick-operation-submit-feedback.ts`, `use-quick-operation-state.ts`, `QuickOperationPage.tsx`, test |
| Onaylar | `approval-action-messages.ts`, `approval-action-feedback.ts`, `map-approvals-to-inbox.ts`, `ApprovalInboxPage.tsx`, test |
| Hub’lar | `OfferCreateHub.tsx`, `OrderCreateHub.tsx`, `PaymentCreateHub.tsx` |
| Tipler | `packages/types/src/quick-operations.ts` (`approvalId?` opsiyonel) |
| Smoke | `scripts/smoke/navigation.cjs` |
| Dokümantasyon | Bu rapor |

---

## Mevcut canlı endpoint/SDK haritası

| Uç | API (`apps/api`) | SDK (`packages/sdk`) | Web kullanımı |
|----|------------------|----------------------|---------------|
| Quick-op önizleme | `POST /quick-operations/preview` | `QuickOperationsClient.previewQuickOperation` | Henüz UI’da bağlı değil (Faz 2) |
| Quick-op gönder | `POST /quick-operations/submit` | `QuickOperationsClient.submitQuickOperation` | `submitQuickOperationRecord` → canlı modda SDK |
| Onay listesi/detay | `GET /approvals`, `GET /approvals/:id` | `ApprovalsClient.list/detail` | `ApprovalInboxPage` |
| Onayla / Reddet | `POST /approvals/:id/approve\|reject` | `approve`, `reject` | `approveApprovalMutation`, `rejectApprovalMutation` |
| İşleme al (execute) | `POST /approvals/:id/execute` | `execute` | `executeApprovalMutation` (demo modda blok) |
| Teklif listesi/detay | `GET /offers` … | `OffersClient` | Liste/detay; **POST create yok** |
| Sipariş listesi/detay | `GET /orders` … | `OrdersClient` | Liste/detay; **POST create yok** |
| Tahsilat listesi/detay | `GET /payments` … | `PaymentsClient` | Liste/detay; **POST create yok** |
| Belgeler | `GET/POST /documents/*` | `DocumentsClient` | `render`, `regenerate`, `queue*`, `send*` — demo’da toast blok |
| Cari | `GET /customers` … | `CustomersClient` (read) | Hızlı İşlem cari feed canlıda `loadQuickOperationCustomers` |

### Submit yanıt alanları (`QuickOperationSubmitResponse`)

| Alan | Backend (quick-operations service) | Phase 1 UI |
|------|-----------------------------------|------------|
| `ok` | Evet | Doğrulama / hata ayrımı |
| `mode` | `foundation` \| `executed` | Mesaj dallanması |
| `createdEntityType/Id/No` | offer/order/payment/delivery/return oluşturulunca dolu | Detay linki (`/teklifler/{id}` vb.) |
| `approvalId` | **Henüz API dönmüyor** | Tip opsiyonel; varsa `/onaylar/{id}` |
| `documentIds` | Boş (belge job Faz 2) | İlk id → `/belgeler/{id}` |
| `workflowImpacts` | Domain etkileri | Sanitize (teknik/sahte başarı filtresi) |

### Execute sonrası

- API: `runApprovalExecution` → `{ item: approval, execution }`
- `execution.status`: `pending` \| `authorized` \| `executed` \| `failed`
- UI: `resolveExecuteFeedback` → işlendi / kuyruk / başarısız (teknik terim yok)
- Onay `entityType` + `entityId` → `resolveApprovalEntityLink` ile modül detay rotası

### Worker / outbox

- Transactional bridge: `apps/api` içinde `executeApprovalWithOutboxBridge` (testli)
- Web’de worker/outbox terimleri kullanıcıya gösterilmez

---

## Hızlı İşlem submit zinciri

1. Demo: `submitQuickOperationRecord` → `mode: "foundation"`, sahte entity id; **taslak** mesajları, Onaylar linki yok.
2. Canlı: `sdk.quickOperations.submitQuickOperation` → yanıt parse → `resolveSubmitFeedback`.
3. **executed** + entity id → detay linki + “kaydı hazırlandı” ( “oluşturuldu” yok).
4. **foundation** / entity yok → “İşlem onaya gönderildi.” + kuyruk metni + `/onaylar` (veya `approvalId` varsa `/onaylar/{id}`).
5. Ağ hatası → `isOfflineLikeError` → “Bu işlem henüz canlı yürütmeye bağlı değil.”

Cari kataloğu canlıda `getCustomers()` ile yüklenir (`loadQuickOperationCustomers`). Ürün satırı ekleme canlıda `findCatalogProduct` hâlâ demo stok kataloğuna bağlı — **Faz 2**.

---

## Onaylar execute zinciri

| Durum | Onayla/Reddet | İşleme Al |
|-------|---------------|-----------|
| `pending` | Aktif | Kapalı (“Önce onaylayın…”) |
| `approved` | Kapalı | Aktif (canlıda `execute`) |
| `executed` | Kapalı | Kapalı |

Demo modda execute gerçek çağrı yapılmaz; önizleme toast’ı.

Inbox detay paneli: `relatedRecordHref` artık gerçek entity rotasına gider (teklif/sipariş/tahsilat/belge…).

---

## Teklif / Sipariş / Tahsilat hub durumu

- `/teklifler/yeni`, `/siparisler/yeni`, `/tahsilatlar/yeni` → hub + Hızlı İşlem yönlendirmesi.
- `?customer=` ve `?order=` korunur.
- Doğrudan create formu **yok** (SDK POST yok).
- Metin: “Hızlı İşlem’de hazırlayın, onaya gönderin; onay sonrası kayıt işlenecek.”

---

## Belgeler bağlantı durumu

- SDK: `documents.render`, `regenerate`, `queueSave`, `queuePrint`, `sendWhatsApp`, `sendEmail`.
- Demo: mutation toast ile blok (`document-action-feedback`).
- Canlı: `DocumentsPage` `runLiveAction` ile çağırır; kuyruk/PDF başarı UI kanıtı sınırlı.
- Hızlı İşlem belge segmenti → `documentIds` ile detay linki hazır; binary PDF indirme **Faz 2**.

---

## Demo / production davranışı

| | Demo (`NEXT_PUBLIC_USE_DEMO_DATA=true`) | Production (`false`) |
|--|----------------------------------------|----------------------|
| Hızlı İşlem submit | Foundation, taslak mesajı | Gerçek API submit |
| Onay execute | Toast; API çağrısı yok | `POST .../execute` |
| Hub’lar | Önizleme bandı | Zincir metni, Hızlı İşlem CTA |
| Cari feed | Demo + portfolio | `sdk.customers.list` |

---

## Kalan boşluklar

1. Quick-op submit → `approvalId` API yanıtına eklenmeli (onay bileti otomatik link).
2. `POST /quick-operations/preview` UI önizleme akışına bağlanmalı.
3. Canlı ürün/stok satır kataloğu (`sdk.stock.list` → workbench).
4. `OffersClient` / `OrdersClient` / `PaymentsClient` **create** (hub dışı doğrudan create).
5. Submit → otomatik onay kaydı + policy snapshot (backend orchestration).
6. Belgeler: PDF binary indirme, queue job durum polling.
7. Arşiv SDK + liste API.
8. WhatsApp outbound SDK.

---

## Faz 2 önerileri

- Quick-op preview endpoint UI bağlantısı.
- Production stok/satır kataloğu.
- Submit yanıtında `approvalId` + audit timeline web gösterimi.
- Belge render/queue E2E smoke (`USE_DEMO_DATA=false`).
- Dashboard `sdk.dashboard.summary` bağlantısı.

---

## Test sonuçları

| Komut | Sonuç |
|-------|--------|
| `pnpm --filter @hallederiz/web build` | (CI/agent çalıştırır) |
| `pnpm --filter @hallederiz/web typecheck` | (CI/agent çalıştırır) |
| `pnpm smoke:navigation` | (CI/agent çalıştırır) |
| `pnpm smoke:api-offline` | (CI/agent çalıştırır) |
| `pnpm smoke:all` | (CI/agent çalıştırır) |
| Unit: `quick-operation-submit-feedback.test.ts` | Güncellendi |
| Unit: `approval-action-feedback.test.ts` | Güncellendi |

---

## Referanslar

- `docs/development/LIVE_API_INTEGRATION_MATRIX.md`
- `docs/development/API_OFFLINE_SMOKE_REPORT.md`
- `docs/product/quick-operation-center.md`
