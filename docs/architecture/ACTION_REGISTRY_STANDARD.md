# Action Registry Standard

Tüm operasyonel ve entegrasyon **action** tanımları merkezi registry’de tutulur. API route, AI proposal, kanal niyeti ve approval dispatcher aynı `actionKey` sözlüğünü kullanır.

## Kayıt şeması

| Alan | Açıklama |
|------|----------|
| `actionKey` | Benzersiz anahtar (`order.confirm`) |
| `domain` | `customer`, `order`, `finance`, `stock`, `document`, `channel`, `ai`, `approval`, `erp`, `factory`, `workflow` |
| `actionType` | `read`, `create`, `update`, `delete`, `approve`, `execute`, `send`, `sync` |
| `description` | İnsan okunur özet |
| `requiredPermission` | En az bir permission (registry çoğaltılabilir) |
| `requiredModule` | `featureKey` / `moduleKey` |
| `requiredPlan` | Opsiyonel plan capability |
| `isMutation` | Veri değiştirir mi |
| `isFinancialMutation` | Para / fatura / tahsilat |
| `isStockMutation` | Stok / depo |
| `isExternalWrite` | ERP / fabrika / kanal outbound |
| `isCritical` | Onay zorunlu adayı |
| `defaultRiskLevel` | `low` … `critical` |
| `allowedActors` | `user`, `ai`, `system`, `channel` |
| `allowedChannels` | Boş = tümü; dolu = whitelist |
| `aiMode` | `blocked`, `read_only`, `draft`, `propose`, `request_approval` |
| `approvalRequired` | Boolean |
| `approvalPolicyKey` | `APPROVAL_POLICY_ENGINE` referansı |
| `auditRequired` | Boolean |
| `timelineRequired` | Boolean |
| `idempotencyRequired` | Dış write / kanal için zorunlu |
| `executionHandler` | Dispatcher handler id |
| `rollbackStrategy` | `none`, `compensating`, `manual` |
| `testRequirement` | `unit`, `integration`, `policy_snapshot` |

## Bağlayıcı kurallar

- Permission **tek başına** kritik mutation için yeterli değildir.  
- Kritik action **approval policy**’den geçer.  
- AI doğrudan kritik **execution** yapamaz; yalnızca `propose` / `request_approval`.  
- Kanal action’ları **channel policy** matrisinden geçer.  
- **External write** → `idempotencyRequired` + `auditRequired` true.

## Örnek kayıtlar (özet)

| actionKey | domain | mutation | critical | approval | aiMode | idempotency |
|-----------|--------|----------|----------|----------|--------|-------------|
| `customer.read` | customer | Hayır | Hayır | Hayır | read_only | Hayır |
| `customer.create` | customer | Evet | Orta | Koşullu | propose | Hayır |
| `customer.update` | customer | Evet | Orta | Koşullu | propose | Hayır |
| `customer.merge` | customer | Evet | Evet | Evet | blocked | Hayır |
| `product.read` | product | Hayır | Hayır | Hayır | read_only | Hayır |
| `stock.read` | stock | Hayır | Hayır | Hayır | read_only | Hayır |
| `stock.adjust` | stock | Evet | Evet | Evet | request_approval | Evet |
| `stock.transfer` | stock | Evet | Evet | Evet | request_approval | Evet |
| `quote.create` | order | Evet | Orta | Koşullu | propose | Hayır |
| `quote.discount.apply` | order | Evet | Evet | Evet | request_approval | Hayır |
| `quote.send` | document | Evet | Orta | Evet | draft | Evet |
| `order.create` | order | Evet | Evet | Evet | request_approval | Hayır |
| `order.confirm` | order | Evet | Evet | Evet | request_approval | Evet |
| `order.cancel` | order | Evet | Evet | Evet | propose | Hayır |
| `finance.payment.create` | finance | Evet | Evet | Evet | request_approval | Evet |
| `invoice.create` | finance | Evet | Evet | Evet | request_approval | Evet |
| `return.create` | finance | Evet | Evet | Evet | request_approval | Hayır |
| `document.generate` | document | Evet | Orta | Koşullu | draft | Hayır |
| `document.send` | document | Evet | Evet | Evet | request_approval | Evet |
| `erp.sync.write` | erp | Evet | Evet | Evet | blocked | Evet |
| `factory.order.create` | factory | Evet | Evet | Evet | request_approval | Evet |
| `delivery.complete` | order | Evet | Evet | Evet | request_approval | Evet |
| `channel.whatsapp.reply` | channel | Koşullu | Koşullu | Koşullu | auto_reply_low_risk* | Evet |
| `channel.instagram.reply` | channel | Koşullu | Orta | Koşullu | handoff | Evet |
| `channel.facebook.reply` | channel | Koşullu | Orta | Koşullu | handoff | Evet |
| `ai.proposal.create` | ai | Evet | Orta | Koşullu | propose | Hayır |
| `ai.message.draft` | ai | Hayır | Hayır | Hayır | draft | Hayır |
| `ai.action.propose` | ai | Evet | Evet | Evet | request_approval | Hayır |
| `approval.request` | approval | Evet | Orta | — | blocked | Hayır |
| `approval.decide` | approval | Evet | Yüksek | — | blocked | Hayır |
| `workflow.run` | workflow | Evet | Orta | Koşullu | propose | Evet |

\* `auto_reply_low_risk` yalnızca channel policy + düşük risk şablonlarında.

## Mevcut kod eşlemesi (referans)

- AI mutation listesi: `packages/domain/src/ai/index.ts` (`mutationActions`)  
- Execution: `packages/domain/src/approval-execution/index.ts` (`serverActionKey` / `actionType`)  
- Permission: `apps/api/src/shared/read-guards.ts` (legacy `*.read` / `*.write`)

Hedef: bu dağınık listeler **Action Registry** tek kaynağına taşınır (Codex 004).

## Registry versiyonlama

`registryVersion` + tenant `policyOverrides` (yalnızca onay eşiği, handoff, rate limit). `actionKey` silinmez; `deprecated` işaretlenir.
