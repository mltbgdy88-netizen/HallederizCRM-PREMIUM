/**
 * Shared helpers for HTTP-level web smoke scripts (production-data, api-offline).
 * No extra dependencies — Node 20+ fetch + child_process.
 */
const { spawn } = require("node:child_process");
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
  "/archive",
  "/whatsapp",
  "/whatsapp?customer=customer_1"
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeApiHealth(apiBaseUrl, timeoutMs = 4000) {
  const base = apiBaseUrl.replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${base}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
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

async function fetchRoute(baseUrl, routePath, timeoutMs = 30000) {
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

async function waitForWebReady(baseUrl, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status > 0) {
        return true;
      }
    } catch {
      // keep polling
    }
    await sleep(2000);
  }
  return false;
}

function startWebDevServer({ port, envExtra }) {
  const portValue = parsePort(port, 3199);
  const env = {
    ...process.env,
    ...envExtra,
    PORT: String(portValue),
    /** Reduce noise in CI logs */
    NEXT_TELEMETRY_DISABLED: "1"
  };

  const isWindows = process.platform === "win32";
  const child = spawn("pnpm", ["--filter", "@hallederiz/web", "dev"], {
    cwd: repoRoot,
    env,
    shell: isWindows,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let ready = false;
  const baseUrl = `http://127.0.0.1:${portValue}`;

  const onData = (chunk) => {
    const text = chunk.toString();
    if (/Ready in/i.test(text) || new RegExp(`Local:\\s+${baseUrl.replace(/\./g, "\\.")}`, "i").test(text)) {
      ready = true;
    }
    if (/Local:\s+http:\/\/127\.0\.0\.1:\d+/i.test(text) || /Local:\s+http:\/\/localhost:\d+/i.test(text)) {
      ready = true;
    }
  };

  child.stdout?.on("data", onData);
  child.stderr?.on("data", onData);

  const stop = () =>
    new Promise((resolve) => {
      if (child.killed || child.exitCode !== null) {
        resolve();
        return;
      }
      const killTimer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {
          // noop
        }
        resolve();
      }, 8000);
      child.on("exit", () => {
        clearTimeout(killTimer);
        resolve();
      });
      try {
        if (isWindows) {
          spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { shell: true });
        } else {
          child.kill("SIGTERM");
        }
      } catch {
        child.kill("SIGKILL");
      }
    });

  return { child, baseUrl, port: portValue, getReadyFlag: () => ready, stop };
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
    const readyByLog = async () => {
      const deadline = Date.now() + 120000;
      while (Date.now() < deadline) {
        if (server.getReadyFlag()) {
          return true;
        }
        await sleep(1000);
      }
      return false;
    };

    const logReady = await readyByLog();
    const httpReady = await waitForWebReady(server.baseUrl, readyTimeoutMs ?? 180000);
    if (!logReady && !httpReady) {
      throw new Error(`Web sunucusu hazir olmadi: ${server.baseUrl}`);
    }

    console.log(`[${label}] Sunucu hazir: ${server.baseUrl}`);
    return await runHttpRouteSmoke({
      label,
      baseUrl: server.baseUrl,
      checkTechnicalHtml
    });
  } finally {
    console.log(`[${label}] Web dev sunucusu kapatiliyor...`);
    await server.stop();
  }
}

module.exports = {
  HTTP_SMOKE_ROUTES,
  repoRoot,
  probeApiHealth,
  runHttpRouteSmoke,
  runWithWebServer,
  parsePort
};
