# Policy Engine Gap Report

Mevcut repo ile hedef policy / action / feature / approval omurgası arasındaki farklar. Görev 4 guard standardizasyonu sonrası durum dikkate alınmıştır.

| # | Gap | Alan | Risk | Neden önemli? | Çözüm | Sahip | Görev |
|---|-----|------|------|---------------|-------|-------|-------|
| 1 | Merkezi Policy Engine yok | API, domain | **critical** | Karar dağınık; tutarsız deny/allow | `evaluatePolicy` + types | Codex | **004** |
| 2 | Action Registry yok | Tüm mutation | **critical** | actionKey/permission/onay eşlemesi kodda dağınık | `packages/domain` registry | Codex | **004** |
| 3 | Feature registry enforcement | Tenant/plan | **high** | `hasTenantModule` API’de zayıf | Feature evaluator + plan limit | Codex | 005 |
| 4 | Approval policy evaluator | Onay | **high** | `policySnapshot` ad-hoc | `evaluateApprovalPolicy` | Codex | 004/006 |
| 5 | AI policy matrisi kodda sabit | AI | **high** | `mutationActions` listesi | Registry + matrix | Codex | 004 |
| 6 | Channel policy birleşik değil | Omnichannel | **high** | WA resolver ayrı; IG/FB yok | Channel evaluator | Codex | 007 |
| 7 | Dispatcher ↔ registry bağ yok | Execution | **medium** | `serverActionKey` string | Handler map | Codex | 006 |
| 8 | Policy audit event tipi | Audit | **medium** | Yalnızca işlem audit | `policy.evaluated` | Codex | 008 |
| 9 | Risk/confidence eşikleri | AI/kanal | **medium** | Sabit yok | Tenant config | Cursor | 009 |
| 10 | Idempotency policy-driven | Webhook/ERP | **medium** | Kısmi | Registry `idempotencyRequired` | Codex | 007 |
| 11 | Approval limit/delegation | Onay | **medium** | Tasarım yok | Policy rules | Codex | 006 |
| 12 | Worker policy context | Worker | **medium** | Worker stub | Job envelope + evaluate | Codex | 009 |

## En kritik 5

1. Merkezi Policy Engine  
2. Action Registry  
3. Feature/plan enforcement  
4. Approval policy evaluator  
5. AI + channel policy matrislerinin runtime bağlanması  

## Sonraki görev

**004 — Policy Engine, Action Registry, Approval Policy foundation** (`docs/codex-prompts/004-policy-engine-foundation.md`).

## 004 durumu (2026-05-12)

- Policy Engine foundation eklendi: `evaluatePolicy(request)`.
- Action Registry ve Feature Registry icin ilk runtime kayitlari eklendi.
- Approval policy evaluator foundation eklendi (`require_approval` fail-closed).
- AI ve channel policy helperlari (crm_ui + whatsapp temel kurallari) policy akisina baglandi.
- API icin ince policy bridge eklendi (`evaluatePolicyForContext`).
- Tum route'lara zorunlu baglama bilerek sonraki goreve birakildi.
