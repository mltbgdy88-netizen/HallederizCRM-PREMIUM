/**
 * Lists Final reference routes vs sandbox merge status.
 * Run: node scripts/merge/list-merge-inventory.mjs
 * Writes: docs/MERGE_UI_INVENTORY.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const finalApp = path.resolve(root, "../hallederizcrm final/apps/web/app");
const sandboxApp = path.resolve(root, "apps/web/app");
const outFile = path.join(root, "docs/MERGE_UI_INVENTORY.md");

const ROUTE_REWRITES = [
  ["/arsiv", "/archive"],
  ["/demo", "/demo-mode"],
  ["/empty", "/live-empty"],
  ["/offline", "/offline-api"]
];

const INTENTIONAL_DIFF = new Map([
  ["/dashboard", "Final gösterge paneli `/dashboard` köküne alındı (`DashboardGostergePaneliPage`)"],
  ["/hizli-islem", "Hızlı Satış masası ana yüzey (`HizliSatisMasasiPage`)"],
  ["/ai", "Yapay Zeka hub `/ai` (`AiOperatorHubPage`)"],
  ["/ai/operator-hub", "→ `/ai` redirect"]
]);

function rewriteRoute(finalRoute) {
  let route = finalRoute;
  for (const [from, to] of ROUTE_REWRITES) {
    if (route === from || route.startsWith(`${from}/`)) {
      route = to + route.slice(from.length);
    }
  }
  return route;
}

function rewriteRouteToFinal(premiumRoute) {
  let route = premiumRoute;
  for (const [from, to] of ROUTE_REWRITES) {
    if (route === to || route.startsWith(`${to}/`)) {
      route = from + route.slice(to.length);
    }
  }
  return route;
}

function parseFeatureImport(content) {
  const patterns = [
    /import\s+\{\s*(\w+)\s*\}\s+from\s+"@\/features\/([^"]+)"/,
    /import\s+\{\s*(\w+)\s*\}\s+from\s+"(?:\.\.\/)+src\/features\/([^"]+)"/
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return { component: match[1], featurePath: match[2] };
  }
  return null;
}

function collectPages(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const rel = `${base}/${entry.name}`.replace(/\\/g, "/");
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        pages.push(...collectPages(full, base));
        continue;
      }
      pages.push(...collectPages(full, rel));
      continue;
    }

    if (entry.name !== "page.tsx") continue;

    const content = fs.readFileSync(full, "utf8");
    const importMatch = parseFeatureImport(content);
    const redirect = /redirect\s*\(|permanentRedirect/.test(content);
    const route = rel.replace(/\/page\.tsx$/, "").replace(/^\/+/, "/") || "/";

    pages.push({
      route,
      component: importMatch?.component ?? (redirect ? "(redirect)" : "?"),
      featurePath: importMatch?.featurePath ?? "",
      isRedirect: redirect && !importMatch
    });
  }

  return pages;
}

function pagePath(rootDir, routePath) {
  const segments = routePath.split("/").filter(Boolean);
  return path.join(rootDir, ...segments, "page.tsx");
}

function findSandboxPage(finalRoute) {
  const premiumRoute = rewriteRoute(finalRoute);
  if (premiumRoute === "/login") {
    const loginPath = path.join(sandboxApp, "login", "page.tsx");
    return fs.existsSync(loginPath) ? loginPath : null;
  }
  const candidates = [
    pagePath(path.join(sandboxApp, "(platform)"), premiumRoute),
    pagePath(path.join(sandboxApp, "(emerald)"), premiumRoute),
    pagePath(path.join(sandboxApp, "(offline-shell)"), premiumRoute)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function readSandboxMeta(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const importMatch = parseFeatureImport(content);
  const redirect = /redirect\s*\(|permanentRedirect/.test(content);
  return {
    component: importMatch?.component ?? (redirect ? "(redirect)" : "?"),
    featurePath: importMatch?.featurePath ?? "",
    isRedirect: redirect && !importMatch
  };
}

function layerKind(route) {
  if (route === "/") return "kök";
  if (/\/katman\//.test(route)) return "katman";
  if (/\/detay$/.test(route) || /\/detay\//.test(route)) return "detay";
  if (/\/yeni$/.test(route)) return "yeni/hub";
  if (route.includes("/gosterge-paneli")) return "alt-dashboard";
  return "ana";
}

function collectSandboxPremiumRoutes() {
  const roots = [
    path.join(sandboxApp, "(platform)"),
    path.join(sandboxApp, "(emerald)"),
    path.join(sandboxApp, "(offline-shell)"),
    path.join(sandboxApp, "login")
  ];
  const routes = new Set();
  for (const rootDir of roots) {
    if (!fs.existsSync(rootDir)) continue;
    if (rootDir.endsWith(`${path.sep}login`)) {
      routes.add("/login");
      continue;
    }
    for (const p of collectPages(rootDir)) {
      if (p.route !== "/") routes.add(p.route);
    }
  }
  return [...routes].sort();
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|");
}

const finalPages = collectPages(finalApp)
  .filter((p) => p.route !== "/")
  .sort((a, b) => a.route.localeCompare(b.route));

const finalPremiumSet = new Set(finalPages.map((p) => rewriteRoute(p.route)));

const rows = finalPages.map((fp, index) => {
  const premiumRoute = rewriteRoute(fp.route);
  const sandboxFile = findSandboxPage(fp.route);
  const sandbox = sandboxFile ? readSandboxMeta(sandboxFile) : null;
  const migrated = Boolean(sandboxFile);
  const sameComponent = sandbox?.component === fp.component;
  const intentional = INTENTIONAL_DIFF.get(premiumRoute);
  const uiMerged =
    migrated && (sameComponent || sandbox?.isRedirect || Boolean(intentional));

  let status = "gerçekleşen";
  if (!migrated) status = "gerçekleşmeyen";
  else if (!uiMerged) status = "kısmi";

  return {
    no: index + 1,
    finalRoute: fp.route,
    premiumRoute,
    kind: layerKind(fp.route),
    finalComponent: fp.component,
    sandboxComponent: sandbox?.component ?? "—",
    status,
    note:
      intentional ??
      (!migrated
        ? "sandbox route yok"
        : !sameComponent && !sandbox?.isRedirect
          ? `bileşen farkı: ${fp.component} → ${sandbox?.component}`
          : sandbox?.isRedirect
            ? "alias/redirect"
            : "")
  };
});

const byKind = {};
for (const r of rows) {
  byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
}

const gerceklesen = rows.filter((r) => r.status === "gerçekleşen").length;
const kismi = rows.filter((r) => r.status === "kısmi").length;
const gerceklesmeyen = rows.filter((r) => r.status === "gerçekleşmeyen").length;

const extraRoutes = collectSandboxPremiumRoutes().filter((r) => !finalPremiumSet.has(r));
const extraStatic = extraRoutes.filter((r) => !r.includes("["));
const extraDynamic = extraRoutes.filter((r) => r.includes("["));

const generatedAt = new Date().toISOString().slice(0, 10);

const lines = [
  "# UI Birleştirme Envanteri",
  "",
  `**Otomatik üretim:** \`node scripts/merge/list-merge-inventory.mjs\` · **Tarih:** ${generatedAt}`,
  "",
  "Kaynak UI: `hallederizcrm final` (read-only) → sandbox: `xxxhallederizcrm/apps/web`.",
  "",
  "Doğrulama: `node scripts/merge/audit-reference-routes.mjs` (route eşleşmesi).",
  "",
  "---",
  "",
  "## Özet",
  "",
  "| Metrik | Sayı |",
  "|--------|------|",
  `| **Final birleştirme route (A)** | **${rows.length}** |`,
  `| Ana / liste / hub | ${byKind.ana ?? 0} |`,
  `| Katman (\`/katman/*\`) | ${byKind.katman ?? 0} |`,
  `| Detay (\`/detay\`) | ${byKind.detay ?? 0} |`,
  `| Yeni / hub (\`/yeni\`) | ${byKind["yeni/hub"] ?? 0} |`,
  `| Alt dashboard | ${byKind["alt-dashboard"] ?? 0} |`,
  `| **Taşınma — gerçekleşen** | **${gerceklesen}** |`,
  `| Taşınma — kısmi | ${kismi} |`,
  `| Taşınma — gerçekleşmeyen | ${gerceklesmeyen} |`,
  `| Sandbox ekstra route (Final 81 dışı) | ${extraRoutes.length} (${extraStatic.length} statik, ${extraDynamic.length} dinamik) |`,
  "| Tasarım paketi route/katman (B) | 53 |",
  "",
  "**Durum etiketleri**",
  "",
  "- **gerçekleşen:** Sandbox’ta route var; Final referans UI bileşeni bağlı (veya bilinçli alias).",
  "- **kısmi:** Route var; farklı React bileşeni.",
  "- **gerçekleşmeyen:** Sandbox’ta karşılık route yok.",
  "",
  "---",
  "",
  "## Bilinçli birleştirme farkları",
  "",
  "| Sandbox route | Not |",
  "|---------------|-----|"
];

for (const [route, note] of INTENTIONAL_DIFF) {
  lines.push(`| \`${route}\` | ${mdEscape(note)} |`);
}

lines.push(
  "",
  "---",
  "",
  "## A — Final envanter (sıralı)",
  "",
  "| # | Final route | Sandbox route | Tür | Bileşen | Durum | Not |",
  "|---|-------------|---------------|-----|---------|--------|-----|"
);

for (const r of rows) {
  lines.push(
    `| ${r.no} | \`${r.finalRoute}\` | \`${r.premiumRoute}\` | ${r.kind} | \`${r.finalComponent}\` | **${r.status}** | ${mdEscape(r.note)} |`
  );
}

if (kismi > 0) {
  lines.push("", "### Kısmi", "");
  for (const r of rows.filter((x) => x.status === "kısmi")) {
    lines.push(`- **${r.premiumRoute}** — ${r.note}`);
  }
}

if (gerceklesmeyen > 0) {
  lines.push("", "### Gerçekleşmeyen", "");
  for (const r of rows.filter((x) => x.status === "gerçekleşmeyen")) {
    lines.push(`- **${r.premiumRoute}** — ${r.note}`);
  }
}

lines.push(
  "",
  "---",
  "",
  "## Sandbox ekstra route (Final 81 dışı)",
  "",
  "PREMIUM / birleştirme sonrası eklenen veya alias; Final envanterine dahil değil.",
  ""
);

function extraRouteNote(r) {
  if (r === "/muhasebe") return "Muhasebe hub (2026-05 IA)";
  if (r.endsWith("/liste")) return "Liste alias";
  if (r.startsWith("/hizli-islem/")) return "PREMIUM hızlı işlem adımı";
  if (r === "/panel") return "→ `/dashboard` redirect";
  if (r === "/approvals" || r.startsWith("/dashboard/approvals")) return "→ `/onaylar` alias";
  if (r === "/arsiv") return "→ `/archive` alias";
  if (r === "/demo" || r === "/empty" || r === "/offline") return "Sistem state alias";
  if (r.includes("[...")) return "Catch-all / manifest shell";
  if (r.includes("[")) return "PREMIUM dynamic `[id]` route";
  if (r.startsWith("/ayarlar/")) return "Ayarlar derin route / shell";
  if (r.startsWith("/siparisler/katman/") && !finalPremiumSet.has(r)) return "Katman alias segment";
  return "PREMIUM ek route";
}

if (extraRoutes.length === 0) {
  lines.push("_Ekstra route yok._");
} else {
  lines.push("### Statik ekstra route", "", "| Sandbox route | Not |", "|---------------|-----|");
  for (const r of extraStatic) {
    lines.push(`| \`${r}\` | ${mdEscape(extraRouteNote(r))} |`);
  }
  lines.push("", `### Dinamik / catch-all (${extraDynamic.length})`, "");
  lines.push(
    "Örnekler: `/cariler/[customerId]`, `/siparisler/[orderId]`, `/fabrikalar/siparisler/[factoryOrderId]`, `/[...productSlug]`, `/ayarlar/[...ayarSlug]`."
  );
  if (extraDynamic.length <= 30) {
    lines.push("", "| Sandbox route | Not |", "|---------------|-----|");
    for (const r of extraDynamic) {
      lines.push(`| \`${r}\` | ${mdEscape(extraRouteNote(r))} |`);
    }
  }
}

lines.push(
  "",
  "---",
  "",
  "## B — Tasarım paketi (53 route/katman)",
  "",
  "Kaynak: [`docs/product/UI_ROUTE_COVERAGE_MATRIX.md`](./product/UI_ROUTE_COVERAGE_MATRIX.md)",
  "",
  "| Metrik | Durum |",
  "|--------|--------|",
  "| Toplam hedef | 53 |",
  "| apps/web karşılığı | 48 route + 5 davranış katmanı |",
  "| Dedicated route eksik | 0 (Agent 08–10 sonrası) |",
  "| Mockup PNG repoda | Yok (paket ayrı ZIP) |",
  "",
  "Final 81 ile bire bir aynı değildir: Final daha fazla **katman/detay** route içerir.",
  "",
  "---",
  "",
  "## Faz 4 — Henüz tam ürün sayılmayan (UI taşındı, bağ kısmi)",
  "",
  "Kaynak: [`docs/MERGE_STATUS.md`](./MERGE_STATUS.md)",
  "",
  "| Alan | Durum |",
  "|------|--------|",
  "| Hızlı İşlem → `QuickOperationPage` + canlı `submitQuickOperationRecord` | gerçekleşmedi |",
  "| Gösterge KPI ↔ canlı API `cardValues` | kısmi |",
  "| Tam cutover gate (`turbo typecheck --force`, `smoke:product-readiness`) | bekliyor |",
  "| Eski PREMIUM CommandCenter temizliği | bekliyor |",
  "",
  "---",
  "",
  "## İlgili komutlar",
  "",
  "```bash",
  "node scripts/merge/audit-reference-routes.mjs",
  "node scripts/merge/list-merge-inventory.mjs",
  "pnpm smoke:navigation",
  "```",
  ""
);

fs.writeFileSync(outFile, lines.join("\n"), "utf8");

console.log(`Wrote ${outFile}`);
console.log(`Final routes: ${rows.length} | gerçekleşen: ${gerceklesen} | kısmi: ${kismi} | gerçekleşmeyen: ${gerceklesmeyen}`);
console.log(`Extra sandbox routes: ${extraRoutes.length}`);
