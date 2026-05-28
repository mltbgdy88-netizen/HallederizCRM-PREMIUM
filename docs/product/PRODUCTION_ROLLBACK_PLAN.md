# Production Rollback Plan

| Release commit | `2d2430f` |
|----------------|-----------|
| Integration code | `f96680a` (#136) |
| Runbook | `PRODUCTION_CUTOVER_RUNBOOK.md` |

## Rollback triggers

Initiate rollback when **any** of the following occurs:

| Severity | Trigger |
|----------|---------|
| P0 | Auth completely broken for all users |
| P0 | Data corruption or failed migration without forward fix |
| P0 | Sustained 5xx above agreed threshold (>15 min) |
| P0 | Security incident (secret leak, webhook bypass) |
| P1 | Critical route unusable (login, dashboard, approvals) with no hotfix < 2h |
| P1 | WhatsApp sending wrong tenant data (cross-tenant) |
| P1 | Unintended mutations from AI/integration path |

**Do not** rollback for configured-pending integrations alone (WhatsApp/AI not yet enabled) if core app is stable.

---

## Immediate rollback steps (0–30 min)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Announce rollback in status channel | Deploy lead |
| 2 | Stop new deploys / freeze pipeline | Deploy lead |
| 3 | Revert web + API to **previous known-good** deployment SHA/image | Deploy lead |
| 4 | If migration applied: execute DB rollback per DBA plan (or forward-fix decision) | DBA |
| 5 | Verify traffic on previous version | Ops |
| 6 | Run post-rollback smoke (§ Validation) | Eng |

---

## Deployment rollback

| Target | Action |
|--------|--------|
| Web (Next.js) | Redeploy previous build artifact / git tag |
| API | Redeploy previous container/image |
| Worker / AI service | Redeploy matching previous version |
| Env vars | Restore previous secret revision in platform (not git) |

Record:

- Rolled back **from** SHA: ___________
- Rolled back **to** SHA: ___________
- Time (UTC): ___________

---

## Database rollback guidance

| Scenario | Guidance |
|----------|----------|
| Migration reversible | Run documented down migration only with DBA approval |
| Migration irreversible | Forward-fix on `main`; do not force down without data backup |
| Data corruption | Restore from Phase 0 backup; incident review |

**Never** run destructive SQL in production without ticket + DBA sign-off.

---

## Environment rollback

| Area | Action |
|------|--------|
| Auth secrets | Revert to previous secret version if rotated during cutover |
| `DATABASE_URL` | Revert only if pointed to wrong instance |
| WhatsApp | Revert webhook URL in Meta to previous endpoint OR disable webhook |
| Local AI | Set `AI_PROVIDER=disabled` / `AI_LOCAL_ENABLED=false` to stop calls |
| Demo flags | Ensure `DEMO_AUTH_ENABLED=false` restored if accidentally enabled |

---

## WhatsApp webhook rollback

| Step | Action |
|------|--------|
| 1 | In Meta Developer Console, set webhook URL to previous stable endpoint OR remove |
| 2 | Verify challenge on restored endpoint |
| 3 | Confirm signature secret matches restored deployment |
| 4 | Pause outbound campaigns / automations |
| 5 | Communicate to ops: inbound may queue at Meta until restored |

---

## Local AI disable fallback

Fast mitigation without full app rollback:

```env
AI_PROVIDER=disabled
AI_LOCAL_ENABLED=false
```

Redeploy API with above → health shows disabled; no fake output.

---

## Communication plan

| Audience | Message |
|----------|---------|
| Internal ops | Rollback reason, current SHA, ETA for stability |
| Support | User-visible impact (login, WhatsApp, AI) |
| Stakeholders | Go/No-Go reverted to No-Go until root cause fixed |

Template:

> Rollback in progress. Reason: [REASON]. Service restored to version [SHA]. WhatsApp: [active/disabled]. AI: [active/disabled]. Next update: [TIME].

---

## Post-rollback validation

| Check | Expected |
|-------|----------|
| `pnpm smoke:navigation` (on rolled-back SHA) | PASS |
| Login | Works |
| API health | 200 |
| No elevated 5xx | 15 min clean |
| WhatsApp webhook | Points to stable env or disabled |
| Audit trail | Rollback events logged in ticket |

---

## Post-incident

- [ ] Root cause document
- [ ] Fix forward on `main` with tests
- [ ] Update `RELEASE_PRODUCTION_GO_NO_GO.md` decision
- [ ] Re-run full `PRODUCTION_SMOKE_CHECKLIST.md` before retry

---

## Out of scope

- Deleting remote branches
- Restoring stash `wip-mockup-inspiration-before-agent04`
- Committing credentials to document rollback env
