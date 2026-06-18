# Payment Create — Web Test Integration Plan (Docs Only)

Branch: `docs/audit-fix-5-payment-web-test-plan`  
Scope rule (this PR): **Docs-only**. No runner/package changes.

## Goal

Ensure the existing **web-only** Payment Create validation test is executed in CI the same way other `apps/web` unit tests are executed today (approvals + navigation), with the **lowest-risk** approach and minimal surface area.

Target test to include:

- `apps/web/src/features/payments/__tests__/payment-create-validation.test.ts`

## 1) Current test infrastructure (what exists today)

### Root scripts

- `pnpm test` runs **API only** (`pnpm test:api`). It does **not** run any `apps/web` tests.
- Web tests that do exist are executed via dedicated runners:
  - `pnpm test:web-approvals` → `scripts/run-web-approval-tests.cjs`
  - `pnpm test:web-navigation` → `scripts/run-web-navigation-tests.cjs`

### How existing web test runners work

Both web runners:

- Run Node’s built-in test runner (`node --test`).
- Use `ts-node/esm` as a loader to execute TypeScript test files in `apps/web` (which is `"type": "module"`).
- Resolve `ts-node/esm` **from `apps/api`** (not from `apps/web`), ensuring the loader exists without adding deps to `apps/web`.

Implementation references:

- `scripts/run-web-approval-tests.cjs`
- `scripts/run-web-navigation-tests.cjs`

### Why the payment test is not included today

- The payment test exists under `apps/web/src/features/payments/__tests__/...`.
- There is **no runner** that scans that directory.
- `apps/web/package.json` does not define a `test` script.
- Root `pnpm test` intentionally runs only `test:api`.

Net effect: the payment create web test is “real” but currently **not wired into** the normal `pnpm test` or CI path.

## 2) Lowest-risk integration strategy (recommended)

### Recommendation: add a third runner (later PR)

Create a new script mirroring the existing two, e.g.:

- `scripts/run-web-payment-tests.cjs` (name can be `payments` or `payment-create`)

Runner behavior:

- Resolve `ts-node/esm` from `apps/api` (same pattern).
- Execute Node `--test` for test files in:
  - `apps/web/src/features/payments/__tests__/*.test.ts`

Then add a root script (later PR):

- `test:web-payments`: `node scripts/run-web-payment-tests.cjs`

And update CI (later PR) to call it similarly to other web tests.

Why this is lowest-risk:

- **No new test framework**: continues using `node:test`.
- **No workspace dependency changes**: uses the existing `ts-node/esm` resolution strategy.
- **No change to current `pnpm test` contract**: avoids expanding root `test` unexpectedly.
- **Clear ownership**: web tests remain opt-in scripts, matching the current repo pattern.

### Alternative (not recommended): fold into `pnpm test`

Option: change root `pnpm test` to include web tests.

Downside:

- Changes the meaning of `pnpm test`, potentially increasing runtime and introducing new failure modes on branches where web tests are not stable yet.
- Harder rollout; higher blast radius.

## 2b) What CI change would be needed (later PR)

In the workflow that currently runs tests (and/or the quality gate workflow), add an explicit step to run:

- `pnpm test:web-payments`

Place it near other web test invocations (`test:web-approvals`, `test:web-navigation`) if those are already being used in CI; otherwise add it to the same stage where `pnpm test` is executed.

Notes:

- Keep it as a separate CI step so failures are attributed to “web payments tests” clearly.
- If the CI matrix runs on multiple OSes, run this on **Linux** first (least path/loader friction), then extend to Windows once stable (see Windows section below).

## 3) Windows `ts-node` loader / ESM risk analysis

Current runners already rely on:

- Node `--loader ts-node/esm`
- `--experimental-specifier-resolution=node`
- ESM execution (`apps/web` is `"type": "module"`)

### Risks

- **Node loader deprecations / behavior drift**: `--loader` is still used, but Node has been evolving loader hooks; upgrades can introduce subtle changes.
- **Windows path + URL conversion**: loaders are resolved via filesystem paths and passed as URLs (`pathToFileURL`). This is usually safe, but edge cases can appear with spaces, drive letters, or path normalization.
- **ESM import resolution differences**: `--experimental-specifier-resolution=node` can mask missing extensions in imports; behavior can vary across environments and Node versions.
- **Workspace package resolution**: tests importing `@hallederiz/*` rely on PNPM workspace resolution; that’s typically consistent, but failures can surface if the runner’s `cwd` or `NODE_OPTIONS` differ.

### Mitigations (recommended)

- **Keep the runner identical** to existing web runners (copy the exact patterns).
- **Prefer running the new web payment runner in Linux CI first**, then add Windows as a follow-up once stable.
- Add a small “preflight” check in the runner (optional, later PR) to print Node version and loader resolution path on failure.

## 4) Implementation checklist for the follow-up PR (non-doc)

1. Add `scripts/run-web-payment-tests.cjs`
2. Add root script `test:web-payments`
3. Optionally add `apps/web` script alias (not required) — keep root scripts as source of truth.
4. Add CI step invoking `pnpm test:web-payments`
5. Confirm it runs locally on:
   - Windows (PowerShell)
   - Linux (CI)

## 5) Acceptance criteria (later PR)

- `pnpm test:web-payments` executes `payment-create-validation.test.ts` and passes.
- CI runs `pnpm test:web-payments` and fails if that test fails.
- No changes to existing `pnpm test` behavior unless explicitly desired.

