# 013 - Quick Operation Real Execution Binding (Tur 1)

Bu batch, `Quick Operation` submit akisini kontrollu sekilde mevcut ticari servislere baglar.

## Bu PR ne bagladi
- `offer`:
  - mevcut `SalesCrmService.createOffer` path'i kullanilarak kontrollu execution
- `sale_order`:
  - mevcut `CommercialCoreService.createOrder` path'i kullanilarak execution
- `payment`:
  - mevcut `CommercialCoreService.createPayment` path'i kullanilarak execution

## Offer / Sale Order / Payment davranisi
- Validation her zaman once calisir.
- Validation error varsa execution calismaz, `mode: "foundation"` doner.
- Execution basariliysa `mode: "executed"` doner ve `createdEntityType/Id/No` dolar.

### offer
- Stok rezervasyonu yapmaz.
- `offer_created`, `document_preview_available`, `whatsapp_draft_available` impactleri doner.

### sale_order
- Satirlar mevcut order line modeline maplenir.
- Source secimine gore warehouse/factory/supplier/split-auto impactleri korunur.
- Gercek ticari order kaydi create path'i kullanilir.

### payment
- `paidAmount` veya line toplami sifirdan buyuk degilse validation error doner.
- Basarili create durumunda `payment_recorded` ve `payment_allocation_required` impactleri doner.

## delivery / return neden foundation kaldi
- `delivery` ve `return` bu turda bilincli olarak full execution'a acilmadi.
- Bu iki turde:
  - validation + impact + foundation response
  - `delivery_execution_pending` / `return_review_required` gibi acik status impactleri

## Source selection -> workflow impact mapping
- `center_warehouse` -> `warehouse_prepare`
- `factory` -> `factory_plan`
- `supplier` -> `supplier_procurement`
- `split` -> `multi_source`
- `auto` -> `recommendation_required`

## Production fallback policy notu
- Production/postgres modunda DB hatasi durumunda sessiz mock success uretilmez.
- Mevcut persistence policy/DB failure davranisi korunmustur.

## Bu turda yapilmayanlar
- PDF generation full binding
- WhatsApp gercek gonderim
- AI gercek oneriler/execution
- delivery/return full execution zinciri

## Sonraki is
- Quick Operation document/WhatsApp/AI side actions
- delivery/return execution binding
