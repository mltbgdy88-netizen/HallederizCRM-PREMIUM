/**
 * Final dashboard command center screenshots (QA baseline).
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
    const composer = document.querySelector(".hz-cc-ai-composer");
    const promo = document.querySelector(".hz-promo-card");
    const sidebarScroll = sidebar?.querySelector(".hz-sidebar-scroll")
      ? (() => {
          const el = sidebar.querySelector(".hz-sidebar-scroll");
          return el.scrollHeight > el.clientHeight + 2;
        })()
      : false;
    const dashOverflow = root ? root.scrollHeight > root.clientHeight + 2 : false;
    const composerRect = composer?.getBoundingClientRect();
    const promoRect = promo?.getBoundingClientRect();
    const composerAbovePromo =
      composerRect && promoRect ? composerRect.bottom <= promoRect.top + 4 : false;
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      bodyScroll: document.documentElement.scrollHeight > window.innerHeight + 2,
      hasCommandCenter: Boolean(root),
      hasAiChat: Boolean(document.querySelector(".hz-cc-ai-chat-panel")),
      hasComposer: Boolean(composer),
      hasPromo: Boolean(promo),
      hasQuick: Boolean(quick),
      hasChart: Boolean(document.querySelector("canvas, .recharts-wrapper, .hz-dash-kpi-row")),
      hasStatusCard: Boolean(document.querySelector(".hz-sidebar-status-card")),
      hasSidebarBadge: document.querySelectorAll(".hz-sidebar-item-badge").length > 0,
      iconCount: document.querySelectorAll(".hz-sidebar-item-icon svg").length,
      sidebarScroll,
      dashOverflow,
      composerAbovePromo,
      sidebarWidth: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : 0,
      promoHeight: promo ? Math.round(promo.getBoundingClientRect().height) : 0
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

function passDesktop(m) {
  return (
    m.hasCommandCenter &&
    m.hasAiChat &&
    m.hasComposer &&
    m.hasPromo &&
    m.hasQuick &&
    !m.hasChart &&
    !m.horizontalOverflow &&
    !m.sidebarScroll &&
    !m.dashOverflow &&
    !m.hasStatusCard &&
    !m.hasSidebarBadge &&
    m.iconCount >= 10
  );
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
  if (!storageState) throw new Error(`Demo login failed — start API (4000) and web (${BASE_URL})`);

  const m1366 = await capture(browser, storageState, "final-dashboard-1366x768.png", { width: 1366, height: 768 });
  const m1920 = await capture(browser, storageState, "final-dashboard-1920x1080.png", { width: 1920, height: 1080 });

  const mobileCtx = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: { width: 390, height: 844 },
    storageState
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 90000 });
  await mobile.waitForTimeout(1200);
  const mMobile = await metrics(mobile);
  await mobile.screenshot({ path: path.join(OUT_DIR, "final-dashboard-mobile.png"), fullPage: true });
  await mobileCtx.close();
  await browser.close();

  const report = `# Dashboard Command Center — final QA

- Branch: fix/ui-dashboard-command-center-exact-layout (alias: redesign)
- Base: ${BASE_URL}
- API: ${API_URL}
- Date: ${new Date().toISOString()}

## Screenshots

- final-dashboard-1366x768.png
- final-dashboard-1920x1080.png
- final-dashboard-mobile.png

## Metrics

| Viewport | OK | Sidebar scroll | Dash overflow | H-scroll | Composer↑promo | Promo px | Icons | Status card | Badges |
|----------|-----|----------------|---------------|----------|----------------|----------|-------|-------------|--------|
| 1366×768 | ${passDesktop(m1366) ? "PASS" : "CHECK"} | ${m1366.sidebarScroll ? "FAIL" : "PASS"} | ${m1366.dashOverflow ? "FAIL" : "PASS"} | ${m1366.horizontalOverflow ? "FAIL" : "PASS"} | ${m1366.composerAbovePromo ? "PASS" : "CHECK"} | ${m1366.promoHeight} | ${m1366.iconCount} | ${m1366.hasStatusCard ? "FAIL" : "PASS"} | ${m1366.hasSidebarBadge ? "FAIL" : "PASS"} |
| 1920×1080 | ${passDesktop(m1920) ? "PASS" : "CHECK"} | ${m1920.sidebarScroll ? "FAIL" : "PASS"} | ${m1920.dashOverflow ? "FAIL" : "PASS"} | ${m1920.horizontalOverflow ? "FAIL" : "PASS"} | ${m1920.composerAbovePromo ? "PASS" : "CHECK"} | ${m1920.promoHeight} | ${m1920.iconCount} | ${m1920.hasStatusCard ? "FAIL" : "PASS"} | ${m1920.hasSidebarBadge ? "FAIL" : "PASS"} |
| 390×844 | ${mMobile.hasCommandCenter ? "PASS" : "FAIL"} | — | — | ${mMobile.horizontalOverflow ? "FAIL" : "PASS"} | — | — | — | — | — |

## Layout contract

- Compact command sidebar (204px), emerald/gold
- No KPI charts on dashboard
- Alerts, tasks, flow, recent, quick rail
- AI chat + composer + promo video rail
`;
  fs.writeFileSync(path.join(OUT_DIR, "final-dashboard-report.md"), report, "utf8");
  console.log(report);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
