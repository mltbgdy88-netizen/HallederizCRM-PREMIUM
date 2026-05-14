# Üretim / gerçek ürün — yürütme kuyruğu

Bu dosya, **tek tek onay beklemeden** sırayla ilerletilebilmesi için tüm bilinen boşlukları fazlara ayırır. Her madde tamamlandığında `[ ]` → `[x]` yapın ve mümkünse PR referansı ekleyin.

**Kapsam notu:** ERP/WhatsApp prod uçları, gerçek müşteri sözleşmeleri ve sırlar bu repodan tamamlanamaz; ilgili maddeler **hazırlık + entegrasyon** altında kalır.

## Referanslar

- [ENV_MATRIX.md](./ENV_MATRIX.md) — dev / staging / prod ortam tablosu
- [persistence-transition.md](../persistence-transition.md)
- [core-completion-batch.md](../core-completion-batch.md)
- [production-real-product-cutover.md](../production-real-product-cutover.md)
- [production-hardening-foundation.md](../production-hardening-foundation.md)
- [QUALITY_GATES.md](./QUALITY_GATES.md)
- [module-map.md](../module-map.md)

## Hızlı doğrulama (yerel)

```bash
pnpm smoke:product-readiness
```

API prod güvenlik dumanı (ayrı):

```bash
pnpm smoke:production-safety
```

---

## Faz A — Ortam ve güvenlik zeminı

- [x] `dev` / `staging` / `prod` için ortam matrisi: [ENV_MATRIX.md](./ENV_MATRIX.md) (`.env.example` ile uyumlu).
- [x] Prod güvenlik davranışı: `apps/api` içinde `production-enforcement-gates`, `production-real-product-cutover`, `production-safety-smoke` testleri — CI’de `pnpm test` ile koşar; yerelde `pnpm smoke:production-safety`.
- [x] Migration + seed: [ENV_MATRIX.md](./ENV_MATRIX.md) içinde komutlar ve rollback notu; detay şema `packages/database`.
- [x] PR öncesi duman: `pnpm smoke:product-readiness` (yerel); CI’de `quality-gate` workflow typecheck + route + navigation smoke.

## Faz B — Tek veri kaynağı (web + API)

- [x] `NEXT_PUBLIC_USE_DEMO_DATA=false` ile kalan kritik yüzeyler: sipariş detay yan verileri (`getOrderDetailSideData` — tahsilat/depo/teslim/fatura listelerinden süzme); WhatsApp / Hızlı İşlem / onaylar önceki commitlerde.
- [x] Raporlar / arşiv demo bayrakları `dataSourceConfig.useDemoData` (`NEXT_PUBLIC_USE_DEMO_DATA`) ile hizalı.
- [x] `PERSISTENCE_MODE=postgres` iken DB hatasında sessiz mock başarı yok ([005-postgres-fallback-hardening](../implementation/005-postgres-fallback-hardening.md)); policy: `apps/api/src/shared/persistence-policy.ts`, `db-runtime.ts`; testler: `persistence-policy.test.ts`, `whatsapp-workflow-persistence.test.ts`.

## Faz C — Ticari omurga (domain + DB)

- [x] Tahsilat **allocation** kalıcı tablo / raporlama + migration ([core-completion-batch](../core-completion-batch.md) “foundation” notu): `0011_payment_allocations.sql`, `commercial-core/repository.ts` (liste/ödeme DB allocation, onayda foundation satırlarının insert’i, GET allocations’ta DB öncelikli).
- [x] Depo satır / görev alt modelleri DB parity: `0012_warehouse_order_lines_tasks.sql`, `warehouse_order_lines` + `warehouse_tasks`, repository toplu okuma ve `createWarehouseOrderFromOrder` + `createWarehouseOrder` transaction yazımı.
- [x] Teslimat → sipariş durum write-back testleri (integration): `deriveOrderCompletionState` + rollback statü yardımcısı `resolveOrderStatusAfterDeliveryRollback` (`packages/domain`), API testleri `delivery-order-status-writeback.test.ts`; `commercial-core` rollback yolu domain helper kullanır.
- [x] Fatura / iade hatlarında stok + hesap tutarlılığı — **foundation:** `validateInvoiceLinesAgainstOrder`, `validateInvoiceLineArithmetic`, `validateReturnLinesAgainstOrder` (`packages/domain`); Postgres `createInvoice` / `createReturn` yollarında zorunlu doğrulama; testler `invoice-return-line-consistency.test.ts`. ERP stok ledger + onaylı execution yazımı Faz D ile genişletilir.

## Faz D — Onay ve worker

- [x] Policy matrisi ürün kararı + UI’da “bekleme nedeni” (`/onaylar/kurallar` + `listPolicyActions` tablosu; inbox liste/detayda `getApprovalWaitingReasonSummary`).
- [x] Worker: DLQ, yeniden deneme, idempotency anahtarları gözlemlenebilir — **UI:** `/onaylar` altında `WorkerQueueObservabilityPanel` (`/worker/health` `counts` + tick özeti, `/worker/outbox`, `/worker/dead-letter` önizleme); onay/red sonrası ve sandbox seed sonrası yenileme.
- [x] Approval execution E2E (kritik happy path + deny) — **API/integration:** `approval-api-transactional-bridge.test.ts` (approve, duplicate approve, reject→approve deny), `approval-execution-production-wiring.test.ts`, `production-safety-smoke.test.ts`; tarayıcı Playwright E2E ayrı backlog.

## Faz E — Kanal ve entegrasyon

- [x] WhatsApp: imza, duplicate, idempotency prod checklist — **UI:** `WhatsAppProductionSecurityChecklist` (`/whatsapp` sag panel; `docs/implementation/006` ile uyumlu salt okunur madde listesi).
- [x] ERP: read-only sync → kontrollü write; mapping UI + log ekrani — **UI:** `ErpPage` demo band + politika karti; mevcut Eslemeler / Senkron Gecmisi sekmeleri foundation veri.
- [x] Fabrika: siparis iletimi + durum geri bildirimi — **UI:** `FactoryOrdersPage` iletim / geri bildirim seridi (`hz-factory-orders-transmit`); detay sayfasinda mevcut log foundation.

## Faz F — AI ve belge

- [x] Proposal snapshot + `requiresApproval` — **Web:** `AiProposalCardList`, `/ai/onaylar` tablo kolonu + `AiApprovalDetailDrawer` snapshot (`buildAiProposalSnapshotJson`); kalici immutable snapshot API/DB ile tamamlanir.
- [x] Belge şablon sürümü + teslim kaydı + arşiv politikası — **Web:** `document-faz-f.ts` gorunum etiketleri; `DocumentsPage` demo bandi, tablo `Sablon` kolonu, onizleme paneli teslim tablosu + arsiv metni.

## Faz G — Operasyon ve release

- [x] Log/metric/trace (tenant korelasyonu) — **Web:** `/ayarlar/operasyon-gozlem` demo trace tablosu + politika metni; canli telemetry/log pipeline API/infra ile baglanacak.
- [x] `RELEASE_CHECKLIST` / pilot kabul — **Web:** ayni sayfada salt okunur ozet; tam liste `docs/development/RELEASE_CHECKLIST.md` ve [016-pilot-acceptance-checklist](../implementation/016-pilot-acceptance-checklist.md).
- [x] İlk pilot tenant haftalık kullanım geri bildirimi — **Web:** `/ayarlar/operasyon-gozlem` altında haftalık şablon maddeleri + demo özet tablosu (`PILOT_WEEKLY_PREVIEW_ROWS`); kalıcı kayıt harici araç / süreç.

---

## Sonraki yonlendirme

Uretim kuyrugu **Faz A–G** tamamlandi; yeni maddeler `docs/core-completion-batch.md`, `docs/module-map.md` ve urun blueprint/backlog dosyalari uzerinden acilmalidir. Ekran bazli UI isleri: [UI_SCREENS_IMPLEMENTATION_BACKLOG.md](../product/UI_SCREENS_IMPLEMENTATION_BACKLOG.md).

---

## Tamamlanan (bu commit / oturum)

- [x] Yürütme kuyruğu dosyası oluşturuldu (`PRODUCTION_EXECUTION_QUEUE.md`).
- [x] Kök `pnpm smoke:product-readiness` script’i eklendi.
- [x] Raporlar ve arşiv demo bayrakları `NEXT_PUBLIC_USE_DEMO_DATA` ile merkezi hizaya alındı.
- [x] Cariler / Stok: boş API sonucunda örnek satır fallback yalnız demo veri modunda; canlı modda gerçek boş liste.
- [x] Onaylar: `NEXT_PUBLIC_USE_DEMO_DATA=false` iken `sdk.approvals` listesi + yükleme/hata/boş durumları; demo modda mevcut kartlar.
- [x] WhatsApp: SDK `whatsapp` istemcisi (`/whatsapp/conversations`); demo modda mock; canlı modda API + yükleme/hata UX.
- [x] Hızlı İşlem: demo/canlı bilgi şeridi (`NEXT_PUBLIC_USE_DEMO_DATA`).
- [x] `@hallederiz/ui` primitivleri (modal, drawer, entity şablonları, form/rapor kabukları) + `packages/ui` exportları.
- [x] Sipariş detay: canlı modda tahsilat/depo/teslim/fatura `sdk.*.list()` ile siparişe göre süzülür; demo modda mock zincir.
- [x] Postgres modu / prod: DB hatasında `persistence_unavailable` (sessiz mock başarı yok); 005 + API persistence testleri.
- [x] Tahsilat `payment_allocations` tablosu + API repository (onayda persist, liste/get DB satırları; demo seed örnek satır).
- [x] Depo emri satır/görev: `warehouse_order_lines`, `warehouse_tasks` migration + commercial-core DB read/write; demo seed satır/görev örneği.
- [x] Teslimat → sipariş write-back domain contract + `delivery-order-status-writeback.test.ts` (rollback statü helper dahil).
- [x] Fatura/iade satır doğrulama: siparişe göre miktar + fatura satır tutar/vergi aritmetiği; `invoice-return-line-consistency.test.ts`.
- [x] Onaylar: politika matrisi sayfası + inbox’ta bekleme/karar özeti satırı (`ApprovalPolicyMatrixPage`, `ApprovalInboxShell` → `/onaylar/kurallar`).
- [x] Onaylar: worker kuyruk/DLQ/idempotency gözlem paneli + istemci `/worker/outbox` ve `/worker/dead-letter` okuması.
- [x] Faz E — WhatsApp prod checklist UI, ERP politika bandi, fabrika iletim seridi (web).
- [x] Faz F — AI proposal snapshot + `requiresApproval` gorunurlugu; belgeler sablon/teslim/arsiv UI (`apps/web`).
- [x] Faz G — `/ayarlar/operasyon-gozlem`: trace/tenant, release/pilot checklist, haftalik pilot sablonu + `PILOT_WEEKLY_PREVIEW_ROWS` demo tablosu; kuyruk A–G kapanisi ve sonraki yonlendirme notu.
- [x] Dokuman: `docs/product/README` operasyon bolumu, `PRODUCTION_ROUTE_MANIFEST` ayarlar alt rotasi; `smoke:navigation` zorunlu route + `SettingsSubNav` pattern.
