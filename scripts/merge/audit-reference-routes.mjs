/**
 * Compares Final reference routes (82) with PREMIUM (platform) pages.
 * Run: node scripts/merge/audit-reference-routes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const finalApp = path.resolve(root, "../hallederizcrm final/apps/web/app");
const appRoot = path.resolve(root, "apps/web/app");
const premiumRoots = [
  path.join(appRoot, "(platform)"),
  path.join(appRoot, "(emerald)"),
  path.join(appRoot, "login"),
  path.join(appRoot, "(offline-shell)")
];

const ROUTE_REWRITES = [
  ["/arsiv", "/archive"],
  ["/demo", "/demo-mode"],
  ["/empty", "/live-empty"],
  ["/offline", "/offline-api"]
];

function rewriteRoute(finalRoute) {
  let route = finalRoute;
  for (const [from, to] of ROUTE_REWRITES) {
    if (route === from || route.startsWith(`${from}/`)) {
      route = to + route.slice(from.length);
    }
  }
  return route;
}

function collectFinalPages(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const rel = `${base}/${entry.name}`.replace(/\\/g, "/");
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        pages.push(...collectFinalPages(full, base));
        continue;
      }
      pages.push(...collectFinalPages(full, rel));
      continue;
    }

    if (entry.name !== "page.tsx") continue;

    const content = fs.readFileSync(full, "utf8");
    const importMatch = content.match(
      /import\s+\{\s*(\w+)\s*\}\s+from\s+"@\/features\/([^"]+)"/
    );
    if (!importMatch) continue;

    const route = rewriteRoute(
      rel.replace(/\/page\.tsx$/, "").replace(/^\/+/, "/") || "/"
    );

    pages.push({ route, component: importMatch[1], featurePath: importMatch[2] });
  }

  return pages;
}

function collectPremiumRoutes(dir, base = "") {
  const routes = new Set();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${base}/${entry.name}`.replace(/\\/g, "/");
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPremiumRoutes(full, rel).forEach((r) => routes.add(r));
    } else if (entry.name === "page.tsx") {
      const raw = rel.replace(/\/page\.tsx$/, "").replace(/\\/g, "/");
      const route = raw ? `/${raw.replace(/^\/+/, "")}` : "/";
      routes.add(route);
    }
  }
  return routes;
}

const finalPages = collectFinalPages(finalApp).filter((p) => p.route !== "/");
const premiumRoutes = new Set();
for (const dir of premiumRoots) {
  if (!fs.existsSync(dir)) continue;
  if (dir.endsWith(`${path.sep}login`)) {
    if (fs.existsSync(path.join(dir, "page.tsx"))) premiumRoutes.add("/login");
    continue;
  }
  collectPremiumRoutes(dir).forEach((r) => premiumRoutes.add(r));
}

const missing = finalPages
  .filter((p) => !premiumRoutes.has(p.route))
  .map((p) => p.route)
  .sort();

const covered = finalPages.length - missing.length;

console.log(`Final wired routes: ${finalPages.length}`);
console.log(`PREMIUM (platform) matched: ${covered}`);
console.log(`Missing (${missing.length}):`);
for (const route of missing) {
  console.log(`  ${route}`);
}

if (missing.length) {
  process.exitCode = 1;
}
