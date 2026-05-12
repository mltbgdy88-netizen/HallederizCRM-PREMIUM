# Codex Görev 004 — Policy Engine Foundation

## Yerel repo

`C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR`

## Branch önerisi

`feature/policy-engine-foundation` veya `architecture/policy-engine-foundation` (main’den)

## Okunacak dosyalar

- `docs/architecture/POLICY_ENGINE_ARCHITECTURE.md`
- `docs/architecture/ACTION_REGISTRY_STANDARD.md`
- `docs/architecture/FEATURE_REGISTRY_MODEL.md`
- `docs/architecture/APPROVAL_POLICY_ENGINE.md`
- `docs/architecture/AI_ACTION_POLICY_MATRIX.md`
- `docs/architecture/CHANNEL_ACTION_POLICY_MATRIX.md`
- `docs/architecture/POLICY_ENGINE_GAP_REPORT.md`
- `apps/api/src/shared/auth-guards.ts`, `read-guards.ts`, `request-context.ts`
- `packages/domain/src/ai/index.ts`, `approval-execution/index.ts`, `whatsapp/rule-resolver.ts`
- `packages/types/src` (Approval, Tenant, Permission)

## Amaç

Policy Engine, Action Registry, Feature Registry sözleşmeleri ve Approval Policy evaluator **foundation**’ını kodla; mevcut guard zincirini bozmadan entegrasyon noktalarını hazırla. Davranış değişikliği yalnızca yeni evaluate çağrılarının eklenmesiyle sınırlı ve testlerle korunmalı.

## Dokunulabilecek dosyalar

- `packages/types/src/policy/**` (yeni: `PolicyCheckRequest`, `PolicyDecision`, registry tipleri)
- `packages/domain/src/policy/**` (yeni: evaluator, registry, approval policy)
- `packages/domain/src/index.ts` (export)
- `apps/api/src/shared/policy-bridge.ts` (yeni, ince köprü)
- `apps/api/src/tests/policy-*.test.ts`
- `docs/architecture/POLICY_ENGINE_GAP_REPORT.md` (durum güncelleme)

## Dokunulmaması gereken dosyalar

- `apps/web/**`
- `packages/database/**` migration
- `apps/worker/**` (ayrı görev)
- `apps/integrations/routes.ts` webhook semantiği (signature/idempotency)
- Mevcut `auth-guards` deny/allow semantiğini gevşetme
- UI, build config, env

## Implementation adımları

1. `PolicyCheckRequest` / `PolicyDecision` tipleri.  
2. Action Registry: ilk action seti (`ACTION_REGISTRY_STANDARD` örnekleri).  
3. Feature Registry: core + seçili premium kayıtlar.  
4. `evaluatePolicy(request)` — sıra: tenant/feature → permission → channel → AI → approval → provider health.  
5. `evaluateApprovalPolicy` — kritik action için `require_approval`.  
6. AI matrix ve channel matrix için registry-driven helper (en az WA + crm_ui).  
7. Unit testler: deny unknown action, kritik without approval, AI blocked execution, feature disabled.  
8. API köprüsü: opsiyonel `evaluatePolicyForContext(context, actionKey)` — henüz tüm route’lara zorunlu bağlama yok (follow-up).  

## Test planı

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Yeni: `packages/domain` policy unit testleri.

## Kabul kriterleri

- Tipler ve registry export edilir.  
- `evaluatePolicy` bilinmeyen `actionKey` → `deny`.  
- Kritik mutation permission ile `allow` dönmez; `require_approval`.  
- `validateAiMutationGuard` davranışı bozulmaz (mevcut testler yeşil).  
- Guard zinciri testleri regresyonsuz.  
- Gap raporu 004 maddeleri güncellenir.

## Yasaklar

- Migration / DB schema  
- Permission guard kaldırma veya gevşetme  
- AI/approval/webhook güvenlik fail-open  
- Yeni HTTP endpoint (yalnızca internal evaluator)  
- Runtime dependency ekleme (onay olmadan)

## Rapor formatı

1. Eklenen dosyalar  
2. Registry action sayısı  
3. Test sonuçları  
4. Entegrasyon noktaları (sonraki PR)  
5. Kalan gap’ler  

## Referans

`docs/development/CODEX_TASK_STANDARD.md`, `.cursor/rules/03-ai-approval-policy.mdc`
