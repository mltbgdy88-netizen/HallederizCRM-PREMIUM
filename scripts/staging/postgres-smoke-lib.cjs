/**
 * Shared Postgres helpers for local staging scripts.
 */
const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = path.resolve(__dirname, "..", "..");

function resolvePgClient() {
  const candidates = [
    path.join(repoRoot, "packages", "database"),
    path.join(repoRoot, "apps", "api"),
    repoRoot
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
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

function defaultLocalDatabaseUrl() {
  return "postgres://hallederiz:hallederiz_dev@127.0.0.1:5432/hallederizcrm";
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

async function waitForHealth(baseUrl, timeoutMs = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const { status, body } = await fetchJson(`${baseUrl.replace(/\/$/, "")}/health`);
      if (status === 200 && body?.status === "ok") {
        return;
      }
    } catch {
      // still booting
    }
    await sleep(1000);
  }
  throw new Error(`health check timed out for ${baseUrl}/health`);
}

function spawnSyncSafe(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env,
    encoding: "utf8",
    shell: true
  });
  if (result.status !== 0) {
    return { ok: false, output: `${result.stdout}\n${result.stderr}` };
  }
  return { ok: true, output: `${result.stdout}\n${result.stderr}` };
}

function spawnApi(port, extraEnv = {}) {
  const apiDir = path.join(repoRoot, "apps", "api");
  const loaderPath = require.resolve("ts-node/esm", { paths: [apiDir] });
  const loaderUrl = pathToFileURL(loaderPath).href;
  const child = spawn(
    process.execPath,
    ["--experimental-specifier-resolution=node", "--loader", loaderUrl, "src/index.ts"],
    {
      cwd: apiDir,
      env: {
        ...process.env,
        PORT_API: String(port),
        HOST_API: "127.0.0.1",
        NODE_ENV: process.env.NODE_ENV ?? "development",
        PERSISTENCE_MODE: "postgres",
        DEMO_AUTH_ENABLED: "false",
        ALLOW_DEMO_FALLBACK: "false",
        LOCAL_PILOT_AUTH_ENABLED: "false",
        ...extraEnv
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );
  child.stderr?.on("data", (chunk) => process.stderr.write(`[api] ${chunk.toString()}`));
  return child;
}

async function stopChild(child) {
  if (!child || child.exitCode != null) {
    return;
  }
  child.kill("SIGTERM");
  await sleep(1500);
  if (child.exitCode == null) {
    child.kill("SIGKILL");
  }
}

function authHeaders(token, origin, { jsonBody = false } = {}) {
  const headers = {
    authorization: `Bearer ${token}`,
    "x-session-token": token,
    origin
  };
  if (jsonBody) {
    headers["content-type"] = "application/json";
  }
  return headers;
}

module.exports = {
  repoRoot,
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
};
