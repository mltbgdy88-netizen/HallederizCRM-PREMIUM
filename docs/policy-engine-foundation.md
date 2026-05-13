# Policy Engine Foundation

Bu faz, HallederizCRM icin kanal-agnostik ve fail-closed merkezi policy karar modelini ekler. Mevcut auth/session, tenant guard, permission guard, approval-first execution, WhatsApp webhook guvenligi ve local-first AI sinirlari korunur.

## Amac

Policy Engine; web, API, worker, WhatsApp, AI ve ileride Instagram/Facebook/Web Chat/Email/SMS gibi kanallardan gelen aksiyonlarin ayni karar sozlesmesinden gecmesini saglar. Bu PR tum domain route'larini refactor etmez; foundation ve sinirli bridge entegrasyonu ekler.

## Action Registry

`packages/domain/src/policy-engine/action-registry.ts` merkezi action kayitlarini tutar. Her action `requiredPermissions`, `criticality`, `defaultEffect`, `approvalRequired`, `auditRequired`, `timelineRequired`, `idempotencyRequired`, `allowedSources` ve opsiyonel channel/usage metadata tasir.

Ilk action seti: `platform.customers.read`, `platform.customers.create`, `platform.customers.update`, `platform.offers.read`, `platform.offers.create`, `platform.orders.read`, `platform.orders.create`, `platform.payments.create`, `platform.documents.generate`, `platform.documents.send`, `platform.whatsapp.reply`, `platform.whatsapp.approval_command`, `platform.ai.propose`, `platform.ai.execute`, `platform.settings.update`, `platform.users.create`, `worker.approval.dispatch`, `worker.audit.timeline.writeback`.

## Decision Effects

- `allow`: Guard ve policy kosullari saglandi; mevcut controlled execution path devam edebilir.
- `deny`: Fail-closed. Route veya worker success gibi davranmamalidir.
- `require_approval`: Mutation veya kritik islem insan onayi olmadan calismaz.
- `dry_run_only`: AI veya foundation path sadece proposal/draft/dry-run uretebilir; gercek mutation kapali kalir.

## Approval-First Guvenlik Cizgisi

Kritik write/execute aksiyonlari permission olsa bile `require_approval` sonucuna gider. Permission, approval yerine gecmez. Approval sonrasi execution idempotency, audit ve timeline metadata zorunluluklarini korur.

## AI Source Siniri

AI proposal uretebilir. AI source kritik execute denemesinde `dry_run_only` veya `require_approval` sinirinda kalir. AI, CRM verisini insansiz degistirecek dogrudan critical mutation path'i alamaz.

## Channel Policy Roadmap

WhatsApp approval command icin signature, approval token, verified phone ve channel window metadata zorunlu foundation olarak modellendi. Instagram, Facebook, Web Chat, Email ve SMS provider implementasyonlari bu PR kapsaminda degildir; yeni kanal eklenirken action registry ve channel policy alanlari kullanilmalidir.

## Usage / Audit Obligations

Policy kararinda tenant match, permission, approval, idempotency key, audit/timeline, human review, channel window ve usage record obligation metadata uretilir. `buildPolicyDecisionUsageEvent` helper'i usage obligation olan kararlar icin tenant usage ledger'a yazilabilir event metadata'si uretir.

## Production Fail-Closed Varsayimlari

Production ortaminda belirsiz demo/local fallback deny edilir. Postgres persistence yerine demo mode gorulurse policy engine fail-closed karar verir. Mevcut signed HttpOnly session, tenant guard ve permission guard davranislari degistirilmez.

## Bu PR'da Yapilmayanlar

- Tam omnichannel inbox
- Instagram/Facebook/Web Chat/Email/SMS gercek provider entegrasyonlari
- Temporal/durable workflow migration
- Butun domain route refactor'u
- Autonomous AI execution
