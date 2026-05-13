/**
 * Runs apps/web navigation / manifest unit tests (same loader setup as approval web tests).
 */
const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const root = join(__dirname, "..");
const webDir = join(root, "apps", "web");
const apiDir = join(root, "apps", "api");

const resolved = spawnSync(process.execPath, ["-e", "process.stdout.write(require.resolve('ts-node/esm'))"], {
  cwd: apiDir,
  encoding: "utf8"
});

if (resolved.status !== 0 || !resolved.stdout) {
  console.error("Could not resolve ts-node/esm from apps/api.");
  process.exit(1);
}

const loader = pathToFileURL(resolved.stdout.trim()).href;
const testDir = join(webDir, "src", "navigation", "__tests__");
const testFiles = readdirSync(testDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => join("src", "navigation", "__tests__", file));

if (testFiles.length === 0) {
  console.error("No navigation test files found.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--loader", loader, "--experimental-specifier-resolution=node", "--test", ...testFiles],
  {
    cwd: webDir,
    stdio: "inherit",
    env: { ...process.env }
  }
);

process.exit(result.status ?? 1);
