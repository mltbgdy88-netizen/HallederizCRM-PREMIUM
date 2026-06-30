/**
 * Shared helpers for HTTP-level web smoke scripts (production-data, api-offline).
 * No extra dependencies — Node 20+ fetch + child_process.
 */
const { execSync, spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

/** Core routes from production / API-offline manual smoke reports. */
const HTTP_SMOKE_ROUTES = [
  "/login",
  "/dashboard",
  "/panel",
  "/onaylar",
  "/cariler",
  "/cariler/yeni",
  "/cariler/customer_1",
  "/stok",
  "/hizli-islem",
  "/hizli-islem?customer=customer_1",
  "/teklifler",
  "/teklifler/yeni",
  "/teklifler/yeni?customer=customer_1",
  "/siparisler",
  "/siparisler/yeni",
  "/siparisler/yeni?customer=customer_1",
  "/tahsilatlar",
  "/tahsilatlar/yeni",
  "/tahsilatlar/yeni?customer=customer_1",
  "/belgeler",
  "/belgeler?customer=customer_1&type=statement_pdf",
  "/gelen-kutu",
  "/archive",
  "/archive?customer=customer_1",
  "/whatsapp",
  "/whatsapp?customer=customer_1",
  "/erp",
  "/fabrikalar/stoklar",
  "/fabrikalar/siparisler"
];

const CRASH_HTML_PATTERNS = [
  /Internal Server Error/i,
  /Application error: a server-side exception/i,
  /Application error: a client-side exception/i,
  /Unhandled Runtime Error/i,
  /ModuleBuildError/i,
  /"statusCode"\s*:\s*500/,
  /__NEXT_DATA__[\s\S]*"err"\s*:\s*\{/
];

const TECHNICAL_HTML_PATTERNS = [
  /Failed to fetch/i,
  /ECONNREFUSED/i,
  /NetworkError when attempting to fetch resource/i
];

function parsePort(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveNextBin() {
  return require.resolve("next/dist/bin/next", {
    paths: [path.join(repoRoot, "apps", "web"), repoRoot]
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeApiHealth(apiBaseUrl, timeoutMs = 4000) {
  const candidates = [apiBaseUrl.replace(/\/$/, "")];
  const normalized = candidates[0];
  if (normalized.includes("localhost")) {
    candidates.push(normalized.replace("localhost", "127.0.0.1"));
  } else if (normalized.includes("127.0.0.1")) {
    candidates.push(normalized.replace("127.0.0.1", "localhost"));
  }

  for (const base of [...new Set(candidates)]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${base}/health`, { signal: controller.signal });
      if (response.ok) {
        return true;
      }
    } catch {
      // try next host
    } finally {
      clearTimeout(timer);
    }
  }
  return false;
}

function detectHtmlIssues(html, { checkTechnical = false } = {}) {
  const issues = [];
  for (const pattern of CRASH_HTML_PATTERNS) {
    if (pattern.test(html)) {
      issues.push(`crash pattern: ${pattern}`);
    }
  }
  if (checkTechnical) {
    for (const pattern of TECHNICAL_HTML_PATTERNS) {
      if (pattern.test(html)) {
        issues.push(`technical leak: ${pattern}`);
      }
    }
  }
  return issues;
}

async function fetchRoute(baseUrl, routePath, timeoutMs = 90000) {
  const url = `${baseUrl.replace(/\/$/, "")}${routePath.startsWith("/") ? routePath : `/${routePath}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: { Accept: "text/html" }
    });
    const status = response.status;
    const location = response.headers.get("location");
    let body = "";
    if (status !== 204 && status < 300) {
      body = await response.text();
    }
    return { url, status, location, body, error: null };
  } catch (error) {
    return {
      url,
      status: 0,
      location: null,
      body: "",
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timer);
  }
}

function isAcceptableHttpStatus(status, location) {
  if (status >= 200 && status < 400) {
    return true;
  }
  if (status >= 300 && status < 400) {
    const target = location ?? "";
    return target.includes("/login") || target.startsWith("/");
  }
  return false;
}

function waitForChildExit(child, timeoutMs) {
  return new Promise((resolve) => {
    if (child.exitCode != null || child.signalCode != null) {
      resolve(true);
      return;
    }
    let settled = false;
    const finish = (ok) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    child.once("exit", () => finish(true));
    child.once("error", () => finish(true));
  });
}

function releaseChildIo(child, onData) {
  if (child.stdout) {
    child.stdout.removeListener("data", onData);
    child.stdout.removeAllListeners();
    child.stdout.destroy();
  }
  if (child.stderr) {
    child.stderr.removeListener("data", onData);
    child.stderr.removeAllListeners();
    child.stderr.destroy();
  }
  child.removeAllListeners();
}

function runTaskkillTree(pid) {
  return new Promise((resolve) => {
    if (!pid) {
      resolve();
      return;
    }
    const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
      shell: true,
      stdio: "ignore",
      windowsHide: true
    });
    const timer = setTimeout(resolve, 8000);
    killer.once("close", () => {
      clearTimeout(timer);
      resolve();
    });
    killer.once("error", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

/** POSIX: process group; Windows: taskkill /T on root pid (shell or pnpm). */
async function killChildTree(child) {
  if (!child || child.pid == null) {
    return;
  }

  const isWindows = process.platform === "win32";

  if (isWindows) {
    await runTaskkillTree(child.pid);
    await waitForChildExit(child, 5000);
    return;
  }

  const pgid = child.pid;
  try {
    process.kill(-pgid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }

  let exited = await waitForChildExit(child, 6000);
  if (!exited) {
    try {
      process.kill(-pgid, "SIGKILL");
    } catch {
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }
    await waitForChildExit(child, 3000);
  }
}

/** Best-effort: free listen port if child tree survived (common on CI when pnpm spawns next). */
function killPortListeners(port) {
  const portNum = Number(port);
  if (!Number.isFinite(portNum) || portNum <= 0) {
    return;
  }
  try {
    if (process.platform === "win32") {
      const ps = `Get-NetTCPConnection -LocalPort ${portNum} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`;
      execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "ignore", timeout: 8000 });
    } else {
      execSync(`fuser -k ${portNum}/tcp 2>/dev/null || true`, { stdio: "ignore", timeout: 8000 });
    }
  } catch {
    // ignore
  }
}

async function stopWebDevServer(server) {
  if (!server) {
    return;
  }
  if (server._stopPromise) {
    return server._stopPromise;
  }
  server._stopPromise = (async () => {
    const { child, port, onData } = server;
    releaseChildIo(child, onData);
    await killChildTree(child);
    killPortListeners(port);
  })();
  return server._stopPromise;
}

async function probeWebRoute(baseUrl, routePath = "/login", timeoutMs = 20000) {
  const bases = [baseUrl.replace(/\/$/, "")];
  if (bases[0].includes("127.0.0.1")) {
    bases.push(bases[0].replace("127.0.0.1", "localhost"));
  } else if (bases[0].includes("localhost")) {
    bases.push(bases[0].replace("localhost", "127.0.0.1"));
  }

  for (const base of [...new Set(bases)]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${base}${routePath}`, {
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "text/html" }
      });
      if (response.status > 0) {
        return { ok: true, status: response.status, base };
      }
    } catch {
      // try next host
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: 0, base: baseUrl };
}

async function waitForWebReady(baseUrl, timeoutMs = 600000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const probe = await probeWebRoute(baseUrl, "/login", 20000);
    if (probe.ok) {
      return true;
    }
    await sleep(3000);
  }
  return false;
}

function startWebDevServer({ port, envExtra }) {
  const portValue = parsePort(port, 3199);
  const webDir = path.join(repoRoot, "apps", "web");
  const env = {
    ...process.env,
    ...envExtra,
    PORT: String(portValue),
    /** Reduce noise in CI logs */
    NEXT_TELEMETRY_DISABLED: "1"
  };

  const isWindows = process.platform === "win32";
  const nextBin = resolveNextBin();
  const child = spawn(
    process.execPath,
    [nextBin, "dev", "-H", "127.0.0.1", "-p", String(portValue)],
    {
      cwd: webDir,
      env,
      shell: isWindows,
      windowsHide: true,
      detached: !isWindows,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  let ready = false;
  let bootLog = "";
  const baseUrl = `http://127.0.0.1:${portValue}`;

  const onData = (chunk) => {
    const text = chunk.toString();
    bootLog = `${bootLog}${text}`.slice(-4000);
    /** Next prints Local: during Starting; only Ready in means the dev server accepts requests. */
    if (/Ready in/i.test(text) || /✓ Ready/i.test(text)) {
      ready = true;
    }
  };

  child.stdout?.on("data", onData);
  child.stderr?.on("data", onData);

  const server = {
    child,
    baseUrl,
    port: portValue,
    onData,
    getReadyFlag: () => ready,
    getBootLog: () => bootLog,
    _stopPromise: null,
    stop: () => stopWebDevServer(server)
  };

  return server;
}

function buildWebApp(envExtra) {
  const webDir = path.join(repoRoot, "apps", "web");
  const env = {
    ...process.env,
    ...envExtra,
    NEXT_TELEMETRY_DISABLED: "1"
  };
  const isWindows = process.platform === "win32";
  const nextBin = resolveNextBin();
  console.log("[smoke] next build basliyor...");
  execSync(`"${process.execPath}" "${nextBin}" build`, {
    cwd: webDir,
    env,
    stdio: "inherit",
    shell: isWindows
  });
}

function startWebProductionServer({ port, envExtra }) {
  const portValue = parsePort(port, 3198);
  const webDir = path.join(repoRoot, "apps", "web");
  const env = {
    ...process.env,
    ...envExtra,
    PORT: String(portValue),
    HOSTNAME: "127.0.0.1",
    NEXT_TELEMETRY_DISABLED: "1"
  };
  const isWindows = process.platform === "win32";
  let bootLog = "";
  const onData = (chunk) => {
    bootLog = `${bootLog}${chunk.toString()}`.slice(-4000);
  };
  const child = spawn("pnpm", ["start"], {
    cwd: webDir,
    env,
    shell: isWindows,
    windowsHide: true,
    detached: !isWindows,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout?.on("data", onData);
  child.stderr?.on("data", onData);
  return {
    child,
    baseUrl: `http://127.0.0.1:${portValue}`,
    port: portValue,
    onData,
    getReadyFlag: () => false,
    getBootLog: () => bootLog,
    _stopPromise: null,
    stop: () => stopWebDevServer({ child, port: portValue, onData, _stopPromise: null })
  };
}

async function runWithBuiltWebServer({ label, port, envExtra, checkTechnicalHtml, skipBuild = false }) {
  const fs = require("node:fs");
  const webDir = path.join(repoRoot, "apps", "web");
  const hasBuild = fs.existsSync(path.join(webDir, ".next"));
  if (!skipBuild || !hasBuild) {
    buildWebApp(envExtra);
  } else {
    console.warn(
      `[${label}] UYARI: Mevcut .next build kullaniliyor (SMOKE_SKIP_WEB_BUILD=1). ` +
        "NEXT_PUBLIC_* degerleri build zamaninda gomulur; farkli smoke modlari arasinda skip kullanmayin."
    );
    console.log(`[${label}] Mevcut .next build kullaniliyor (SMOKE_SKIP_WEB_BUILD=1).`);
  }

  console.log(`[${label}] next start baslatiliyor (port ${port ?? 3198})...`);
  const server = startWebProductionServer({ port, envExtra });

  try {
    const httpReady = await waitForWebReady(server.baseUrl, 180000);
    if (!httpReady) {
      const tail = server.getBootLog?.().trim();
      throw new Error(
        `Production web sunucusu hazir olmadi: ${server.baseUrl}${tail ? `\nSon boot ciktisi:\n${tail}` : ""}`
      );
    }

    console.log(`[${label}] Sunucu hazir: ${server.baseUrl}`);
    await sleep(1000);
    return await runHttpRouteSmoke({
      label,
      baseUrl: server.baseUrl,
      checkTechnicalHtml
    });
  } finally {
    console.log(`[${label}] Production web sunucusu kapatiliyor...`);
    await stopWebDevServer(server);
  }
}

async function runHttpRouteSmoke({
  label,
  baseUrl,
  routes = HTTP_SMOKE_ROUTES,
  checkTechnicalHtml = false
}) {
  const failures = [];
  const results = [];

  for (const routePath of routes) {
    let result = await fetchRoute(baseUrl, routePath);
    if (result.error) {
      await sleep(5000);
      result = await fetchRoute(baseUrl, routePath);
    }
    if (result.status === 500) {
      await sleep(4000);
      result = await fetchRoute(baseUrl, routePath);
    }

    const row = { route: routePath, status: result.status, ok: true, issues: [] };

    if (result.error) {
      row.ok = false;
      row.issues.push(result.error);
    } else if (!isAcceptableHttpStatus(result.status, result.location)) {
      row.ok = false;
      row.issues.push(`HTTP ${result.status}${result.location ? ` -> ${result.location}` : ""}`);
    }

    if (result.body) {
      const htmlIssues = detectHtmlIssues(result.body, { checkTechnical: checkTechnicalHtml });
      if (htmlIssues.length) {
        row.ok = false;
        row.issues.push(...htmlIssues);
      }
    }

    if (!row.ok) {
      failures.push(`${routePath}: ${row.issues.join("; ")}`);
    }
    results.push(row);
  }

  return { label, failures, results };
}

async function runWithWebServer({ label, port, envExtra, checkTechnicalHtml, readyTimeoutMs }) {
  console.log(`[${label}] Web dev sunucusu baslatiliyor (port ${port ?? "otomatik"})...`);
  const server = startWebDevServer({ port: port ?? parsePort(process.env.SMOKE_WEB_PORT, 3199), envExtra });

  try {
    const timeout = readyTimeoutMs ?? 600000;
    const [logReady, httpReady] = await Promise.all([
      (async () => {
        const deadline = Date.now() + timeout;
        while (Date.now() < deadline) {
          if (server.getReadyFlag()) {
            return true;
          }
          await sleep(1000);
        }
        return false;
      })(),
      waitForWebReady(server.baseUrl, timeout)
    ]);
    if (!httpReady) {
      const tail = server.getBootLog?.().trim();
      throw new Error(
        `Web sunucusu hazir olmadi: ${server.baseUrl} (logReady=${logReady ? "true" : "false"})${
          tail ? `\nSon boot ciktisi:\n${tail}` : ""
        }`
      );
    }

    console.log(`[${label}] Sunucu hazir: ${server.baseUrl}`);
    await sleep(2000);
    return await runHttpRouteSmoke({
      label,
      baseUrl: server.baseUrl,
      checkTechnicalHtml
    });
  } finally {
    console.log(`[${label}] Web dev sunucusu kapatiliyor...`);
    await stopWebDevServer(server);
  }
}

module.exports = {
  HTTP_SMOKE_ROUTES,
  repoRoot,
  probeApiHealth,
  runHttpRouteSmoke,
  runWithWebServer,
  runWithBuiltWebServer,
  stopWebDevServer,
  killChildTree,
  parsePort
};
