#!/usr/bin/env node
const baseUrl = (process.env.LOCAL_AI_SERVICE_URL || "http://127.0.0.1:8008").replace(/\/+$/, "");
const degradedOk = process.argv.includes("--degraded-ok");
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), Number(process.env.LOCAL_AI_TIMEOUT_MS || 30000));

async function main() {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) {
      const payload = {
        ok: false,
        status: "degraded",
        baseUrl,
        reason: `http_${response.status}`,
        detail: text || undefined
      };
      console.log(JSON.stringify(payload, null, 2));
      process.exitCode = degradedOk ? 0 : 1;
      return;
    }
    console.log(text || `Local AI healthy at ${baseUrl}`);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      status: "degraded",
      baseUrl,
      reason: error instanceof Error ? error.message : String(error)
    }, null, 2));
    process.exitCode = degradedOk ? 0 : 1;
  } finally {
    clearTimeout(timeout);
  }
}

main();
