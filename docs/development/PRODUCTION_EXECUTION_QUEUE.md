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
- [ ] Teslimat → sipariş durum write-back testleri (integration).
- [ ] Fatura / iade hatlarında stok + hesap tutarlılığı (onaylı mutation zinciri).

## Faz D — Onay ve worker

- [ ] Policy matrisi ürün kararı + UI’da “bekleme nedeni”.
- [ ] Worker: DLQ, yeniden deneme, idempotency anahtarları gözlemlenebilir.
- [ ] Approval execution E2E (kritik happy path + deny).

## Faz E — Kanal ve entegrasyon

- [ ] WhatsApp: imza, duplicate, idempotency prod checklist ([004-whatsapp](../implementation/004-api-read-guards.md) ailesi).
- [ ] ERP: read-only sync → kontrollü write; mapping UI + log ekranı.
- [ ] Fabrika: sipariş iletimi + durum geri bildirimi.

## Faz F — AI ve belge

- [ ] Proposal snapshot + `requiresApproval` uçtan uca.
- [ ] Belge şablon sürümü + teslim kaydı + arşiv politikası.

## Faz G — Operasyon ve release

- [ ] Log/metric/trace (tenant korelasyonu).
- [ ] `RELEASE_CHECKLIST` / pilot kabul ([016-pilot-acceptance-checklist](../implementation/016-pilot-acceptance-checklist.md)).
- [ ] İlk pilot tenant haftalık kullanım geri bildirimi.

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
