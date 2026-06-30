/**
 * Sprint 8 — Local staging operation chain smoke.
 * Hizli Islem (teklif) -> onay kuyrugu -> onayla -> Postgres'te teklif kaydi.
 *
 * Prerequisites:
 * - Postgres reachable (docker compose postgres or managed DB)
 * - Migrations applied (or STAGING_SKIP_MIGRATE unset for auto apply)
 * - AUTH_SEED_* credentials seeded (script runs seed:auth-admin)
 */
const {
  resolvePgClient,
  getDatabaseUrl,
  defaultLocalDatabaseUrl,
  sleep,
  fetchJson,
  waitForHealth,
  spawnSyncSafe,
  spawnApi,
  stopChild,
  authHeaders
} = require("./postgres-smoke-lib.cjs");

const { Client } = resolvePgClient();

const DEFAULT_PORT = 4012;
const CUSTOMER_ID = "customer_ci_1";

function fail(message) {
  console.error(`[staging-chain] FAIL: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[staging-chain] ${message}`);
}

function offerPayload() {
  return {
    operationType: "offer",
    customerId: CUSTOMER_ID,
    customerName: "CI Tahsilat Cari",
    note: "Local staging chain smoke",
    lines: [
      {
        id: "line_staging_1",
        productCode: "DKG-STG-001",
        productName: "Staging Test Urun",
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        sourceType: "auto",
        lineTotal: 120
      }
    ]
  };
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
    [CUSTOMER_ID, tenantId, "CI-001", "CI Tahsilat Cari", "bayi", "Istanbul", "+905000000000"]
  );
}

async function countOffers(client, tenantId) {
  const result = await client.query(
    "SELECT COUNT(*)::int AS count FROM offers WHERE tenant_id = $1 AND customer_id = $2",
    [tenantId, CUSTOMER_ID]
  );
  return result.rows[0]?.count ?? 0;
}

async function applyMigrations(databaseUrl) {
  log("migrate:apply basliyor...");
  const env = { ...process.env, DATABASE_URL: databaseUrl, POSTGRES_URL: databaseUrl };
  const build = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/database", "build"], env);
  if (!build.ok) {
    fail("database package build failed");
  }
  const migrate = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/database", "migrate:apply"], env);
  if (!migrate.ok) {
    fail("migrate:apply failed");
  }
}

async function seedAuthAdmin(databaseUrl) {
  const env = { ...process.env, DATABASE_URL: databaseUrl, POSTGRES_URL: databaseUrl };
  const result = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/api", "seed:auth-admin"], env);
  if (!result.ok) {
    fail("seed:auth-admin failed");
  }
}

async function login(baseUrl, origin, tenantSlug, email, password) {
  const login = await fetchJson(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ tenantSlug, email, password })
  });
  if (login.status !== 200 || !login.body?.accessToken) {
    fail(`auth login failed (${login.status})`);
  }
  return login.body.accessToken;
}

async function main() {
  const databaseUrl = getDatabaseUrl() ?? defaultLocalDatabaseUrl();
  const tenantSlug = process.env.AUTH_SEED_TENANT_SLUG?.trim() || "hallederiz";
  const adminEmail = process.env.AUTH_SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.AUTH_SEED_ADMIN_PASSWORD?.trim();
  if (!adminEmail || !adminPassword) {
    fail("AUTH_SEED_ADMIN_EMAIL and AUTH_SEED_ADMIN_PASSWORD are required");
  }

  if (!process.env.AUTH_SESSION_SECRET?.trim()) {
    process.env.AUTH_SESSION_SECRET = "local-staging-chain-secret-min-32-chars";
  }
  if (!process.env.TENANT_ENCRYPTION_KEY?.trim()) {
    process.env.TENANT_ENCRYPTION_KEY = "local-staging-tenant-encryption-key-32";
  }

  process.env.DATABASE_URL = databaseUrl;
  process.env.POSTGRES_URL = databaseUrl;

  const skipMigrate =
    process.env.STAGING_SKIP_MIGRATE === "1" || process.env.STAGING_SKIP_MIGRATE === "true";
  if (!skipMigrate) {
    await applyMigrations(databaseUrl);
  } else {
    log("migrate atlandi (STAGING_SKIP_MIGRATE=1)");
  }

  log("auth admin seed");
  await seedAuthAdmin(databaseUrl);

  const pg = new Client({ connectionString: databaseUrl });
  await pg.connect();
  const tenantRow = await pg.query("SELECT id FROM tenants WHERE LOWER(slug) = LOWER($1) LIMIT 1", [tenantSlug]);
  const tenantId = tenantRow.rows[0]?.id;
  if (!tenantId) {
    fail(`tenant not found for slug ${tenantSlug}`);
  }
  await ensureCiCustomer(pg, tenantId);
  const offersBefore = await countOffers(pg, tenantId);

  const useExistingApi =
    process.env.STAGING_USE_EXISTING_API === "1" || process.env.STAGING_USE_EXISTING_API === "true";
  const port = Number(process.env.STAGING_CHAIN_API_PORT ?? DEFAULT_PORT);
  const baseUrl = useExistingApi
    ? (process.env.STAGING_API_BASE_URL ?? process.env.SMOKE_API_BASE_URL ?? "http://127.0.0.1:4000").replace(
        /\/$/,
        ""
      )
    : `http://127.0.0.1:${port}`;
  const allowedOrigin = process.env.WEB_URL?.trim() || "http://localhost:3000";

  let apiProcess = null;
  if (!useExistingApi) {
    log(`API baslatiliyor: ${baseUrl}`);
    const entrypoints = spawnSyncSafe("node", ["scripts/ci/ensure-workspace-entrypoints.cjs"]);
    if (!entrypoints.ok) {
      fail("ensure-workspace-entrypoints failed");
    }
    const buildApi = spawnSyncSafe("pnpm", ["--filter", "@hallederiz/api...", "build"]);
    if (!buildApi.ok) {
      fail("@hallederiz/api build failed");
    }
    apiProcess = spawnApi(port, {
      API_CORS_ORIGINS: allowedOrigin,
      APP_BASE_URL: allowedOrigin
    });
    await waitForHealth(baseUrl);
  } else {
    log(`Mevcut API kullaniliyor: ${baseUrl}`);
    await waitForHealth(baseUrl, 15000);
  }

  try {
    const token = await login(baseUrl, allowedOrigin, tenantSlug, adminEmail, adminPassword);
    const headers = authHeaders(token, allowedOrigin);

    const readiness = await fetchJson(`${baseUrl}/platform/production-readiness`, { headers });
    if (readiness.status !== 200) {
      fail(`production-readiness expected 200, got ${readiness.status}`);
    }
    if (readiness.body?.persistence?.mode !== "postgres") {
      fail(
        `API persistence mode postgres olmali (su an: ${readiness.body?.persistence?.mode ?? "unknown"}). ` +
          "Yerel API'yi PERSISTENCE_MODE=postgres ile baslatin veya script'in kendi API'sini kullanin."
      );
    }

    const idempotencyKey = `staging_qop_offer_${Date.now()}`;
    const submit = await fetchJson(`${baseUrl}/quick-operations/submit`, {
      method: "POST",
      headers: { ...authHeaders(token, allowedOrigin, { jsonBody: true }), "idempotency-key": idempotencyKey },
      body: JSON.stringify(offerPayload())
    });
    if (submit.status !== 200) {
      fail(`quick-operations/submit expected 200, got ${submit.status}: ${JSON.stringify(submit.body)}`);
    }

    const item = submit.body?.item ?? submit.body;
    if (!item?.approvalId || item.mode !== "queued_for_approval") {
      fail(
        `submit onay kuyruguna alinmadi (mode=${item?.mode ?? "unknown"}, approvalId=${item?.approvalId ?? "none"})`
      );
    }
    log(`onay kaydi olusturuldu: ${item.approvalId}`);

    const approvals = await fetchJson(`${baseUrl}/platform/approvals`, { headers });
    if (approvals.status !== 200) {
      fail(`platform/approvals expected 200, got ${approvals.status}`);
    }
    const pending = (approvals.body?.items ?? []).find(
      (row) => row.approvalRequestId === item.approvalId || row.id === item.approvalId
    );
    if (!pending) {
      fail(`onay listesinde ${item.approvalId} bulunamadi`);
    }

    const approve = await fetchJson(`${baseUrl}/platform/approvals/${item.approvalId}/approve`, {
      method: "POST",
      headers: authHeaders(token, allowedOrigin, { jsonBody: true }),
      body: "{}"
    });
    if (approve.status !== 200 || !approve.body?.ok) {
      fail(`approve failed (${approve.status}): ${JSON.stringify(approve.body)}`);
    }

    const reasons = [
      ...(approve.body?.reasons ?? []),
      ...(approve.body?.bridgeResult?.executionResult?.reasons ?? [])
    ];
    const entityReason = reasons.find((reason) => typeof reason === "string" && reason.startsWith("entity_id:"));
    if (entityReason) {
      log(`onay sonrasi entity: ${entityReason}`);
    }

    await sleep(500);
    const offersAfter = await countOffers(pg, tenantId);
    if (offersAfter <= offersBefore) {
      fail(`offers tablosu artmadi (${offersBefore} -> ${offersAfter})`);
    }

    const offersList = await fetchJson(`${baseUrl}/offers?customerId=${CUSTOMER_ID}`, { headers });
    if (offersList.status !== 200) {
      fail(`GET /offers expected 200, got ${offersList.status}`);
    }
    const listed = offersList.body?.items ?? offersList.body ?? [];
    const hasNewOffer = Array.isArray(listed) && listed.length > 0;
    if (!hasNewOffer) {
      fail("GET /offers bos dondu; teklif listesi dogrulanamadi");
    }

    log(`PASS — Hizli Islem teklif -> onay -> teklif kaydi (${offersBefore} -> ${offersAfter} offers)`);
  } finally {
    await pg.end();
    if (apiProcess) {
      await stopChild(apiProcess);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
