# Policy Engine Architecture

Merkezi **Policy Engine**, tenant/auth guard’larından sonra ve domain mutation’dan önce çalışan karar katmanıdır. Amaç: permission, modül/plan, onay, kanal ve AI otonomi kurallarını tek sözleşmede birleştirmek.

## Amaç ve sistemdeki yeri

| Katman | Sorumluluk |
|--------|------------|
| RequestContext | Kimlik, tenant, rol/permission listesi |
| Auth guards | Oturum + tenant mismatch + permission assert |
| **Policy Engine** | Action/feature/channel/AI için **karar** (allow/deny/approval/…) |
| Approval engine | Onay yaşam döngüsü + execution authorize |
| Execution dispatcher | Onaylı `actionKey` → domain handler |
| Audit/timeline | Karar ve icra izi |

Mevcut durum: karar parçaları dağınık (`auth-guards`, `validateAiMutationGuard`, WhatsApp `rule-resolver`, route içi `assertAnyPermission`). Hedef: `evaluatePolicy(request)` tek giriş.

## Input modeli — `PolicyCheckRequest` (taslak)

```typescript
interface PolicyCheckRequest {
  tenantId: string;
  actor: {
    type: "user" | "ai" | "system" | "channel";
    id: string;
    roles: string[];
    permissions: string[];
  };
  actionKey: string;           // Action Registry
  channel?: "crm_ui" | "whatsapp" | "instagram" | "facebook" | "webchat" | "email" | "sms" | "api" | "worker";
  resource?: { type: string; id?: string; amount?: number; currency?: string };
  payload?: Record<string, unknown>;
  proposalId?: string;
  approvalId?: string;
  idempotencyKey?: string;
  riskHints?: { score?: number; confidence?: number; intent?: string };
  providerHealth?: Record<string, "healthy" | "degraded" | "unavailable">;
  environment: "production" | "staging" | "development";
}
```

## Output modeli — `PolicyDecision` (taslak)

```typescript
type PolicyDecisionType =
  | "allow"
  | "deny"
  | "require_approval"
  | "require_handoff"
  | "require_more_info"
  | "draft_only";

interface PolicyDecision {
  decision: PolicyDecisionType;
  actionKey: string;
  reasons: string[];
  requiredPermissions?: string[];
  requiredModule?: string;
  requiredPlan?: string;
  approvalPolicyKey?: string;
  approvalMode?: "single" | "multi" | "amount" | "channel";
  riskLevel?: "low" | "medium" | "high" | "critical";
  riskScore?: number;
  confidenceScore?: number;
  auditRequired: boolean;
  timelineRequired: boolean;
  idempotencyRequired: boolean;
  executionHandler?: string;
  metadata?: Record<string, unknown>;
}
```

## Karar tipleri

| Karar | Anlam |
|-------|--------|
| `allow` | İcra veya read devam (kritik mutation’da yalnızca onay sonrası dispatcher) |
| `deny` | Fail-closed; işlem yok |
| `require_approval` | Proposal/onay kaydı; execution yasak |
| `require_handoff` | İnsan operatöre / temsilciye aktarım |
| `require_more_info` | Eksik veri; mutation yok |
| `draft_only` | AI/kanal yalnızca taslak/özet |

## Risk ve confidence

- **riskScore** (0–100): tutar, dış write, KVKK, kanal, müşteri segmenti ile artar.
- **confidenceScore** (0–1): AI niyet/entity eşleşmesi; eşik altı → `require_more_info` veya `handoff`.
- Eşikler tenant + action bazlı policy’de; sabit global magic number yok.

## Kontrol sırası (fail-closed)

1. Tenant aktif / askıda değil  
2. **Feature/module** enabled + plan limit  
3. **Permission** (action registry `requiredPermission`)  
4. **Channel policy** (kanal yüzeyindeyse)  
5. **AI action policy** (actor `ai` veya AI proposal)  
6. **Approval policy** (kritik mutation)  
7. **Provider health** (canlı outbound / ERP write)  
8. Karar + audit ön kaydı  

Plan/modül permission yerine geçmez. Permission approval yerine geçmez.

## Alt policy bileşenleri

- **Tenant policy:** status, locale, compliance flags  
- **Permission:** `PERMISSION_KEY_STANDARD.md`  
- **Module/plan:** `FEATURE_REGISTRY_MODEL.md`  
- **Approval:** `APPROVAL_POLICY_ENGINE.md`  
- **Channel:** `CHANNEL_ACTION_POLICY_MATRIX.md`  
- **AI action:** `AI_ACTION_POLICY_MATRIX.md`  

## Provider health

AI, WhatsApp, ERP, factory adapter `unavailable` ise: canlı mutation/outbound **deny** veya `draft_only`; sessiz mock success yok (`fallback-behavior.md`).

## Audit / timeline

Her `deny`, `require_approval`, `require_handoff` ve başarılı execution sonrası `recordAuditEvent` (hedef: DB). Policy kararı `policy.evaluated` event tipi ile payload’da `actionKey`, `decision`, `reasons`.

## Execution dispatcher ilişkisi

Dispatcher yalnızca: `PolicyDecision.decision === allow` **ve** approval `authorized` **ve** `canExecuteApproval` benzeri guard geçerse çalışır. Handler `ActionRegistry.executionHandler` ile eşlenir.

## 500 SaaS tenant ölçeği

- Registry ve policy tanımları **immutable version** + tenant override (JSON/DB).  
- Evaluate O(1) registry lookup; ağır kural cache (tenantId + policyVersion).  
- Audit async queue; idempotency store partition by tenant.  
- Policy evaluate **stateless**; session DB’den kısa TTL cache.

## Güvenli implementation prensipleri

- Default `deny` bilinmeyen `actionKey` için.  
- AI actor kritik `actionKey` için en fazla `draft_only` / `require_approval`.  
- Webhook path: signature + duplicate + tenant routing policy’den önce transport guard.  
- Registry değişikliği migration + test zorunlu.

## İlgili dokümanlar

`ACTION_REGISTRY_STANDARD.md`, `FEATURE_REGISTRY_MODEL.md`, `APPROVAL_POLICY_ENGINE.md`, `AI_ACTION_POLICY_MATRIX.md`, `CHANNEL_ACTION_POLICY_MATRIX.md`, `POLICY_ENGINE_GAP_REPORT.md`
