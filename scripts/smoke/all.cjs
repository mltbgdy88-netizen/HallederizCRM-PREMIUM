/**
 * Runs smoke suite in order: navigation (static) -> production-data (optional skip) -> api-offline.
 */
const { execSync } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

function run(command) {
  console.log(`\n>> ${command}`);
  execSync(command, { cwd: repoRoot, stdio: "inherit", shell: true, env: process.env });
}

function main() {
  run("pnpm smoke:navigation");
  run("pnpm smoke:production-data");
  run("pnpm smoke:api-offline");
  console.log("\nSmoke all tamamlandi.");
}

main();
