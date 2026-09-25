const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const testsDir = join(__dirname, "..", "src", "tests");
const testFiles = readdirSync(testsDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => join("src", "tests", file));

const result = spawnSync(
  process.execPath,
  ["--loader", "ts-node/esm", "--experimental-specifier-resolution=node", "--test", ...testFiles],
  { cwd: join(__dirname, ".."), env: process.env, stdio: "inherit" }
);

process.exit(result.status ?? 1);
