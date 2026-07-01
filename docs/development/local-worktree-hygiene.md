# Local Worktree Hygiene

## Source-folder TypeScript emit artifacts

`packages/domain/src/**` and `packages/types/src/**` must contain **only** hand-written `.ts` sources.

The following extensions are **generated build artifacts**, not source files:

- `.js`
- `.js.map`
- `.d.ts`
- `.d.ts.map`

They must **never** be committed.

## How they appear

Even when `packages/domain/tsconfig.json` and `packages/types/tsconfig.json` use `outDir: "dist"`, local worktrees can still collect stray emit files under `src/` from:

- a past incorrect `tsc` invocation (wrong working directory or flags)
- interrupted local builds
- IDE or tooling that emitted next to sources

These leftovers pollute `git status` and make gate review harder. They do not affect production builds when `dist/` is used correctly.

## Rules

1. **Do not use `git add .`** on this repo. Stage files explicitly.
2. Before local gates (`pnpm test`, `pnpm lint`, `pnpm production-go:local`), run `git status --short` and confirm no unexpected paths.
3. **Never commit** artifacts under `packages/domain/src/**` or `packages/types/src/**` with the extensions listed above.
4. Canonical package output remains `packages/domain/dist/` and `packages/types/dist/`.

## Safe cleanup (dry-run first)

Preview what would be removed:

```powershell
git clean -n -- ":(glob)packages/domain/src/**/*.js" ":(glob)packages/domain/src/**/*.js.map" ":(glob)packages/domain/src/**/*.d.ts" ":(glob)packages/domain/src/**/*.d.ts.map" ":(glob)packages/types/src/**/*.js" ":(glob)packages/types/src/**/*.js.map" ":(glob)packages/types/src/**/*.d.ts" ":(glob)packages/types/src/**/*.d.ts.map"
```

If the dry-run lists **only** the paths and extensions above, remove them:

```powershell
git clean -f -- ":(glob)packages/domain/src/**/*.js" ":(glob)packages/domain/src/**/*.js.map" ":(glob)packages/domain/src/**/*.d.ts" ":(glob)packages/domain/src/**/*.d.ts.map" ":(glob)packages/types/src/**/*.js" ":(glob)packages/types/src/**/*.js.map" ":(glob)packages/types/src/**/*.d.ts" ":(glob)packages/types/src/**/*.d.ts.map"
```

For `.d.ts`, `.d.ts.map`, and `.js.map` only (when `.js` was already removed):

```powershell
git clean -f -- ":(glob)packages/domain/src/**/*.d.ts" ":(glob)packages/domain/src/**/*.d.ts.map" ":(glob)packages/domain/src/**/*.js.map" ":(glob)packages/types/src/**/*.d.ts" ":(glob)packages/types/src/**/*.d.ts.map" ":(glob)packages/types/src/**/*.js.map"
```

Stop and report if dry-run shows paths outside `packages/domain/src/**` or `packages/types/src/**`, or extensions other than those listed.

## `.gitignore` coverage

`.gitignore` includes narrow rules for these eight patterns under `packages/domain/src/**` and `packages/types/src/**` only. Repo-wide `*.d.ts` or `**/*.d.ts.map` rules are intentionally **not** used.

## Pre-gate checklist

```powershell
git status --short
git diff --stat
```

Expected before a hygiene-only or feature PR: only intentional modified/added files; no generated emit under `src/`.
