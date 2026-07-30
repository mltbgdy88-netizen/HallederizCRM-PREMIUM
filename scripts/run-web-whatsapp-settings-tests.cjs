/**
 * Runs focused client-side WhatsApp Web settings service, state, view, and React UI tests.
 */
const { spawnSync } = require("node:child_process");
const { existsSync, readdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

const root = join(__dirname, "..");
const webDir = join(root, "apps", "web");
const apiDir = join(root, "apps", "api");
const uiDistDir = join(root, "packages", "ui", "dist");
const uiDistExisted = existsSync(uiDistDir);
const cleanupWorkspaceBuild = () => {
  if (!uiDistExisted) {
    rmSync(uiDistDir, { recursive: true, force: true });
  }
};
process.once("exit", cleanupWorkspaceBuild);
process.once("SIGINT", () => process.exit(130));
process.once("SIGTERM", () => process.exit(143));
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const pnpmExecPath = process.env.npm_execpath;
const workspaceBuildCommand = pnpmExecPath ? process.execPath : pnpmCommand;
const workspaceBuildArgs = [
  ...(pnpmExecPath ? [pnpmExecPath] : []),
  "--filter",
  "@hallederiz/ui",
  "build"
];

const workspaceBuild = spawnSync(workspaceBuildCommand, workspaceBuildArgs, {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env }
});

if (workspaceBuild.status !== 0) {
  console.error("Could not build the WhatsApp Web settings test dependencies.");
  process.exit(workspaceBuild.status ?? 1);
}

const resolved = spawnSync(
  process.execPath,
  ["-e", "process.stdout.write(require.resolve('ts-node/esm'))"],
  {
    cwd: apiDir,
    encoding: "utf8"
  }
);

if (resolved.status !== 0 || !resolved.stdout) {
  console.error("Could not resolve ts-node/esm from apps/api.");
  process.exit(1);
}

const loader = pathToFileURL(resolved.stdout.trim()).href;
const testDir = join(webDir, "src", "features", "settings", "__tests__");
const testFiles = readdirSync(testDir)
  .filter(
    (file) =>
      file.startsWith("whatsapp-web-local-") &&
      (file.endsWith(".test.ts") || file.endsWith(".test.tsx"))
  )
  .sort()
  .map((file) => join("src", "features", "settings", "__tests__", file));

if (testFiles.length === 0) {
  console.error("No focused WhatsApp Web settings test files found.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "--loader",
    loader,
    "--experimental-specifier-resolution=node",
    "--test",
    "--test-concurrency=1",
    ...testFiles
  ],
  {
    cwd: webDir,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      TS_NODE_COMPILER_OPTIONS: JSON.stringify({ jsx: "react-jsx" })
    }
  }
);

process.exit(result.status ?? 1);
