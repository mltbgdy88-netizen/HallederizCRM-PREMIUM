const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const testsDir = join(__dirname, "..", "src", "tests");
const testFiles = readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => join("src", "tests", file));

if (testFiles.length === 0) {
  console.error("No API test files found under apps/api/src/tests.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--loader", "ts-node/esm", "--experimental-specifier-resolution=node", "--test", ...testFiles],
  {
    cwd: join(__dirname, ".."),
    env: {
      ...process.env,
      WHATSAPP_TEST_RECIPIENT: process.env.WHATSAPP_TEST_RECIPIENT ?? "905000000000"
    },
    stdio: "inherit"
  }
);

process.exit(result.status ?? 1);
