/**
 * API offline HTTP smoke — demo kapali, erisilemeyen API base.
 * CI'da gercek API gerektirmez; sayfa kabugunun kırılmamasını doğrular.
 */
const { runWithBuiltWebServer, parsePort } = require("./http-smoke-lib.cjs");

const offlineApiBase = process.env.SMOKE_OFFLINE_API_BASE_URL ?? "http://localhost:4999";

async function main() {
  const port = parsePort(process.env.SMOKE_API_OFFLINE_PORT, 3197);
  const skipBuild =
    process.env.SMOKE_SKIP_WEB_BUILD === "1" || process.env.SMOKE_SKIP_WEB_BUILD === "true";

  const { failures, results } = await runWithBuiltWebServer({
    label: "api-offline",
    port,
    envExtra: {
      NEXT_PUBLIC_USE_DEMO_DATA: "false",
      NEXT_PUBLIC_API_BASE_URL: offlineApiBase,
      /** Yerel gelistirmede oturum acilabilir; HTTP shell testi icin zorunlu degil */
      NEXT_PUBLIC_ENABLE_DEMO_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH ?? "true"
    },
    checkTechnicalHtml: true,
    skipBuild
  });

  const passed = results.filter((r) => r.ok).length;
  console.log(`API offline smoke: ${passed}/${results.length} route HTTP kontrolu gecti (API base: ${offlineApiBase}).`);

  if (failures.length) {
    console.error("API offline smoke basarisiz:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log("API offline smoke basarili.");
  process.exit(0);
}

main().catch((error) => {
  console.error("API offline smoke beklenmeyen hata:", error);
  process.exit(1);
});
