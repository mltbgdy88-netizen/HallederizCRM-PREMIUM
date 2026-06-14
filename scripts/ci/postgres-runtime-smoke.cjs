/**
 * SEC-3C: Boot API against Postgres and verify runtime idempotency + auth/origin guards.
 * Requires DATABASE_URL, migrated schema, and AUTH_SEED_* credentials.
 */
const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = path.join(__dirname, "..", "..");

function resolvePgClient() {
  const candidates = [
    path.join(root, "packages", "database"),
    path.join(root, "apps", "api"),
    root
  ];
  for (const candidate of candidates) {
    try {
      return require(require.resolve("pg", { paths: [candidate] }));
    } catch {
      // try next
    }
  }
  throw new Error("pg module not found. Run pnpm install.");
}

const { Client } = resolvePgClient();
const apiDir = path.join(root, "apps", "api");
const DEFAULT_PORT = 4010;
const HEALTH_PATH = "/health";

function fail(message) {
  console.error(`[postgres-runtime-smoke] FAIL: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[postgres-runtime-smoke] ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function waitForHealth(baseUrl, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const { status, body } = await fetchJson(`${baseUrl}${HEALTH_PATH}`);
      if (status === 200 && body?.status === "ok") {
        return;
      }
    } catch {
      // API still booting
    }
    await sleep(1000);
  }
  fail(`health check timed out for ${baseUrl}${HEALTH_PATH}`);
}

function spawnApi(port) {
  const loaderPath = require.resolve("ts-node/esm", { paths: [apiDir] });
  const loaderUrl = pathToFileURL(loaderPath).href;
  const child = spawn(process.execPath, ["--experimental-specifier-resolution=node", "--loader", loaderUrl, "src/index.ts"], {
    cwd: apiDir,
    env: {
      ...process.env,
      PORT_API: String(port),
      HOST_API: "127.0.0.1",
      NODE_ENV: process.env.NODE_ENV ?? "test",
      PERSISTENCE_MODE: "postgres",
      DEMO_AUTH_ENABLED: "false",
      ALLOW_DEMO_FALLBACK: "false"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout?.on("data", (chunk) => {
    const text = chunk.toString();
    if (text.includes("error") || text.includes("Error")) {
      process.stderr.write(`[api] ${text}`);
    }
  });
  child.stderr?.on("data", (chunk) => process.stderr.write(`[api] ${chunk.toString()}`));

  return child;
}

function spawnSyncSafe(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    shell: true
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    return { ok: false };
  }
  return { ok: true, output: `${result.stdout}\n${result.stderr}` };
}

async function seedAuthAdmin() {
  const result = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/api", "seed:auth-admin"]);
  if (!result.ok) {
    fail("seed:auth-admin failed");
  }
}

async function ensureCiCustomer(client, tenantId) {
  await client.query(
    `
      INSERT INTO customers (
        id, tenant_id, code, name, type, city, phone, is_active, risk_level, whatsapp_matched, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, 'low', FALSE, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `,
    ["customer_ci_1", tenantId, "CI-001", "CI Tahsilat Cari", "bayi", "Istanbul", "+905000000000"]
  );
}

function paymentResponseFingerprint(body) {
  if (!body || typeof body !== "object") {
    return String(body);
  }
  return JSON.stringify({
    status: body.status,
    reason: body.reason,
    policyDecision: body.policyDecision,
    approvalRequired: body.approvalRequired,
    approvalRequestId: body.approvalRequestId,
    itemId: body.item?.id,
    receiptNo: body.item?.receiptNo,
    amount: body.item?.amount
  });
}

async function countIdempotencyRecords(client, scope) {
  const result = await client.query(
    "SELECT COUNT(*)::int AS count FROM idempotency_records WHERE scope = $1",
    [scope]
  );
  return result.rows[0]?.count ?? 0;
}

function getDatabaseUrl() {
  const direct = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (direct?.trim()) {
    return direct.trim();
  }
  const user = process.env.PGUSER?.trim();
  const password = process.env.PGPASSWORD?.trim();
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const database = process.env.PGDATABASE?.trim();
  if (!user || !password || !database) {
    return undefined;
  }
  return ["postgresql://", user, ":", password, "@", host, ":", port, "/", database].join("");
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    fail("DATABASE_URL or PGUSER/PGPASSWORD/PGDATABASE is required");
  }

  const adminEmail = process.env.AUTH_SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.AUTH_SEED_ADMIN_PASSWORD?.trim();
  if (!adminEmail || !adminPassword) {
    fail("AUTH_SEED_ADMIN_EMAIL and AUTH_SEED_ADMIN_PASSWORD are required");
  }

  if (!process.env.AUTH_SESSION_SECRET?.trim()) {
    process.env.AUTH_SESSION_SECRET = "ci-sec3c-session-secret-min-32-characters";
  }

  process.env.DATABASE_URL = databaseUrl;
  process.env.POSTGRES_URL = databaseUrl;

  log("ensuring workspace entrypoints");
  const entrypointsResult = spawnSyncSafe("node", ["scripts/ci/ensure-workspace-entrypoints.cjs"]);
  if (!entrypointsResult.ok) {
    fail("ensure-workspace-entrypoints failed");
  }

  log("building @hallederiz/api dependency graph");
  const buildResult = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/api...", "build"]);
  if (!buildResult.ok) {
    fail("@hallederiz/api dependency build failed");
  }

  const tenantSlug = process.env.AUTH_SEED_TENANT_SLUG?.trim() || "hallederiz";
  const allowedOrigin = process.env.WEB_URL?.trim() || "https://app.example.com";
  const evilOrigin = "https://evil.example.com";
  const port = Number(process.env.PORT_API ?? DEFAULT_PORT);
  const baseUrl = `http://127.0.0.1:${port}`;

  log("seeding auth admin");
  await seedAuthAdmin();

  const pg = new Client({ connectionString: databaseUrl });
  await pg.connect();
  const tenantRow = await pg.query("SELECT id FROM tenants WHERE LOWER(slug) = LOWER($1) LIMIT 1", [tenantSlug]);
  const tenantId = tenantRow.rows[0]?.id;
  if (!tenantId) {
    fail(`tenant not found for slug ${tenantSlug}`);
  }
  await ensureCiCustomer(pg, tenantId);
  const beforeCount = await countIdempotencyRecords(pg, "payments.create");

  log(`starting API on ${baseUrl}`);
  const apiProcess = spawnApi(port);
  let apiExited = false;
  apiProcess.on("exit", (code) => {
    apiExited = true;
    if (code !== 0 && code !== null) {
      console.error(`[postgres-runtime-smoke] API exited with code ${code}`);
    }
  });

  try {
    await waitForHealth(baseUrl);

    const health = await fetchJson(`${baseUrl}${HEALTH_PATH}`);
    if (health.status !== 200 || health.body?.status !== "ok") {
      fail(`/health expected 200 ok, got ${health.status}`);
    }

    const importsUnauth = await fetchJson(`${baseUrl}/imports/templates`);
    if (importsUnauth.status !== 401) {
      fail(`imports without auth expected 401, got ${importsUnauth.status}`);
    }

    const login = await fetchJson(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: allowedOrigin
      },
      body: JSON.stringify({
        tenantSlug,
        email: adminEmail,
        password: adminPassword
      })
    });
    if (login.status !== 200 || !login.body?.accessToken) {
      fail(`auth login failed with status ${login.status}`);
    }
    const token = login.body.accessToken;

    const readiness = await fetchJson(`${baseUrl}/platform/production-readiness`, {
      headers: {
        authorization: `Bearer ${token}`,
        "x-session-token": token,
        origin: allowedOrigin
      }
    });
    if (readiness.status !== 200) {
      fail(`production-readiness expected 200, got ${readiness.status}`);
    }
    if (readiness.body?.persistence?.mode !== "postgres") {
      fail(`expected persistence mode postgres, got ${readiness.body?.persistence?.mode}`);
    }

    const missingKey = await fetchJson(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "x-session-token": token,
        origin: allowedOrigin
      },
      body: JSON.stringify({
        customerId: "customer_ci_1",
        amount: 500,
        method: "transfer"
      })
    });
    if (missingKey.status !== 400 || missingKey.body?.reason !== "idempotency_key_required") {
      fail(`missing idempotency key expected 400 idempotency_key_required, got ${missingKey.status}`);
    }

    const evilOriginPayment = await fetchJson(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "x-session-token": token,
        origin: evilOrigin,
        "idempotency-key": "ci_evil_origin_key"
      },
      body: JSON.stringify({
        customerId: "customer_ci_1",
        amount: 500,
        method: "transfer"
      })
    });
    if (evilOriginPayment.status !== 403 || evilOriginPayment.body?.reason !== "origin_not_allowed") {
      fail(`evil origin expected 403 origin_not_allowed, got ${evilOriginPayment.status}`);
    }

    const idempotencyKey = `ci_pay_${Date.now()}`;
    const paymentPayload = {
      customerId: "customer_ci_1",
      amount: 750,
      method: "transfer",
      status: "draft",
      description: "CI runtime smoke payment"
    };
    const paymentHeaders = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "x-session-token": token,
      origin: allowedOrigin,
      "idempotency-key": idempotencyKey
    };

    const firstPayment = await fetchJson(`${baseUrl}/payments`, {
      method: "POST",
      headers: paymentHeaders,
      body: JSON.stringify(paymentPayload)
    });
    if (![200, 201, 202].includes(firstPayment.status)) {
      fail(`payment create unexpected status ${firstPayment.status}`);
    }

    const secondPayment = await fetchJson(`${baseUrl}/payments`, {
      method: "POST",
      headers: paymentHeaders,
      body: JSON.stringify(paymentPayload)
    });
    if (secondPayment.status !== firstPayment.status) {
      fail(`idempotency replay status mismatch ${firstPayment.status} vs ${secondPayment.status}`);
    }
    if (paymentResponseFingerprint(secondPayment.body) !== paymentResponseFingerprint(firstPayment.body)) {
      fail("idempotency replay body fingerprint mismatch");
    }

    const conflict = await fetchJson(`${baseUrl}/payments`, {
      method: "POST",
      headers: paymentHeaders,
      body: JSON.stringify({
        ...paymentPayload,
        amount: 999
      })
    });
    if (conflict.status !== 409 || conflict.body?.reason !== "idempotency_key_conflict") {
      fail(`idempotency conflict expected 409, got ${conflict.status}`);
    }

    const afterCount = await countIdempotencyRecords(pg, "payments.create");
    if (afterCount <= beforeCount) {
      fail(`idempotency_records count did not increase (${beforeCount} -> ${afterCount})`);
    }

    log("PASS");
  } finally {
    if (!apiExited) {
      apiProcess.kill("SIGTERM");
      await sleep(1500);
      if (!apiProcess.killed) {
        apiProcess.kill("SIGKILL");
      }
    }
    await pg.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
