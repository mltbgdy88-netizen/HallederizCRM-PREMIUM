/**
 * Dashboard command center screenshot QA (artifacts only).
 */
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.UI_CAPTURE_OUT_ROOT ?? __dirname;
const BASE_URL = process.env.UI_CAPTURE_BASE_URL ?? "http://localhost:3001";

async function login(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (page.url().includes("/login")) {
    await page.locator("#login-tenant").fill("hallederiz");
    await page.locator("#login-email").fill("admin@hallederiz.com");
    await page.locator("#login-password").fill("demo");
    await page.locator('button[type="submit"]').click();
    await page.waitForFunction(() => !window.location.pathname.includes("/login"), { timeout: 30000 }).catch(() => {});
  }
  const authed = !page.url().includes("/login");
  const storageState = authed ? await context.storageState() : null;
  await context.close();
  return storageState;
}

async function capture(browser, storageState, name, viewport) {
  const page = await browser.newPage({ viewport, storageState });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".hz-dashboard-command", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const metrics = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    hasCommandCenter: Boolean(document.querySelector(".hz-dashboard-command")),
    hasAi: Boolean(document.querySelector(".hz-ai-panel")),
    hasPromo: Boolean(document.querySelector(".hz-promo-card")),
    hasChart: Boolean(document.querySelector("canvas, .recharts-wrapper, .hz-dash-kpi-row")),
    iconCount: document.querySelectorAll(".hz-sidebar-item-icon svg, .hz-alert-tile__icon svg, .hz-flow-row__icon svg").length
  }));
  await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: false });
  await page.close();
  return metrics;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const storageState = await login(browser);
  if (!storageState) throw new Error("Demo login failed");

  const m1366 = await capture(browser, storageState, "dashboard-1366x768.png", { width: 1366, height: 768 });
  const m1920 = await capture(browser, storageState, "dashboard-1920x1080.png", { width: 1920, height: 1080 });

  const mobileCtx = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: { width: 390, height: 844 },
    storageState
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 60000 });
  await mobile.waitForSelector(".hz-dashboard-command", { timeout: 20000 }).catch(() => {});
  await mobile.waitForTimeout(1200);
  const mMobile = await mobile.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    hasCommandCenter: Boolean(document.querySelector(".hz-dashboard-command"))
  }));
  await mobile.screenshot({ path: path.join(OUT_DIR, "dashboard-mobile.png"), fullPage: true });
  await mobileCtx.close();

  const report = `# Dashboard Command Center QA (compact)

- Base URL: ${BASE_URL}

## Automated checks

| Viewport | Command center | AI | Promo | No chart | Icons | H-overflow |
|----------|----------------|----|-------|----------|-------|------------|
| 1366×768 | ${m1366.hasCommandCenter ? "PASS" : "FAIL"} | ${m1366.hasAi ? "PASS" : "FAIL"} | ${m1366.hasPromo ? "PASS" : "FAIL"} | ${m1366.hasChart ? "FAIL" : "PASS"} | ${m1366.iconCount} | ${m1366.horizontalOverflow ? "FAIL" : "PASS"} |
| 1920×1080 | ${m1920.hasCommandCenter ? "PASS" : "FAIL"} | ${m1920.hasAi ? "PASS" : "FAIL"} | ${m1920.hasPromo ? "PASS" : "FAIL"} | ${m1920.hasChart ? "FAIL" : "PASS"} | ${m1920.iconCount} | ${m1920.horizontalOverflow ? "FAIL" : "PASS"} |
| 390×844 | ${mMobile.hasCommandCenter ? "PASS" : "FAIL"} | — | — | — | — | ${mMobile.horizontalOverflow ? "FAIL" : "PASS"} |

## Files

- dashboard-1366x768.png
- dashboard-1920x1080.png
- dashboard-mobile.png
`;
  fs.writeFileSync(path.join(OUT_DIR, "report.md"), report, "utf8");
  await browser.close();
  console.log("Screenshots saved to", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
