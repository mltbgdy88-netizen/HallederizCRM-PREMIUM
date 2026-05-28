# 015 — Quick Operation Delivery/Return Execution Binding

## Bu PR ne ekledi
Bu adimda Hizli Islem submit akisinda `delivery` ve `return` operation type'lari kontrollu sekilde mevcut commercial service path'lerine baglandi.

## Delivery binding davranisi
- `operationType=delivery` icin `orderId` referansi ile execution denenir.
- Siparis referansi yoksa execution calismaz, validation/foundation sonucu doner.
- Basarili path'te:
  - `mode: "executed"`
  - `createdEntityType: "delivery"`
  - `createdEntityId`, `createdEntityNo`
- Workflow impact tarafinda su etkiler gorunur:
  - delivery kaydi olusturma
  - depo hazirlik kontrolu
  - odeme durumu kontrolu
  - belge onizleme uygunlugu

## Return binding davranisi
- `operationType=return` icin mevcut `createReturn` path'i kullanilarak iade kaydi olusturma denenir.
- Iade icin aciklama/sebep (`note` veya `reason`) zorunlulugu eklendi.
- Basarili path'te:
  - `mode: "executed"`
  - `createdEntityType: "return"`
- Workflow impact tarafinda:
  - `return_review_required`
  - `return_approval_may_be_required`
  - `stock_finance_impact_pending`
  - `document_preview_available`

## Neden return dogrudan stok/finans mutate etmiyor
Bu turda iade kaydini acmak ve inceleme/approval etkisini gorunur kilmak hedeflendi.
Stok/finans nihai mutasyonu iade inceleme/onay akisindan sonra yapilacak sekilde bilincli olarak ertelendi.

## Side action guncellemeleri
Delivery ve return icin side actions guncellendi:
- Delivery belge basligi: `Teslim Fisi Onizleme`
- Return belge basligi: `Iade Talebi Onizleme`
- WhatsApp taslak metinleri delivery/return odakli
- AI insight metinleri delivery/payment kontrolu ve return approval/stok-finans etkisi odakli

## Bu turda yapilmayanlar
- Gercek WhatsApp send
- PDF binary render
- AI execution

## Sonraki is
- Real document render + WhatsApp send approval
- Pilot acceptance polish
