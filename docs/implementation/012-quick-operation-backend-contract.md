# 012 - Quick Operation Backend Contract Foundation

## Bu PR ne ekler
- `Quick Operation` icin ortak tipler eklendi: `packages/types/src/quick-operations.ts`
- Domain katmaninda:
  - toplam hesaplama
  - temel validasyon
  - kaynak secimi -> workflow impact mapleme
  eklendi: `packages/domain/src/quick-operations/*`
- API katmaninda iki guarded endpoint eklendi:
  - `POST /quick-operations/preview`
  - `POST /quick-operations/submit`
- SDK katmanina `QuickOperationsClient` eklendi.
- Web tarafinda `/hizli-islem` ekranindaki `Islemi Olustur` aksiyonu yeni backend contract'a baglandi.

## Contract ozeti

### Request
- `QuickOperationSubmitRequest`
  - `operationType`
  - `customerId`
  - `lines[]` (urun, miktar, fiyat, KDV, sourceType vb.)

### Preview response
- write yapmaz
- validasyon issue listesini doner
- toplamlari doner
- workflow impact listesini doner

### Submit response
- bu turda `mode: "foundation"` doner
- ileride gercek execution binding icin hedef entity alanlari korunur:
  - `createdEntityType`
  - `createdEntityId`
  - `createdEntityNo`
- `workflowImpacts`, `validationIssues`, `documentIds`, `auditEventIds` alanlari standard kalir

## Preview vs Submit farki
- `preview`: sadece hesaplama + validasyon + operasyon etkisi onizleme.
- `submit`: ayni validasyon/impact uretir, ayrica draft/entity referansi dondurur.
- Bu adimda ticari cekirdek kayitlara gercek write baglanmamistir.

## Workflow impact mapping
- `center_warehouse` -> `warehouse_prepare`
- `factory` -> `factory_plan`
- `supplier` -> `supplier_procurement`
- `split` -> `multi_source`
- `auto` -> `recommendation_required`

Islem turu ek etkileri:
- `offer` -> `offer_no_reservation`
- `sale_order` -> `sale_order_source_plan`
- `payment` -> `payment_allocation_required`
- `return` -> `return_approval_may_be_required`

## Neden submit simdilik foundation mode
- Bu batch'in amaci backend contract stabilizasyonudur.
- Commercial core write akislari bu adimda bilincli olarak dokunulmadi.
- Sonraki batch'te bu contract, mevcut ticari servislerle kontrollu sekilde execute mode'a gecirilecektir.

## Sonraki is
- Quick Operation real execution binding
  - offer/order/delivery/payment/return write path baglantisi
  - ilgili document/audit entegrasyonu
