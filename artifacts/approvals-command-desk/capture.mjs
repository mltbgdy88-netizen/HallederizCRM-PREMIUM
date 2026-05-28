/**
 * Approvals command desk screenshot QA.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.UI_CAPTURE_OUT_ROOT ?? __dirname;
const BASE_URL = process.env.UI_CAPTURE_BASE_URL ?? "http://localhost:3000";

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
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 60000 });
    await page.waitForTimeout(1500);
  }
  const storageState = await context.storageState();
  await context.close();
  return storageState;
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".hz-approvals-command");
    const policy = document.querySelector(".hz-approval-policy-band");
    const grid = document.querySelector(".hz-approvals-command__grid");
    const bodyText = document.body.innerText || "";
    const technicalLeak = /worker|outbox|job id|foundation|stack trace/i.test(bodyText);
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      hasCommandDesk: Boolean(root),
      hasPolicyBand: Boolean(policy),
      hasThreeColGrid: Boolean(grid),
      technicalLeakage: technicalLeak,
      policyTextVisible: bodyText.includes("Manuel kullanıcı işlemleri onay beklemez")
    };
  });
}

async function capture(browser, storageState, filename, viewport) {
  const page = await browser.newPage({ viewport, storageState });
  await page.goto(`${BASE_URL}/onaylar`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForSelector(".hz-approvals-command", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const m = await metrics(page);
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
  await page.close();
  return m;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const storageState = await login(browser);

  const shots = [
    ["approvals-1366x768.png", { width: 1366, height: 768 }],
    ["approvals-1920x1080.png", { width: 1920, height: 1080 }],
    ["approvals-mobile.png", { width: 390, height: 844 }]
  ];

  const report = { capturedAt: new Date().toISOString(), baseUrl: BASE_URL, viewports: {} };

  for (const [file, viewport] of shots) {
    report.viewports[file] = await capture(browser, storageState, file, viewport);
  }

  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, "report.md"),
    `# Approvals Command Desk Screenshot QA\n\n- Date: ${report.capturedAt}\n- Base: ${BASE_URL}\n\n## Metrics\n\n\`\`\`json\n${JSON.stringify(report.viewports, null, 2)}\n\`\`\`\n`
  );

  await browser.close();
  console.log("Captured", shots.map((s) => s[0]).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
