# Core Completion Batch

Bu batch, cekirdek operasyon omurgasinda kalan kritik bosluklari kapatmak icin uygulandi.

## Tamamlananlar

1. Auth / tenant / permission hardening
- `request-context` session tenant bilgisini header uzerine tercih edecek sekilde sertlestirildi.
- Session tenant ile istek tenant'i farkliysa `tenant_mismatch` uretilecek sekilde context isaretlendi.
- `assertAuthenticated` guard'i tenant mismatch durumunu `403 forbidden` olarak netlestirdi.

2. Remaining write parity (DB-first guclendirme)
- Commercial core repository icinde `payments` ve depo emirleri icin DB-first read/write path eklendi.
- `payment_receipts` tablosu uzerinden list/get/create/confirm/reverse zinciri guclendirildi.
- `warehouse_orders` + `warehouse_order_lines` + `warehouse_tasks` DB-first path; siparisten emir `buildWarehouseOrderFromSale` + transaction insert; liste/get cocuk satirlari DB'den.
- `payment allocations` icin satir bazli kalici tablo (`payment_allocations`) ve migration `0011_payment_allocations.sql`; commercial-core repository onayda foundation onerisini bu tabloya yazar, liste/get odemeleri DB allocation ile dondurur.

3. Approval execution completion
- Execution failure mesajina retryability etiketi eklendi: `[RETRYABLE]` / `[NON_RETRYABLE]`.
- Cancel edilen execution'lar audit olayina yazilir hale getirildi.

4. Belge ve output zinciri
- Document render DB insert'i zenginlestirildi (document_no/entity_no/customer/title/preview/create metadata).
- Document delivery record'lari `sent` statuse gecerek `sent_at` ile kaydedilir hale getirildi.
- Print/file job status gecisleri audit/timeline kaydina yazilmaya baslandi.

5. Audit / timeline yayginlasmasi
- Payment confirm/reverse
- Warehouse assign/start/prepared/cancel
- Invoice issue/cancel
- Return approve/receive/complete/cancel
- Local output print/file lifecycle
olaylari icin audit write-back eklendi.

## Hala Foundation Olan Alanlar
- Tahsilat allocation icin coklu hedef (fatura + siparis karma) ve operator duzenleme UI/API henuz tam degil; temel tablo + tek aday siparis foundation persist mevcut.
- Depo satir `prepared_quantity` / gorev durumu icin operasyonel write-back (toplu toplama UI) ve cok-depo senaryolari foundation seviyesinde.
- Fatura / iade hatlarinda ERP stok ledger + hesap mutabakatı onayli execution dispatcher ile baglanacak; `calculateReturnImpact` contract testleri API paketinde.
- Local agent OS-level printer varyasyonlari ve ileri retry politikasi foundation seviyesinde.

## Dogrulama
- `pnpm typecheck`
- `pnpm build`
- `pnpm run smoke:routes`
- `pnpm run smoke:navigation`

