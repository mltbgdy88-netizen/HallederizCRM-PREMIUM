# AI Foundation Database Module

Bu modul, AI proposal-only mimarisi icin gerekli kalici veri temelini tanimlar.

## Kapsam

- `ai_proposals`
- `ai_proposal_operations`
- `ai_proposal_validations`
- `ai_prompt_audit`
- `approval_policies`
- `approval_tickets`
- `approval_attempts`
- `approval_executions`
- `approval_execution_steps`
- `audit_events`
- `outbox_events`
- `inbox_events`
- `idempotency_keys`

## Guvenlik siniri

Bu modul sadece database temelini ve SQL builder'larini saglar.

Yapmaz:

- API route davranisi degistirmez.
- AI planini otomatik execute etmez.
- CRM mutation yapmaz.
- Worker side-effect tetiklemez.

## Mimari zincir

```text
AI plan
-> schema validation
-> ai_proposals
-> approval_tickets
-> approval_executions
-> domain transaction
-> audit_events
-> outbox_events
-> worker
```

## Not

`aiFoundationMigrationSql` mevcut migration runner'a baglanmadan once manuel review edilmelidir. Bu PR sadece migration metni, tipler ve repository temelini ekler.
