# Approval Policy Engine

Onay motoru, kritik mutation için **insan veya yetkili kanal** kararını yönetir. Permission geçse bile approval policy **fail-closed** uygulanabilir.

## Onay modları

| Mod | Kullanım |
|-----|----------|
| Tek seviye | Tek `approval.decide` yeterli |
| Çok seviye | Sıralı veya paralel onaylayıcılar (`minApproverCount`, rol seti) |
| Rol bazlı | Satış, muhasebe, CRM (`WhatsAppApproverRole` ile uyumlu) |
| Tutar bazlı | `amount` eşiği üstü ek onay |
| Kanal bazlı | WhatsApp ONAY/RED/İNCELE; Meta DM handoff |
| AI öneri | `ai_action_proposal` → `policySnapshot` |

## Yaşam döngüleri

**Request:** `pending` → (`approved` | `rejected` | `expired` | `superseded`)  
**Execution:** `pending` → `authorized` → (`executed` | `failed` | `cancelled`)

Onay sonrası yalnızca **execution dispatcher** domain handler çağırır (`approval-execution-flow.md`).

## WhatsApp komut onayı

Komutlar: `ONAY` / `ONAYLA` / `APPROVE`, `RED` / `REDDET`, `İNCELE` / `REVIEW` + `referenceCode` + token.  
Token **hash** saklanır; raw token loglanmaz. Yetkili telefon listesi; duplicate karar audit. Expired ticket → `expired` (`009-whatsapp-command-approval.md`).

## Instagram / Facebook prensibi

Otomatik cevap düşük risk şablonlarıyla sınırlı; sipariş/ödeme/fiyat → **handoff** veya internal approval ticket. Lead/kampanya → audit + KVKK izin kontrolü.

## Zorunlu audit / timeline

`approval.requested`, `approval.decided`, `approval.execution.started|completed|failed|cancelled`, kanal `command.accepted|rejected|duplicate`.

## Expiry, duplicate, referans

- `referenceCode` insan okunur takip  
- `tokenHash` güvenlik  
- Duplicate approve → status değişmez + audit `duplicate`  
- `expiresAt` — fail-closed execution

## Limit, delegation, escalation

- Günlük onay adedi / tutar limiti (tenant policy)  
- Delegation: zaman sınırlı ve audit’li  
- Escalation: süre aşımında üst rol veya handoff

## Onay gerektiren işlemler (açık liste)

- Fiyat değişimi, iskonto  
- Sipariş kesinleştirme (`order.confirm`)  
- Tahsilat kaydı  
- Fatura oluşturma / kesinleştirme  
- İade kabul / tamamlama  
- Depo çıkışı / stok düşme (`stock.adjust`, warehouse execute)  
- Teslim tamamlama  
- ERP write, fabrika siparişi  
- Yüksek riskli müşteri mesajı (kanal policy)  
- Özel belge gönderimi (`document.send`)  
- KVKK veri silme / veri export  

## Mevcut kod

- `buildApprovalFromAiProposal` — `policySnapshot` (`packages/domain/src/ai/index.ts`)  
- `canExecuteApproval` / `executeApprovedOperation` — onay + `validateAiMutationGuard`  
- WhatsApp `rule-resolver` — intent → internal approval flags  

Hedef: approval policy **registry key** ile değerlendirici (`evaluateApprovalPolicy`).

## Fail-closed

Eksik policy, bilinmeyen action, süresi dolmuş onay, yetkisiz onaylayıcı → execution **yok**; UI/API açık hata kodu.
