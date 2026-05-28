/**
 * UI release guard — no dependencies. Run: node scripts/ui-guard.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const failures = [];

const SKIP_DIR = new Set(["node_modules", ".next", ".runtime-next-dev", "dist", "__tests__"]);
const SKIP_FILE = /\.(test|spec)\.[jt]sx?$/;
const SKIP_SUB =
  /-mock-data\.|mock-data\.|\/mutations\/|\/utils\/.*-feedback\.ts$|\/lib\/omnichannel-ui\.ts$|\/features\/ai\/queries\//;

function walkFiles(roots) {
  const files = [];
  for (const root of roots) {
    const abs = path.join(repoRoot, root);
    if (!fs.existsSync(abs)) continue;
    const stack = [abs];
    while (stack.length) {
      const dir = stack.pop();
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.isDirectory()) {
          if (SKIP_DIR.has(ent.name)) continue;
          stack.push(path.join(dir, ent.name));
          continue;
        }
        const file = path.join(dir, ent.name);
        const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
        if (!/\.(ts|tsx|js|jsx)$/.test(ent.name)) continue;
        if (SKIP_FILE.test(rel)) continue;
        if (SKIP_SUB.test(rel)) continue;
        if (rel.includes("globals.css") || rel.includes("/app/styles/")) continue;
        files.push(file);
      }
    }
  }
  return files;
}

function scanFiles(files, pattern) {
  const re = new RegExp(pattern, "i");
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        hits.push(`${path.relative(repoRoot, file).replace(/\\/g, "/")}:${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
  return hits;
}

function check(name, hits) {
  if (hits.length) {
    failures.push(`${name}:`);
    hits.slice(0, 20).forEach((line) => failures.push(`  ${line}`));
    if (hits.length > 20) failures.push(`  ... +${hits.length - 20} more`);
  }
}

const webRoots = ["apps/web/app", "apps/web/src/features", "packages/ui/src"];
const allWeb = walkFiles(webRoots);
const allUi = walkFiles(["apps/web", "packages/ui"]);

console.log("UI guard: runtime PNG import...");
check(
  "Runtime PNG import",
  scanFiles(allUi, "ui-design-output|desktop-default\\.png|mobile-default\\.png|00-design-system")
);

console.log("UI guard: technical leakage...");
check(
  "Technical leakage",
  scanFiles(allWeb, "Failed to fetch|stack trace|Worker foundation|Outbox job|Issue foundation|\\bRollback\\b")
);

console.log("UI guard: AI forbidden copy...");
check(
  "AI forbidden copy",
  scanFiles(
    walkFiles(["apps/web/src/features/ai", "apps/web/src/features/reports", "apps/web/src/features/inbox"]),
    "AI uyguladı|AI kaydetti|Tek tıkla değiştir|Otomatik kaydet|Kayıt güncellendi"
  )
);

console.log("UI guard: fake behavior...");
check(
  "Fake behavior",
  scanFiles(
    allWeb,
    "fake chart|fake insight|fake user|fake role|fake PDF|fake map|demo fallback|mock provider|başarıyla oluşturuldu"
  )
);

console.log("UI guard: tsbuildinfo hygiene...");
const tsbuild = path.join(repoRoot, "apps/web/tsconfig.tsbuildinfo");
if (fs.existsSync(tsbuild)) {
  try {
    const { execSync } = require("node:child_process");
    const status = execSync('git status --short -- "apps/web/tsconfig.tsbuildinfo"', {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
    if (status) failures.push("tsbuildinfo: apps/web/tsconfig.tsbuildinfo must not be committed.");
  } catch {
    /* ignore */
  }
}

if (failures.length) {
  console.error("\nUI guard FAILED\n");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("UI guard PASSED.");
process.exit(0);
