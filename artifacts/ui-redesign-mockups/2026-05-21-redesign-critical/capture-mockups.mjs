/**
 * Optional mockup PNG capture — not committed to app. Requires: npx -p playwright node capture-mockups.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = [
  { html: "shell-dashboard.html", base: "shell-dashboard" },
  { html: "qop-tahsilat.html", base: "qop-tahsilat" }
];

const browser = await chromium.launch();
for (const { html, base } of files) {
  const fileUrl = `file:///${path.join(__dirname, html).replace(/\\/g, "/")}`;
  for (const [suffix, viewport] of [
    ["desktop", { width: 1920, height: 1080 }],
    ["mobile", { width: 390, height: 844 }]
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl);
    await page.screenshot({ path: path.join(__dirname, `${base}__${suffix}.png`), fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log("Mockup screenshots written to", __dirname);
