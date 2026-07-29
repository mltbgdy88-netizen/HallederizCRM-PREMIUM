/**
 * Runs the server-only WhatsApp Web Next BFF proxy and route tests.
 */
const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const root = join(__dirname, "..");
const webDir = join(root, "apps", "web");
const apiDir = join(root, "apps", "api");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const pnpmExecPath = process.env.npm_execpath;
const workspaceBuildCommand = pnpmExecPath ? process.execPath : pnpmCommand;
const workspaceBuildArgs = [
  ...(pnpmExecPath ? [pnpmExecPath] : []),
  "--filter",
  "@hallederiz/domain",
  "build"
];

const workspaceBuild = spawnSync(
  workspaceBuildCommand,
  workspaceBuildArgs,
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env }
  }
);

if (workspaceBuild.status !== 0) {
  console.error("Could not build the WhatsApp Web BFF workspace dependencies.");
  process.exit(workspaceBuild.status ?? 1);
}

const resolved = spawnSync(process.execPath, ["-e", "process.stdout.write(require.resolve('ts-node/esm'))"], {
  cwd: apiDir,
  encoding: "utf8"
});

if (resolved.status !== 0 || !resolved.stdout) {
  console.error("Could not resolve ts-node/esm from apps/api.");
  process.exit(1);
}

const loader = pathToFileURL(resolved.stdout.trim()).href;
const testDir = join(webDir, "src", "server", "__tests__");
const testFiles = readdirSync(testDir)
  .filter((file) => file.endsWith(".test.ts"))
  .sort()
  .map((file) => join("src", "server", "__tests__", file));

if (testFiles.length === 0) {
  console.error("No WhatsApp Web BFF test files found.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "--conditions=react-server",
    "--loader",
    loader,
    "--experimental-specifier-resolution=node",
    "--test",
    ...testFiles
  ],
  {
    cwd: webDir,
    stdio: "inherit",
    env: { ...process.env }
  }
);

process.exit(result.status ?? 1);
