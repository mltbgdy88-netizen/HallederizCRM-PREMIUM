/**
 * Production data mode HTTP smoke — NEXT_PUBLIC_USE_DEMO_DATA=false.
 * Requires a reachable API at NEXT_PUBLIC_API_BASE_URL (default http://localhost:4000).
 * Skips with exit 0 when API is down unless SMOKE_PRODUCTION_DATA_REQUIRED=1.
 */
const { probeApiHealth, runWithWebServer, parsePort } = require("./http-smoke-lib.cjs");

/** Health + web dev icin canli API; offline smoke ile karismasin (SMOKE_API_BASE_URL oncelikli). */
const apiBase =
  process.env.SMOKE_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const required = process.env.SMOKE_PRODUCTION_DATA_REQUIRED === "1" || process.env.SMOKE_PRODUCTION_DATA_REQUIRED === "true";
const skipFlag = process.env.SMOKE_SKIP_PRODUCTION_DATA === "1" || process.env.SMOKE_SKIP_PRODUCTION_DATA === "true";

async function main() {
  if (skipFlag) {
    console.log("Production data smoke atlandi (SMOKE_SKIP_PRODUCTION_DATA=1).");
    process.exit(0);
  }

  console.log(`Production data smoke: API health kontrolu (${apiBase})...`);
  const apiUp = await probeApiHealth(apiBase);

  if (!apiUp) {
    const message =
      `Production data smoke atlandi: API erisilemiyor (${apiBase}/health). ` +
      `Yerel API'yi baslatin veya SMOKE_SKIP_PRODUCTION_DATA=1 kullanin. ` +
      `Zorunlu kilmak icin SMOKE_PRODUCTION_DATA_REQUIRED=1.`;
    if (required) {
      console.error(message);
      process.exit(1);
    }
    console.warn(message);
    process.exit(0);
  }

  const port = parsePort(process.env.SMOKE_PRODUCTION_DATA_PORT, 3198);
  const { failures, results } = await runWithWebServer({
    label: "production-data",
    port,
    envExtra: {
      NEXT_PUBLIC_USE_DEMO_DATA: "false",
      NEXT_PUBLIC_API_BASE_URL: apiBase
    },
    checkTechnicalHtml: false,
    readyTimeoutMs: 240000
  });

  const passed = results.filter((r) => r.ok).length;
  console.log(`Production data smoke: ${passed}/${results.length} route HTTP kontrolu gecti.`);

  if (failures.length) {
    console.error("Production data smoke basarisiz:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log("Production data smoke basarili.");
}

main().catch((error) => {
  console.error("Production data smoke beklenmeyen hata:", error);
  process.exit(1);
});
