# Production Enforcement Gates

Bu dokuman readiness gorunurlugunu zorlayici runtime enforcemenet katmanina tasir.

## Readiness vs Enforcement

- Readiness: Sistem durumunu raporlar (`ready | degraded | blocked`).
- Enforcement: Production modda kritik aksiyonlar icin bu raporu zorunlu kural haline getirir.

## Production Gate Action Turleri

- `critical_mutation`
- `live_provider_send`
- `approval_execution`
- `worker_live_execution`
- `document_send`
- `omnichannel_reply`
- `whatsapp_outbound`
- `settings_update`
- `user_management`
- `commercial_write`
- `local_output`
- `ai_execute`
- `safe_read`

## Bloklama Kurallari

- `NODE_ENV=production` ve readiness `blocked` ise kritik aksiyonlar fail-closed durur.
- `NODE_ENV=production` ve readiness `degraded` ise kritik aksiyonlar live basari olarak raporlanmaz.
- Route caller `productionActionType` vermezse enforcement katmani `actionKey` uzerinden otomatik production action type map eder.
- Yeni kritik action ekleyen gelistirici explicit `productionActionType` vermeli veya merkezi `actionKey -> productionActionType` mapping'e eklemelidir.
- `safe_read` aksiyonlari okunabilirlik icin acik kalabilir.
- `mock`, `dry_run`, `foundation`, `not_configured` durumlari live success gibi donmez.

## Provider Not Configured Davranisi

- Omnichannel/WhatsApp outbound aksiyonlari production gate altinda kontrol edilir.
- Env veya provider readiness eksiginde response `production_gate_blocked` doner.
- `externalProviderCallExecuted` false olarak raporlanir.

## Foundation / Dry-Run Worker Kurali

- Worker handler sozlesmesinde `productionAllowed` ve `liveReady` alanlari bulunur.
- Production modda bu alanlar true degilse job live completed olmaz.
- Job `dead_letter` veya explicit blocked reason ile kapanir.

## Approval Execution Kurali

- Approval approve sonrasi execution oncesi production gate kontrolu yapilir.
- Gate blocked/degraded ise approval state completed gibi raporlanmaz.
- `production_gate_blocked` reason ile fail-closed donulur.

## UI Response Standardi

- Kritik aksiyonlarda blocked/degraded metadata route response icinde gorunur:
  - `productionGate`
  - `blockers`
  - `missingEnv`
  - `unsafeFallbacks`
  - `mutationExecuted: false`
  - `externalProviderCallExecuted: false`

## Deployment Checklist

- Readiness endpoint `ready` olmadan live cutover yapma.
- Worker mode `durable`, persistence mode `postgres` olmalı.
- Session secret / DB / provider env eksikleri kapanmali.
- Foundation-only handlerlar live success kriterine dahil edilmemeli.

## Bu PR’da Bilerek Yapilmayanlar

- Real WhatsApp live send implementasyonunun tam aktivasyonu
- Real Instagram/Facebook/Email/SMS provider implementasyonlari
- Payment gateway live capture
- ERP tam live connector zinciri
- Autonomous AI execution
