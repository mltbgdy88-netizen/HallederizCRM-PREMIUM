# Quick Operation — Sipariş + Tahsilat Rework

| Alan | Değer |
|------|--------|
| Branch | `feature/quick-operation-sales-payment-flow` |
| Date | 2026-05-21 |
| Scope | Hızlı İşlem, sipariş+tahsilat, `/tahsilatlar/yeni` form |

## Problem

1. Sipariş (`sale_order`) submit yalnızca `unpaid` sipariş oluşturuyordu; `paidAmount` / ödeme bilgisi işlenmiyordu.
2. `/tahsilatlar/yeni` yalnızca Hızlı İşlem hub’ıydı; gerçek tahsilat formu yoktu.
3. Web submit payload ödeme alanları göndermiyordu.

## Before / After

| Alan | Before | After |
|------|--------|-------|
| Sipariş + ödeme | Sipariş `unpaid`, tahsilat yok | Ödeme girilirse `PaymentReceipt` + sipariş `paidTotal` / `paymentStatus` |
| Tahsilat sayfası | Hub, form yok | `PaymentCreatePage` gerçek form |
| Hızlı İşlem sipariş UI | Ödeme bloğu yok | Ödeme alındı, tutar, yöntem, tarih, referans |
| API `executePayment` | `method: transfer` sabit | Payload yöntemi |
| Approval payload | Ödeme yok | `payment`, `paidAmount`, legacy alanlar korunur |

## Contract (backward compatible)

- `QuickOperationSubmitRequest.payment?: QuickOperationPaymentInput`
- Legacy: `paidAmount`, `paymentMethod`, `paymentReceivedAt`, …
- Response: `createdPaymentId`, `createdPaymentNo`, `orderPaymentStatus`, `paymentRecorded`

## Demo vs canlı

- Demo: canlı create yok (mevcut demo guard).
- Canlı: API quick-op veya `sdk.payments.create`.

## Tests

- `sale_order` + full payment
- Overpayment validation
- Mevcut quick-operations testleri

## Known gaps

- Allocation tablosu DB path’te payment create sonrası manuel eşleştirme bazı ortamlarda açıklama + `paidTotal` ile sınırlı kalabilir.
- Approval execute dispatcher bu PR’da genişletilmedi; payload ödeme bilgisini taşır.
