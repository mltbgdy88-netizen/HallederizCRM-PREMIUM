#!/usr/bin/env node
const baseUrl = (process.env.LOCAL_AI_SERVICE_URL || "http://127.0.0.1:8008").replace(/\/+$/, "");
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
      console.error(`Local AI health failed: ${response.status} ${text}`);
      process.exitCode = 1;
      return;
    }
    console.log(text || `Local AI healthy at ${baseUrl}`);
  } catch (error) {
    console.error(`Local AI health unavailable at ${baseUrl}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

main();
