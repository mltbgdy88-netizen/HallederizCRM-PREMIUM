const { execSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

try {
  execSync("pnpm run smoke:routes", { cwd: repoRoot, stdio: "inherit", shell: true });
  execSync("pnpm run smoke:navigation", { cwd: repoRoot, stdio: "inherit", shell: true });
  console.log("Smoke e2e foundation tamamlandi (routes + navigation).");
} catch {
  process.exit(1);
}
