/**
 * SEC-3C: Apply migrations on a fresh CI Postgres DB and verify 0015 idempotency schema.
 * Requires DATABASE_URL (or POSTGRES_URL).
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

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

const EXPECTED_MIGRATION_COUNT = 16;
const REQUIRED_COLUMNS = [
  "tenant_id",
  "scope",
  "idempotency_key",
  "request_hash",
  "expires_at"
];

function fail(message) {
  console.error(`[postgres-migration-smoke] FAIL: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[postgres-migration-smoke] ${message}`);
}

function runPnpm(args) {
  const result = spawnSync("pnpm", args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    shell: true
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`command failed: pnpm ${args.join(" ")}`);
  }
  return `${result.stdout}\n${result.stderr}`;
}

async function verifySchema(client) {
  const table = await client.query(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'idempotency_records'
    `
  );
  if (table.rowCount !== 1) {
    fail("idempotency_records table missing after migrate:apply");
  }

  const columns = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'idempotency_records'
    `
  );
  const columnNames = columns.rows.map((row) => row.column_name);
  for (const name of REQUIRED_COLUMNS) {
    if (!columnNames.includes(name)) {
      fail(`missing column on idempotency_records: ${name}`);
    }
  }

  const unique = await client.query(
    `
      SELECT COUNT(*)::int AS count
      FROM pg_constraint
      WHERE conrelid = 'idempotency_records'::regclass
        AND contype = 'u'
    `
  );
  if (unique.rows[0]?.count < 1) {
    fail("unique constraint missing on idempotency_records");
  }

  const uniqueCols = await client.query(
    `
      SELECT a.attname
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attrelid = c.conrelid
       AND a.attnum = ANY (c.conkey)
      WHERE c.conrelid = 'idempotency_records'::regclass
        AND c.contype = 'u'
      ORDER BY a.attnum
    `
  );
  const uniqueColumnSet = uniqueCols.rows.map((row) => row.attname).join(",");
  if (uniqueColumnSet !== "tenant_id,scope,idempotency_key") {
    fail(`unexpected unique columns on idempotency_records: ${uniqueColumnSet}`);
  }

  const expiresIndex = await client.query(
    `
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'idempotency_records'
        AND indexname = 'idx_idempotency_records_expires_at'
    `
  );
  if (expiresIndex.rowCount !== 1) {
    fail("idx_idempotency_records_expires_at index missing");
  }
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

  log("building @hallederiz/database");
  runPnpm(["--filter", "@hallederiz/database", "build"]);

  process.env.DATABASE_URL = databaseUrl;
  process.env.POSTGRES_URL = databaseUrl;

  log("first migrate:apply");
  const firstOutput = runPnpm(["--filter", "@hallederiz/database", "migrate:apply"]);
  const firstApplied = (firstOutput.match(/\bAPPLIED\b/g) || []).length;
  const firstSkipped = (firstOutput.match(/\bSKIPPED\b/g) || []).length;
  if (firstApplied !== EXPECTED_MIGRATION_COUNT) {
    fail(`expected ${EXPECTED_MIGRATION_COUNT} APPLIED on first run, got ${firstApplied}`);
  }
  if (firstSkipped !== 0) {
    fail(`expected 0 SKIPPED on first run, got ${firstSkipped}`);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const migrationCount = await client.query("SELECT COUNT(*)::int AS count FROM schema_migrations");
  if (migrationCount.rows[0]?.count !== EXPECTED_MIGRATION_COUNT) {
    fail(`schema_migrations count ${migrationCount.rows[0]?.count}, expected ${EXPECTED_MIGRATION_COUNT}`);
  }

  const idempotencyMigration = await client.query(
    "SELECT 1 FROM schema_migrations WHERE name = '0015_idempotency_records'"
  );
  if (idempotencyMigration.rowCount !== 1) {
    fail("0015_idempotency_records not recorded in schema_migrations");
  }

  await verifySchema(client);
  await client.end();

  log("second migrate:apply (idempotent)");
  const secondOutput = runPnpm(["--filter", "@hallederiz/database", "migrate:apply"]);
  const secondApplied = (secondOutput.match(/\bAPPLIED\b/g) || []).length;
  const secondSkipped = (secondOutput.match(/\bSKIPPED\b/g) || []).length;
  if (secondApplied !== 0) {
    fail(`expected 0 APPLIED on second run, got ${secondApplied}`);
  }
  if (secondSkipped !== EXPECTED_MIGRATION_COUNT) {
    fail(`expected ${EXPECTED_MIGRATION_COUNT} SKIPPED on second run, got ${secondSkipped}`);
  }

  log("PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
