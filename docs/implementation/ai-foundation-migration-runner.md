# AI Foundation Migration Runner

Bu dokuman, AI proposal-only mimarisi icin eklenen Postgres tablolarini production veritabanina uygulama akisini aciklar.

## Kapsam

Migration runner su migration'i uygular:

- `20260502_ai_foundation`

Bu migration su tablolarin temelini olusturur:

- `schema_migrations`
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

Bu runner sadece schema migration uygular.

Yapmaz:

- AI operation execute etmez.
- CRM mutation yapmaz.
- WhatsApp / ERP / fabrika / belge side-effect tetiklemez.
- Worker calistirmaz.
- Demo fallback acmaz.

## Calistirma

Once build:

```powershell
pnpm --filter @hallederiz/database build
```

Sonra status:

```powershell
$env:POSTGRES_URL="postgres://user:password@localhost:5432/hallederiz"
pnpm --filter @hallederiz/database migrate:status
```

Migration uygula:

```powershell
$env:POSTGRES_URL="postgres://user:password@localhost:5432/hallederiz"
pnpm --filter @hallederiz/database migrate:apply
```

Tekrar calistirilirsa migration `schema_migrations` kaydi sayesinde atlanir.

## Fail-closed davranis

- `POSTGRES_URL` veya `DATABASE_URL` yoksa runner hata verir.
- Daha once uygulanmis migration'in checksum'i degismisse runner hata verir.
- Migration transaction icinde uygulanir.
