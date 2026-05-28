# Geliştirme iş akışı

## Amaç

Mevcut mimariyi (tenant, auth, AI proposal + approval, audit, kanal güvenliği) bozmadan küçük, denetlenebilir PR’larla ilerlemek.

## Roller

| Araç | Tipik kullanım |
|------|----------------|
| **Cursor** | Mimari, UI iskeleti, servis tasarımı, refactor planı, dokümantasyon |
| **Codex** | Net kapsamlı backend/domain/hardening paketleri, testli guard değişiklikleri |

## Günlük akış

1. `main` güncel; branch aç (`docs/development/BRANCH_AND_PR_STANDARD.md`).
2. İlgili spec ve `.cursor/rules/00–09` oku.
3. Değişiklik → yerel testler (`docs/development/QUALITY_GATES.md`).
4. PR şablonu doldur; review; merge.

## Dokunulmaz ilkeler

- Tenant dışı veri yok; permission’sız mutation yok.
- AI proposal-only; onaylı execution + audit.
- Webhook fail-closed; mock yalnızca izinli read-only/dev.
- Quick Operation ana operasyon yüzeyi; dashboard KPI vitrini değil.

## İlgili dokümanlar

- `BRANCH_AND_PR_STANDARD.md`
- `CODEX_TASK_STANDARD.md`, `CURSOR_TASK_STANDARD.md`
- `QUALITY_GATES.md`, `AI_SAFETY_AND_APPROVAL_RULES.md`
- `RELEASE_CHECKLIST.md`
