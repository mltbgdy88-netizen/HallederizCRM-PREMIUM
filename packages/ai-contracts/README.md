# @hallederiz/ai-contracts

Bu paket, local AI servisinden veya herhangi bir AI planner'dan gelen operation planlarinin backend tarafinda guvenli sekilde validate edilmesi icin temel Zod semalarini saglar.

## Temel ilke

AI hicbir zaman CRM verisini dogrudan degistirmez.

AI sadece:

1. niyeti anlar,
2. operasyon plani uretir,
3. riskleri aciklar.

Gercek islem yalnizca backend'de su zincirden gecer:

```text
policy
-> approval ticket
-> approval executor
-> domain transaction
-> audit_events
-> outbox_events
-> worker
```

## Operation seviyeleri

- `L0_READ_ONLY`: stok, fiyat, siparis durumu gibi sadece okuma islemleri
- `L1_DRAFT`: not, gorev, taslak mesaj, taslak teklif gibi dusuk riskli islemler
- `L2_BUSINESS_MUTATION`: siparis, tahsilat, iade, fatura gibi approval gerektiren islemler
- `L3_EXTERNAL_SIDE_EFFECT`: WhatsApp gonderimi, belge gonderimi, ERP/fabrika gibi outbox gerektiren islemler

## Yasak operation tipleri

Bu paket `change_user_role`, `change_permission`, `delete_audit_event`, `change_tenant_settings`, `change_secret`, `delete_customer`, `delete_order`, `force_payment_confirm`, `bypass_approval`, `send_erp_without_outbox` gibi operasyonlari allowed operation listesine almaz.

## Kullanim

```ts
import { safeParseAiOperationPlan } from "@hallederiz/ai-contracts";

const result = safeParseAiOperationPlan(aiJson);

if (!result.success) {
  // Reject AI output and show safe error to operator.
}
```

## Bu paket ne yapmaz?

- DB'ye yazmaz.
- CRM mutation yapmaz.
- Approval ticket olusturmaz.
- Worker calistirmaz.
- Policy decision vermez.

Bunlar `apps/api` ve domain service katmaninda yapilmalidir.
