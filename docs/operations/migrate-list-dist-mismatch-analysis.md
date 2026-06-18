# P2 — `migrate:list` CLI dist mismatch analysis

**Agent:** E  
**Branch:** `analysis/p2-migrate-list-dist-mismatch`  
**Date:** 2026-06-18  
**Scope:** Analysis-only (no runtime or CLI changes in this PR)

---

## Executive summary

`pnpm --filter @hallederiz/database migrate:list` **exists** but **fails in the normal build/dist workflow** because the CLI scans `dist/migrations`, while TypeScript build emits only compiled `.js` files and never copies `.sql` assets. By contrast, `migrate:apply` works because `migration-registry.ts` resolves SQL from `src/migrations` via a fallback path. The mismatch is confirmed locally with `ENOENT` after `pnpm --filter @hallederiz/database build`.

**Verdict:** `MIGRATE_LIST_ANALYSIS_READY`

---

## 1. Does `migrate:list` exist?

| Item | Finding |
|------|---------|
| npm script | Yes — `packages/database/package.json` → `"migrate:list": "node dist/cli.js migrations"` |
| CLI handler | Yes — `packages/database/src/cli.ts` target `"migrations"` |
| Implementation | `loadMigrationSqlFiles(import.meta.url)` in `packages/database/src/scripts.ts` |
| Documented in runbooks | Yes — `docs/operations/sec-3b-staging-runtime-runbook.md`, `docs/operations/security-ops-backlog-plan.md` |
| CI coverage | **No** — `scripts/ci/postgres-migration-smoke.cjs` exercises only `migrate:apply` |

Related scripts in the same package:

| Script | CLI target | Status after build |
|--------|------------|-------------------|
| `migrate:list` | `migrations` | **FAIL** — `dist/migrations` missing |
| `seed:list` | `seeds` | **FAIL** — `dist/seeds` missing (same root cause) |
| `migrate:status` | `migrate:status` | Requires `DATABASE_URL`; path resolution N/A |
| `migrate:apply` | `migrate:apply` | **PASS** — uses registry fallback to `src/migrations` |

---

## 2. Dev/source vs build/dist mode

### Build pipeline

- `packages/database/tsconfig.json` includes only `src/**/*.ts`; `outDir` is `dist`.
- `pnpm --filter @hallederiz/database build` runs `tsc -p tsconfig.json`.
- **No asset copy step** copies `src/migrations/*.sql` or `src/seeds/*.sql` into `dist/`.
- After build, `dist/` contains `cli.js`, `migration-registry.js`, `migrations.js` (TS module), etc., but **not** `dist/migrations/` or `dist/seeds/` directories.

### Two path-resolution strategies (inconsistent)

**A. Registry path (`migration-registry.ts`) — used by `migrate:apply`**

```typescript
const candidates = [
  path.join(moduleDir, "migrations"),           // dist/migrations — absent
  path.join(moduleDir, "..", "src", "migrations") // src/migrations — present
];
```

When running from `dist/migration-registry.js`, fallback resolves to `packages/database/src/migrations` and succeeds.

**B. Filesystem scan (`scripts.ts`) — used by `migrate:list` / `seed:list`**

```typescript
const migrationDir = path.join(root, "migrations"); // root = dist/ when CLI runs from dist/cli.js
```

No fallback. Result: `ENOENT: scandir '.../dist/migrations'`.

### Observed local reproduction

```text
pnpm --filter @hallederiz/database build   # OK
pnpm --filter @hallederiz/database migrate:list
# Error: ENOENT: no such file or directory, scandir '...\packages\database\dist\migrations'
```

`migrate:apply` is unaffected in staging/CI because it never calls `scripts.ts`; it uses `buildOrderedDatabaseMigrations()` from the registry.

---

## 3. Path resolution breakage — root cause

| Layer | Resolves from | Works post-build? |
|-------|---------------|-------------------|
| `migration-registry.ts` | `dist/migrations` → fallback `src/migrations` | Yes |
| `scripts.ts` (`loadMigrationSqlFiles`) | `dirname(import.meta.url)/migrations` only | **No** |
| `scripts.ts` (`loadSeedSqlFiles`) | `dirname(import.meta.url)/seeds` only | **No** |

**Naming collision:** `dist/migrations.js` is the compiled migrations **module**, not a directory of SQL files. Operators may assume `migrate:list` and `migrate:apply` share the same data source; they do not today.

**Operational impact (P2):**

- Deploy/staging checklists that call `migrate:list` fail with a misleading filesystem error.
- `migrate:apply` still applies all 16 registry migrations (verified by SEC-3C smoke).
- False alarm risk: ops may think the migration toolchain is broken when only the list command is broken.

---

## 4. Test feasibility

### Existing coverage

| Test | Location | What it validates |
|------|----------|-------------------|
| `migration-registry-parity.test.ts` | `apps/api/src/tests/` | Registry names, foundation tables, deterministic order |
| `commercial-line-migration-parity.test.ts` | `apps/api/src/tests/` | SQL corpus includes commercial line tables |
| `postgres-migration-smoke.cjs` | `scripts/ci/` | `migrate:apply` × 2, 16 migrations, idempotency schema |

**Gap:** No test invokes `migrate:list` or `seed:list` after `@hallederiz/database` build.

### Recommended tests for implementation PR

1. **CLI integration test (preferred)**  
   - Build `@hallederiz/database`, run `node dist/cli.js migrations` (or `pnpm migrate:list`).  
   - Assert exit 0 and output count matches `listMigrationRegistryNames().length` (16).  
   - Optionally assert listed content matches registry order.

2. **Unit test for path resolver**  
   - Extract shared `resolveMigrationsDirectory()` / `resolveSeedsDirectory()` used by both registry and CLI loader.  
   - Test from a simulated `dist/` `import.meta.url` with only `src/migrations` present.

3. **CI extension (optional P2+)**  
   - Add one line to `postgres-migration-smoke.cjs` after build: run `migrate:list` and assert 15 SQL files + registry parity (or 16 names if CLI lists registry names).

### Test constraints

- `migrate:status` requires live Postgres — keep separate from list test.
- API tests already import `@hallederiz/database` built dist; CLI test fits the same `pnpm --filter @hallederiz/database... build` precondition used in `test:api`.

**Feasibility:** High. No new infrastructure; pattern mirrors existing migration smoke and registry parity tests.

---

## 5. Implementation PR — expected file list

**Suggested branch:** `fix/db-migrate-list-dist-path` (per backlog)

### Primary (required)

| File | Change |
|------|--------|
| `packages/database/src/scripts.ts` | Add same candidate-path fallback as registry (or delegate to shared resolver) for migrations and seeds |
| `packages/database/src/migration-registry.ts` | Optional: extract shared `resolveSqlAssetDirectory()` to avoid duplication |
| `packages/database/package.json` | Only if script wiring changes (e.g. list via registry export); likely unchanged |

### Tests (required for implementation PR)

| File | Change |
|------|--------|
| `packages/database/src/cli.test.ts` **or** `apps/api/src/tests/migrate-list-cli.test.ts` | Post-build CLI list smoke |
| `scripts/ci/postgres-migration-smoke.cjs` | Optional: assert `migrate:list` after build |

### Documentation (recommended)

| File | Change |
|------|--------|
| `docs/operations/sec-3b-staging-runtime-runbook.md` | Remove or downgrade P2 gap row after fix; document `migrate:list` in migration section |
| `docs/operations/security-ops-backlog-plan.md` | Mark item 3 complete when merged |

### Out of scope / unlikely

| Area | Reason |
|------|--------|
| `apps/api/**` | No API runtime dependency on `migrate:list`; apply path already correct |
| SQL copy in build | Heavier; fallback to `src/migrations` matches registry and avoids duplicate assets in dist |
| `packages/domain`, `apps/worker` | No migration CLI usage found |

---

## 6. Fix options (for implementer)

| Option | Pros | Cons |
|--------|------|------|
| **A. Align `scripts.ts` with registry fallback** | Minimal diff; consistent with `migrate:apply`; no build change | Relies on `src/` beside `dist/` in deployed artifact |
| **B. Route `migrate:list` to `listMigrationRegistryNames()`** | Single source of truth; no filesystem scan | Changes CLI output shape (names vs raw SQL file count); update runbook expectations |
| **C. Copy `src/migrations` → `dist/migrations` in build** | Pure dist self-containment | Extra build step; must also copy seeds; duplicate asset maintenance |

**Recommendation:** Option **A** or **B** (A for minimal behavior change; B for long-term canonical listing). Option C only if deployment strips `src/` from the artifact.

---

## 7. Risks and rollback

| Risk | Severity | Mitigation |
|------|----------|------------|
| Ops checklist fails on `migrate:list` | Medium (P2) | Use `migrate:status` + registry doc until fix; `migrate:apply` unchanged |
| Implementer breaks registry fallback | Low | Keep existing parity tests; add CLI test |
| Deployment omits `src/migrations` | Low today | Monorepo deploys full package; document if slim artifacts are introduced |
| `seed:list` same bug | Low | Fix together in `scripts.ts` |

**Rollback:** Revert implementation PR; runbook workaround remains `migrate:status` for applied state.

---

## 8. Mojibake check

- Document authored in UTF-8.
- Turkish labels preserved: migration, staging, operasyonel, uyumsuzluk, doğrulama.
- No `\uXXXX` escape sequences or corrupted diacritics in source strings.
- Code paths referenced use ASCII paths only (`dist/migrations`, `src/migrations`).

---

## 9. Verdict

**`MIGRATE_LIST_ANALYSIS_READY`**

Analysis complete. Root cause confirmed, fix scope bounded, tests feasible, implementation PR file list defined. No blockers for a follow-up `fix/db-migrate-list-dist-path` PR.
