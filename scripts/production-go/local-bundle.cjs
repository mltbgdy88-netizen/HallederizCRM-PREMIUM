/**
 * Sprint 9 — Local Production Go prep bundle.
 * Runs navigation smoke, optional Postgres migration smoke, staging chain,
 * local-ai health, and optional API /health/local-ai probe.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");

function log(message) {
  console.log(`[production-go:local] ${message}`);
}

function fail(message) {
  console.error(`[production-go:local] FAIL: ${message}`);
  process.exit(1);
}

function isTruthy(value) {
  return value === "1" || value === "true" || value === "yes";
}

function runStep(name, args, options = {}) {
  log(`→ ${name}`);
  const result = spawnSync("pnpm", args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    shell: true,
    stdio: options.quiet ? "pipe" : "inherit"
  });
  if (result.status !== 0) {
    if (options.optional) {
      log(`  skip (optional): ${name} exited ${result.status ?? "unknown"}`);
      return false;
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    fail(`${name} failed`);
  }
  return true;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function probeApiLocalAiHealth() {
  const baseUrl = (
    process.env.PRODUCTION_GO_API_BASE_URL ??
    process.env.STAGING_API_BASE_URL ??
    `http://127.0.0.1:${process.env.PORT_API ?? "4000"}`
  ).replace(/\/+$/, "");

  const adminEmail = process.env.AUTH_SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.AUTH_SEED_ADMIN_PASSWORD?.trim();
  const tenantSlug = process.env.AUTH_SEED_TENANT_SLUG?.trim() || "hallederiz";
  const allowedOrigin = process.env.WEB_URL?.trim() || "http://localhost:3000";

  if (!adminEmail || !adminPassword) {
    log("skip API /health/local-ai (AUTH_SEED_* missing)");
    return;
  }

  log(`→ API /health/local-ai via ${baseUrl}`);
  const login = await fetchJson(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: allowedOrigin },
    body: JSON.stringify({ tenantSlug, email: adminEmail, password: adminPassword })
  });
  if (login.status !== 200 || !login.body?.accessToken) {
    if (isTruthy(process.env.PRODUCTION_GO_OPTIONAL_API)) {
      log(`  skip (optional): login failed with ${login.status}`);
      return;
    }
    fail(`API login for local-ai health failed with ${login.status}`);
  }

  const token = login.body.accessToken;
  const health = await fetchJson(`${baseUrl}/health/local-ai`, {
    headers: {
      authorization: `Bearer ${token}`,
      "x-session-token": token,
      origin: allowedOrigin
    }
  });
  if (health.status !== 200 || !health.body?.item) {
    if (isTruthy(process.env.PRODUCTION_GO_OPTIONAL_API)) {
      log(`  skip (optional): /health/local-ai returned ${health.status}`);
      return;
    }
    fail(`/health/local-ai expected 200, got ${health.status}`);
  }

  const item = health.body.item;
  log(
    `  local-ai state=${item.state} ready=${item.ready} configured=${item.configured} status=${item.status}`
  );
  if (!isTruthy(process.env.PRODUCTION_GO_ALLOW_DEGRADED_AI) && item.ready !== true) {
    log("  note: set PRODUCTION_GO_ALLOW_DEGRADED_AI=1 to accept non-ready local-ai");
    if (!isTruthy(process.env.PRODUCTION_GO_OPTIONAL_API)) {
      fail("local-ai not ready (Ollama/local-ai-service ayakta mı?)");
    }
  }
}

async function main() {
  log("starting local Production Go prep bundle");

  runStep("smoke:navigation", ["smoke:navigation"]);

  if (process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim()) {
    if (!isTruthy(process.env.PRODUCTION_GO_SKIP_MIGRATION_SMOKE)) {
      runStep("ci:postgres-migration-smoke", ["ci:postgres-migration-smoke"]);
    }
  } else {
    log("skip ci:postgres-migration-smoke (DATABASE_URL not set)");
  }

  if (!isTruthy(process.env.PRODUCTION_GO_SKIP_STAGING_CHAIN)) {
    if (process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim()) {
      runStep("staging:local-chain", ["staging:local-chain"]);
    } else {
      log("skip staging:local-chain (DATABASE_URL not set)");
    }
  } else {
    log("skip staging:local-chain (PRODUCTION_GO_SKIP_STAGING_CHAIN=1)");
  }

  runStep("local-ai:smoke", ["local-ai:smoke"], { optional: isTruthy(process.env.PRODUCTION_GO_OPTIONAL_LOCAL_AI) });

  await probeApiLocalAiHealth();

  log("PASS — yerel Production Go prep tamamlandı");
  log("Manuel: viewport QA + WhatsApp prod credential (bkz. SPRINT_9_PRODUCTION_GO_PREP.md)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
