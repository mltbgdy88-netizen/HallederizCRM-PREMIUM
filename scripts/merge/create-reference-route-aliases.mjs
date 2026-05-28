/**
 * Creates redirect alias routes for Final ↔ PREMIUM merge.
 * Run: node scripts/merge/create-reference-route-aliases.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformApp = path.resolve(__dirname, "../../apps/web/app/(platform)");

/** Final path → PREMIUM canonical path */
const SYSTEM_ALIASES = [
  ["/arsiv", "/archive"],
  ["/demo", "/demo-mode"],
  ["/empty", "/live-empty"],
  ["/offline", "/offline-api"]
];

/** Legacy PREMIUM paths */
const LEGACY_ALIASES = [
  ["/approvals", "/onaylar"],
  ["/dashboard/approvals", "/onaylar"],
  ["/ai/insights", "/ai/icgoruler"],
  ["/ai/proposals", "/ai/onaylar"],
  ["/tasks", "/gorevler"]
];

/** PREMIUM dynamic katman segment → Final static katman segment */
const KATMAN_SEGMENT_ALIASES = [
  ["/teklifler/katman/siparise-donusturme", "/teklifler/katman/donusum"],
  ["/siparisler/katman/odeme-tahsilat", "/siparisler/katman/odeme"],
  ["/siparisler/katman/depo-stok-etkisi", "/siparisler/katman/depo-stok"]
];

/** PREMIUM plural/list path → Final reference path */
const MODULE_ALIASES = [["/fabrikalar/siparisler", "/fabrikalar/siparis"]];

const ALL_ALIASES = [
  ...SYSTEM_ALIASES,
  ...LEGACY_ALIASES,
  ...KATMAN_SEGMENT_ALIASES,
  ...MODULE_ALIASES
];

function writeRedirect(fromRoute, toRoute) {
  const routeDir = path.join(platformApp, fromRoute.replace(/^\//, ""));
  fs.mkdirSync(routeDir, { recursive: true });
  const fnName =
    fromRoute
      .replace(/^\//, "")
      .split("/")
      .map((s) => s.replace(/[^a-zA-Z0-9]/g, " "))
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
      .replace(/\s/g, "") + "AliasRoute";

  const body = `import { redirect } from "next/navigation";

export default function ${fnName}() {
  redirect("${toRoute}");
}
`;

  fs.writeFileSync(path.join(routeDir, "page.tsx"), body, "utf8");
  return path.join(routeDir, "page.tsx");
}

let written = 0;
for (const [from, to] of ALL_ALIASES) {
  writeRedirect(from, to);
  written += 1;
}

console.log(`Created ${written} reference route alias redirects under (platform).`);
