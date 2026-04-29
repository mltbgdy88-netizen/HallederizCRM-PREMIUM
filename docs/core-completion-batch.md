# Core Completion Batch

Bu batch, cekirdek operasyon omurgasinda kalan kritik bosluklari kapatmak icin uygulandi.

## Tamamlananlar

1. Auth / tenant / permission hardening
- `request-context` session tenant bilgisini header uzerine tercih edecek sekilde sertlestirildi.
- Session tenant ile istek tenant'i farkliysa `tenant_mismatch` uretilecek sekilde context isaretlendi.
- `assertAuthenticated` guard'i tenant mismatch durumunu `403 forbidden` olarak netlestirdi.

2. Remaining write parity (DB-first guclendirme)
- Commercial core repository icinde `payments` ve `warehouse_orders` icin DB-first read/write path eklendi.
- `payment_receipts` tablosu uzerinden list/get/create/confirm/reverse zinciri guclendirildi.
- `warehouse_orders` tablosu uzerinden list/get/create/assign/start/prepared/cancel zinciri guclendirildi.
- `payment allocations` icin DB modunda deterministic foundation hesaplamasi eklendi.

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
- Payment allocations icin tam line-level kalici tablo yapisi yok; foundation hesaplamasi kullaniliyor.
- Warehouse line/task alt tablolari DB tarafinda temel seviyede.
- Local agent OS-level printer varyasyonlari ve ileri retry politikasi foundation seviyesinde.

## Dogrulama
- `pnpm typecheck`
- `pnpm build`
- `pnpm run smoke:routes`
- `pnpm run smoke:navigation`

