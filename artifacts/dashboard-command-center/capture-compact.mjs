/**
 * Dashboard command center compact screenshot QA.
 */
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.UI_CAPTURE_OUT_ROOT ?? __dirname;
const BASE_URL = process.env.UI_CAPTURE_BASE_URL ?? "http://localhost:3000";
const API_URL = process.env.UI_CAPTURE_API_URL ?? "http://localhost:4000";

async function login(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 90000 });
  if (page.url().includes("/login")) {
    await page.locator("#login-tenant").fill("hallederiz");
    await page.locator("#login-email").fill("admin@hallederiz.com");
    await page.locator("#login-password").fill("demo");
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/auth/login") && r.status() === 200, { timeout: 60000 }),
      page.getByRole("button", { name: /Giriş yap/i }).click()
    ]);
    await page.waitForURL((url) => url.pathname.includes("/dashboard"), { timeout: 60000 });
    await page.waitForTimeout(2000);
  }
  const authed =
    !page.url().includes("/login") ||
    (await page.locator(".hz-dashboard-command, .hz-header-cc-title").count()) > 0;
  const storageState = authed ? await context.storageState() : null;
  await context.close();
  return storageState;
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".hz-dashboard-command");
    const sidebar = document.querySelector(".hz-sidebar-root--command");
    const quick = document.querySelector(".hz-quick-rail");
    const recent = document.querySelector(".hz-recent-table-wrap");
    const sidebarScroll = sidebar ? sidebar.scrollHeight > sidebar.clientHeight + 2 : false;
    const dashOverflow = root ? root.scrollHeight > root.clientHeight + 2 : false;
    const quickVisible = quick
      ? quick.getBoundingClientRect().bottom <= (root?.getBoundingClientRect().bottom ?? 0) + 2
      : false;
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      hasCommandCenter: Boolean(root),
      hasAi: Boolean(document.querySelector(".hz-ai-panel")),
      hasPromo: Boolean(document.querySelector(".hz-promo-card")),
      hasChart: Boolean(document.querySelector("canvas, .recharts-wrapper, .hz-dash-kpi-row")),
      iconCount: document.querySelectorAll(".hz-sidebar-item-icon svg").length,
      sidebarScroll,
      dashOverflow,
      quickInView: quickVisible,
      sidebarWidth: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : 0
    };
  });
}

async function capture(browser, storageState, filename, viewport) {
  const page = await browser.newPage({ viewport, storageState });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForSelector(".hz-dashboard-command", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const m = await metrics(page);
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
  await page.close();
  return m;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try {
    await fetch(`${API_URL}/health`).catch(() => null);
  } catch {
    /* ignore */
  }

  const browser = await chromium.launch();
  const storageState = await login(browser);
  if (!storageState) throw new Error("Demo login failed — start API (4000) and web (3000)");

  const m1366 = await capture(browser, storageState, "dashboard-1366x768-compact.png", { width: 1366, height: 768 });
  const m1920 = await capture(browser, storageState, "dashboard-1920x1080-compact.png", { width: 1920, height: 1080 });

  const mobileCtx = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: { width: 390, height: 844 },
    storageState
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 90000 });
  await mobile.waitForTimeout(1200);
  const mMobile = await metrics(mobile);
  await mobile.screenshot({ path: path.join(OUT_DIR, "dashboard-mobile-compact.png"), fullPage: true });
  await mobileCtx.close();
  await browser.close();

  const pass = (m) =>
    m.hasCommandCenter &&
    m.hasAi &&
    m.hasPromo &&
    !m.hasChart &&
    !m.horizontalOverflow &&
    !m.sidebarScroll &&
    !m.dashOverflow &&
    m.iconCount >= 10;

  const report = `# Dashboard Command Center — compact viewport QA

- Base: ${BASE_URL}
- API: ${API_URL}

| Viewport | OK | Sidebar scroll | Dash overflow | Quick in view | Icons | Sidebar px |
|----------|-----|----------------|---------------|---------------|-------|------------|
| 1366×768 | ${pass(m1366) ? "PASS" : "CHECK"} | ${m1366.sidebarScroll ? "FAIL" : "PASS"} | ${m1366.dashOverflow ? "FAIL" : "PASS"} | ${m1366.quickInView ? "PASS" : "CHECK"} | ${m1366.iconCount} | ${m1366.sidebarWidth} |
| 1920×1080 | ${pass(m1920) ? "PASS" : "CHECK"} | ${m1920.sidebarScroll ? "FAIL" : "PASS"} | ${m1920.dashOverflow ? "FAIL" : "PASS"} | ${m1920.quickInView ? "PASS" : "CHECK"} | ${m1920.iconCount} | ${m1920.sidebarWidth} |
| 390×844 | ${mMobile.hasCommandCenter ? "PASS" : "FAIL"} | — | — | — | — | H:${mMobile.horizontalOverflow ? "FAIL" : "PASS"} |

## Files

- dashboard-1366x768-compact.png
- dashboard-1920x1080-compact.png
- dashboard-mobile-compact.png
`;
  fs.writeFileSync(path.join(OUT_DIR, "report-compact.md"), report, "utf8");
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
