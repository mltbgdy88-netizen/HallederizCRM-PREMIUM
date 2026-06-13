#!/usr/bin/env node
/**
 * UI-POLISH görsel QA hazırlık scripti.
 * Playwright yoksa route envanteri ve navigation smoke'u çalıştırır.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[visual-ui-polish] smoke:routes");
run("pnpm", ["smoke:routes"]);
console.log("[visual-ui-polish] smoke:navigation");
run("pnpm", ["smoke:navigation"]);
console.log("[visual-ui-polish] Tamam — piksel diff yok; manuel 1920/1366 kontrol önerilir.");
