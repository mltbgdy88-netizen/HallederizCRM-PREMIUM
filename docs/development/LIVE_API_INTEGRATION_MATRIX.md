# Live API Integration Matrix

## Amaç

Bu doküman, HallederizCRM web arayüzündeki modüllerin **gerçek canlı API**, **mutation** ve **işlem kuyruğu / onay** ihtiyaçlarını tek tabloda netleştirir. Kaynak: `apps/web` feature katmanı, `apps/web/src/lib/data-source.ts`, `@hallederiz/sdk` client tanımları ve `docs/development/PRODUCTION_READINESS_SMOKE_REPORT.md` (PR #99). Tahmin değil; repoda görülen davranışa dayanır.

Ortak anahtar:

| Ortam değişkeni | Varsayılan | Etki |
|-----------------|------------|------|
| `NEXT_PUBLIC_USE_DEMO_DATA` | `true` | Mock / foundation veri ve önizleme toast’ları |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | `sdk` HTTP tabanı |
| `NEXT_PUBLIC_SESSION_TOKEN` | yok | `ApiClient` oturum başlığı |

Merkezi istemci: `createHallederizSdk()` → `apps/web/src/lib/data-source.ts`.

---

## Mevcut Durum Özeti

### UI güvenli hale getirilen modüller (kullanıcı akışı sertleştirme)

| Modül | Son UI hardening |
|-------|------------------|
| Onaylar, Cariler, Stok, Hızlı İşlem | Kabul edilmiş referans UI (smoke raporu) |
| Teklifler / Siparişler | Hub → Hızlı İşlem; sahte kayıt yok |
| Tahsilatlar | PR **#95** — `PaymentCreateHub` |
| Belgeler / Arşiv | PR **#96** — önizleme toast’ları |
| WhatsApp | PR **#97** — bağlantı / taslak güvenliği |
| Dashboard / Panel | PR **#98** — demo/canlı KPI ayrımı; `/panel` → `/dashboard` |

### Hub / önizleme modunda bekleyen modüller

- `/teklifler/yeni`, `/siparisler/yeni`, `/tahsilatlar/yeni` → hub metni + Hızlı İşlem yönlendirmesi; doğrudan create formları hâlâ hub (SDK `create` hazır).
- `/cariler/yeni` → **canlı modda form + `customers.create`** (demo modda güvenli blok); bkz. `RUNTIME_WORKER_CORE_WRITE_READINESS_REPORT.md`.

### Gerçek canlı işlem bekleyen alanlar

- Hızlı İşlem: **önizleme UI → `POST /quick-operations/preview`**; submit policy onayında **`approvalId`** döner; canlı **cari kataloğu** hâlâ boş olabilir (`buildQuickOperationCustomers()` demo dışında `[]`).
- Stok: satır aksiyonları toast ile bloklanır; **ürün create / stok hareketi SDK’da yok**.
- WhatsApp: **gönderim / QR / outbound** SDK’da yok; yalnızca `listConversations`, `getConversation`.
- Arşiv: yalnızca `archive-demo-records.ts`; **SDK archive client yok**.
- Dashboard: `DashboardClient` (`/dashboard/cards`, `/summary`) tanımlı; **UI kullanmıyor** — demo dışında boş snapshot.

---

## Modül Bazlı Entegrasyon Matrisi

| Modül | Route | Mevcut UI durumu | Mevcut data source / query / hook | SDK / client | Eksik canlı mutation / endpoint | İşlem kuyruğu / onay | Demo/production riski | Önerilen ilk entegrasyon adımı | Öncelik |
|-------|--------|------------------|-----------------------------------|--------------|--------------------------------|----------------------|------------------------|--------------------------------|-----------|
| **Cariler** | `/cariler`, `/cariler/[id]`, `/cariler/yeni` | Liste/detay + **yeni form (canlı)** | `get-customers.ts` + `CustomerCreatePage` → `sdk.customers.create` | `CustomersClient`: GET + **create/update** | Canlı liste hâlâ tenant verisine bağlı | Create onaylı (`platform.customers.create`) | Demo’da create blok | Canlı cari feed + duplicate 409 UX | **P1** |
| **Stok** | `/stok` | Liste/modal hazır; aksiyonlar toast | `get-stock-catalog.ts` → canlı: `sdk.stock.list`, `priceSlots`, `categorySlots`, `exchangeRates` | `StockClient`: GET + PATCH slot/policy; **ürün POST yok** | Ürün create, stok hareketi, rezervasyon write | Stok düşümü onaylı mutation | `MSG_STOCK_MOVE` / `MSG_NEW_PRODUCT` demo’da blok | API stok hareketi + UI `StockPage` handler → API (onay sonrası) | **P1** |
| **Hızlı İşlem** | `/hizli-islem` (+ query) | Workbench; **Önizle + approvalId submit** | `previewQuickOperationRecord` + `submitQuickOperationRecord`; `use-quick-operation-state` | `QuickOperationsClient`: preview, submit | Canlı **cari/ürün kataloğu** boş kalabilir | Submit → pending approval + execute (worker) | Demo taslak; canlı onay id | 1) Canlı katalog 2) Execute sonrası entity link | **P0** |
| **Teklifler** | `/teklifler`, `/teklifler/yeni` | Liste + hub | `get-offers.ts` → canlı: `sdk.offers.list/detail` | `OffersClient`: list, detail, `convertToOrder` | `POST /offers` (create); hub create yapmıyor | Create / convert onaylı | Demo bandı liste; hub güvenli | Hızlı İşlem submit → offer entity veya doğrudan offers create API | **P0** (Hızlı İşlem zinciri ile) |
| **Siparişler** | `/siparisler`, `/siparisler/yeni` | Liste + hub | `get-orders.ts` → canlı: `sdk.orders.list/detail` | `OrdersClient`: list, detail only | `POST /orders`; hub yok | Onaylı sipariş kesinleştirme | Aynı | Quick-op `sale_order` + offers `convertToOrder` | **P0** |
| **Tahsilatlar** | `/tahsilatlar`, `/tahsilatlar/yeni` | Liste + `PaymentCreateHub` | `get-payments.ts` → canlı: `sdk.payments.list/detail/allocations` | `PaymentsClient`: read only | `POST /payments` | Tahsilat onay politikası | PR #95 önizleme | Quick-op `payment` veya payments create | **P0** |
| **Belgeler** | `/belgeler`, detay | Liste/önizleme güvenli | `get-documents.ts` → canlı: `sdk.documents.*` + `documents.service` jobs | `DocumentsClient`: list, detail, `render`, `regenerate`, `sendWhatsApp`, `sendEmail`, `queueSave`, `queuePrint` | Demo’da tüm mutation toast ile blok; canlıda çağrı var ama **PDF/queue başarı UI’da kanıtlanmadı** | `queue*` / send onay + worker | Demo: `PREVIEW_ONLY_TOAST` | `USE_DEMO_DATA=false` + `regenerate`/`render` E2E; liste aksiyonlarını canlıda bağla | **P0** |
| **Arşiv** | `/archive` | Liste UI; demo kayıt | `ARCHIVE_DEMO_RECORDS` only (`archive-demo-records.ts`) | **Yok** (SDK’da archive modülü yok) | Arşiv listesi API, indirme, not ekleme | Düşük (okuma ağırlıklı) | Tamamen demo veri | Archive read API + isteğe bağlı export job | **P2** |
| **WhatsApp** | `/whatsapp` | UI hazır; bağlantı kapalı | `use-whatsapp-inbox.ts` → demo: `whatsapp-mock-data`; canlı: `sdk.whatsapp.listConversations`, `getConversation` | `WhatsAppClient`: read only | Outbound mesaj, QR/session, template send, webhook health | AI öneri → onay; gönderim onay sonrası | Demo bandı; gönderim toast taslak | SDK `sendMessage` + kanal health + UI gönder butonu | **P0** |
| **Onaylar** | `/onaylar` | `ApprovalInboxPage` tam | `ApprovalInboxPage`: **her zaman** `sdk.approvals.list/detail`; `mutations/`: approve, reject, execute | `ApprovalsClient`: list, detail, approve, reject, execute | Execution sonrası domain mutation UI geri bildirimi; worker health canlı doğrulama | **Merkez** — `execute` → dispatcher | Demo bandı; API boşsa liste boş | Production’da execute + audit smoke; “review” → execute akışı netleştir | **P0** |
| **Dashboard** | `/dashboard`, `/panel` | KPI + modül şeridi | Demo: `getDashboardHomeSnapshot()` → `operations-engine-mock-data`; canlı: **boş** `EMPTY_DASHBOARD_HOME_SNAPSHOT` | `DashboardClient`: `cards`, `cardTasks`, `summary` — **kullanılmıyor** | `GET /dashboard/summary` veya cards → `DashboardHomePage` bağlantısı | Yok (read) | Demo KPI canlı sanılmamalı (PR #98 bandı) | `sdk.dashboard.summary()` + snapshot mapper | **P1** |

---

## SDK Özeti (web’in kullandığı uçlar)

| Client | Read (mevcut) | Write (mevcut) | Web’de write kullanımı |
|--------|---------------|----------------|-------------------------|
| `customers` | list, detail, accountSummary, ledger | **create, update** | `/cariler/yeni` canlı |
| `stock` | list, detail, availability, slots, rates | patch slots/policy, **createProduct, updateProduct** | Stok toast (UI sonraki) |
| `quickOperations` | — | preview, submit | Preview + submit + **approvalId** |
| `offers` | list, detail | convertToOrder, **create** | Quick-op onay kuyruğu |
| `orders` | list, detail | **create** | Quick-op onay kuyruğu |
| `payments` | list, detail, allocations | **create** | Quick-op onay kuyruğu |
| `documents` | list, detail | render, regenerate, send*, queue* | Canlı modda `DocumentsPage` / detay |
| `whatsapp` | listConversations, getConversation | — | Yok (taslak toast) |
| `approvals` | list, detail | approve, reject, execute | `ApprovalInboxPage` |
| `dashboard` | cards, cardTasks, summary | — | Yok |

---

## P0 Entegrasyon İşleri

1. **Onay mutation contract (merkez)**  
   - Doğrula: `POST /approvals/:id/approve|reject|execute` production tenant + permission.  
   - UI: `ApprovalInboxPage.runAction` → execute sonrası entity durumu / toast netliği.  
   - Dosyalar: `packages/sdk/src/clients/approvals.client.ts`, `apps/web/src/features/approvals/components/inbox/ApprovalInboxPage.tsx`.

2. **Hızlı İşlem işlem kuyruğu adapter**  
   - Canlı: `sdk.quickOperations.submitQuickOperation` zaten çağrılıyor (`quick-operations.service.ts`).  
   - **Blokör:** `buildQuickOperationCustomers()` canlıda boş — cari/ürün feed (`sdk.customers.list` + `sdk.stock.list`) workbench’e bağlanmalı.  
   - Demo foundation dönüşü (`mode: "foundation"`) production’da kapatılmalı.

3. **Teklif / sipariş / tahsilat oluşturma (workbench çıkışı)**  
   - Backend: quick-op submit → offer/order/payment entity + approval ticket.  
   - Alternatif: ayrı `POST /offers`, `POST /orders`, `POST /payments` (SDK’da henüz yok).  
   - Hub’lar (`OfferCreateHub`, `OrderCreateHub`, `PaymentCreateHub`) submit yapmaz; yalnız yönlendirir.

4. **Belge PDF üretimi adapter**  
   - SDK: `documents.render`, `documents.regenerate`.  
   - UI: demo’da blok; canlıda `runLiveAction` çağırır — production smoke gerekli.  
   - Worker/outbox: `queueSave`, `queuePrint` + `documents.service` job listesi.

5. **WhatsApp outbound adapter**  
   - SDK genişletme gerekli (repoda send ucu yok).  
   - UI: `WhatsAppPage` gönder/taslak — demo toast; canlı endpoint bağlanınca aynı guard’lar korunmalı.

6. **Production data smoke**  
   - `NEXT_PUBLIC_USE_DEMO_DATA=false` ile: boş liste UX, onay inbox, hızlı işlem cari seçimi, belge aksiyonları.  
   - Rapor: `PRODUCTION_READINESS_SMOKE_REPORT.md` güncellemesi.

---

## P1 Entegrasyon İşleri

- **Dashboard:** `sdk.dashboard.summary()` veya `cards()` → `DashboardHomePage` (şu an yalnız mock engine).  
- **Cariler create:** API + `CustomerCreatePage` form (shell kaldırma).  
- **Stok write:** stok hareketi API + `StockPage` toast yerine onaylı submit.  
- **Offers `convertToOrder`:** detay/liste aksiyonlarından canlı smoke.  
- **Rol / yetki:** permission deny senaryoları (read guard’lar `apps/api` tarafında; web smoke ayrı).

---

## P2 Entegrasyon İşleri

- **Arşiv:** read API + isteğe bağlı export; şu an yalnız `ARCHIVE_DEMO_RECORDS`.  
- **Dashboard AI rail:** `DashboardAiAssistantPanel` → `sdk.ai` / sales assistant (ayrı kanal).  
- **Geniş E2E:** Playwright ile P0 rotaları.

---

## Açık Sorular

Repoda **net tanımlı olmayan** (backend / API repo dışı veya UI’da görünmeyen) konular:

1. `POST /quick-operations/submit` yanıt şeması: `mode: "executed" | "foundation" | ...` production’da hangi durumlar döner? (`QuickOperationSubmitResponse` types paketinde).  
2. `POST /approvals/:id/execute` sonrası outbox/worker garantisi ve idempotency.  
3. `POST /documents/render` vs `regenerate` — PDF binary nerede saklanır (local agent vs S3)? `getLocalAgentHealthSnapshot` bağımlılığı.  
4. WhatsApp: Meta Business API mi, iç gateway mi — SDK’da henüz yok.  
5. `CustomersClient` için planlanan create/update route isimleri ve onay policy id’leri (`CustomerCreatePage` metninde `platform.customers.create` geçiyor; API doğrulanmalı).  
6. Arşiv için ayrı domain API mi yoksa documents/audit timeline read mi?

---

## Önerilen PR Sırası

Küçük, gerçek entegrasyona yönelik PR’lar:

| Sıra | PR kapsamı | Repo odak |
|------|------------|-----------|
| 1 | **approvals mutation contract** — execute/approve smoke, fail-closed, toast | `apps/api` + web inbox (minimal) |
| 2 | **quick-operation operation queue adapter** — canlı katalog + submit wiring | `apps/web` quick-operations + API quick-ops |
| 3 | **offer/order create from workbench** — submit → entity veya offers/orders POST | API domain + SDK clients |
| 4 | **payment create from workbench** | payments API + SDK |
| 5 | **document PDF generation adapter** — `USE_DEMO_DATA=false` belge smoke | documents API + web |
| 6 | **WhatsApp outbound adapter** — SDK + UI gönderim (onaylı) | API whatsapp + web |
| 7 | **production data smoke** — doküman + script/CI checklist | `docs/development` + smoke script |

> Not: Bu sıra yalnızca entegrasyon planıdır; bu commit **kod veya API contract değiştirmez**.

---

## İlgili dokümanlar

- `docs/development/PRODUCTION_READINESS_SMOKE_REPORT.md` (PR #99, commit `0489f6c`)  
- `apps/web/src/lib/data-source.ts`  
- `packages/sdk/src/index.ts`  
- `docs/approval-execution-flow.md` (varsa backend onay zinciri — web dışı doğrulama önerilir)

---

*Son güncelleme: main @ `0489f6c404dbd3aea5bf1688d95314df202592ab`*
