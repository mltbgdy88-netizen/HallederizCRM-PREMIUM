#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync
} = require("node:fs");
const { basename, dirname, join, resolve, sep } = require("node:path");

const ROOT = resolve(__dirname, "..", "..");
const WEB_DIR = resolve(ROOT, "apps", "web");
const BUILD_DIR = resolve(WEB_DIR, ".runtime-next");
const STATIC_DIR = resolve(BUILD_DIR, "static");
const TOKEN_SENTINEL = "WA_BFF_CLIENT_BUNDLE_TOKEN_4fd2ac98e731";
const TENANT_SENTINEL = "WA_BFF_CLIENT_BUNDLE_TENANT_82c6db1754fa";
const SESSION_VALUE_SENTINEL = "SIGNED_SESSION_TEST_VALUE";
const SESSION_COOKIE_SENTINEL = `hz_session=${SESSION_VALUE_SENTINEL}`;
const CLIENT_MANIFEST_NAMES = new Set([
  "app-build-manifest.json",
  "build-manifest.json",
  "react-loadable-manifest.json"
]);
const FORBIDDEN_EXACT_VALUES = [
  TOKEN_SENTINEL,
  TENANT_SENTINEL,
  SESSION_VALUE_SENTINEL,
  SESSION_COOKIE_SENTINEL,
  "LOCAL_AGENT_CONTROL_TOKEN",
  "LOCAL_AGENT_TENANT_ID",
  `Bearer ${TOKEN_SENTINEL}`
];
const FORBIDDEN_PATTERNS = [
  /hz_session\s*=\s*[A-Za-z0-9._~-]{8,}/i,
  /Bearer\s+WA_BFF_CLIENT_BUNDLE_TOKEN_[A-Za-z0-9_-]+/i
];

function assertSafeBuildPath() {
  if (dirname(BUILD_DIR) !== WEB_DIR || basename(BUILD_DIR) !== ".runtime-next") {
    throw new Error("unsafe build path");
  }
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (stat.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function sanitizeBuildOutput(value) {
  let sanitized = value ?? "";
  for (const marker of FORBIDDEN_EXACT_VALUES) {
    sanitized = sanitized.split(marker).join("[redacted]");
  }
  return sanitized;
}

function runSentinelBuild() {
  const pnpmCli = process.env.npm_execpath;
  const command = pnpmCli
    ? process.execPath
    : process.platform === "win32"
      ? "pnpm.cmd"
      : "pnpm";
  const args = pnpmCli
    ? [pnpmCli, "--filter", "@hallederiz/web", "build"]
    : ["--filter", "@hallederiz/web", "build"];
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_ENV: "production",
      WEB_URL: "http://localhost:3000",
      LOCAL_AGENT_CONTROL_TOKEN: TOKEN_SENTINEL,
      LOCAL_AGENT_TENANT_ID: TENANT_SENTINEL
    }
  });

  if (result.stdout) process.stdout.write(sanitizeBuildOutput(result.stdout));
  if (result.stderr) process.stderr.write(sanitizeBuildOutput(result.stderr));
  if (result.error || result.status !== 0) {
    throw new Error("sentinel production build failed");
  }
}

function collectClientFiles() {
  if (!existsSync(STATIC_DIR)) {
    throw new Error("client static output missing");
  }

  const clientFiles = new Set(walkFiles(STATIC_DIR));
  const clientManifests = [...CLIENT_MANIFEST_NAMES]
    .map((manifestName) => resolve(BUILD_DIR, manifestName))
    .filter((manifestPath) => existsSync(manifestPath));
  if (clientFiles.size === 0 || clientManifests.length === 0) {
    throw new Error("client output or manifests missing");
  }

  for (const manifestPath of clientManifests) {
    clientFiles.add(manifestPath);
  }

  const referenceManifests = walkFiles(resolve(BUILD_DIR, "server")).filter((filePath) =>
    basename(filePath).includes("client-reference-manifest")
  );
  for (const manifestPath of referenceManifests) {
    const content = readFileSync(manifestPath, "utf8");
    const references =
      content.match(/(?:_next\/)?static\/[^"'\\\s]+?\.(?:js|css|json)/g) ?? [];
    for (const referencePath of references) {
      const normalizedReference = referencePath.replace(/^_next\//, "");
      const resolvedReference = resolve(BUILD_DIR, normalizedReference);
      if (
        (resolvedReference === STATIC_DIR || resolvedReference.startsWith(`${STATIC_DIR}${sep}`)) &&
        existsSync(resolvedReference)
      ) {
        clientFiles.add(resolvedReference);
      }
    }
  }

  return clientFiles;
}

function scanClientFiles(clientFiles) {
  let findingCount = 0;
  for (const filePath of clientFiles) {
    const content = readFileSync(filePath);
    for (const marker of FORBIDDEN_EXACT_VALUES) {
      if (content.includes(Buffer.from(marker, "utf8"))) {
        findingCount += 1;
      }
    }

    if (/\.(?:css|js|json|map|txt)$/i.test(filePath)) {
      const text = content.toString("utf8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(text)) {
          findingCount += 1;
        }
      }
    }
  }

  if (findingCount > 0) {
    throw new Error("forbidden client marker detected");
  }
  console.log(
    `[web-whatsapp-bff-bundle] scanned ${clientFiles.size} client files; no sensitive markers found`
  );
}

assertSafeBuildPath();
let temporaryRoot;
let backupBuildDir;
let hadOriginalBuild = false;
let originalBuildBackedUp = false;
let sentinelBuildStarted = false;
let failure;

try {
  temporaryRoot = mkdtempSync(join(WEB_DIR, ".runtime-next-bff-scan-"));
  backupBuildDir = join(temporaryRoot, "runtime-next-backup");
  hadOriginalBuild = existsSync(BUILD_DIR);
  if (hadOriginalBuild) {
    renameSync(BUILD_DIR, backupBuildDir);
    originalBuildBackedUp = true;
  }

  sentinelBuildStarted = true;
  runSentinelBuild();
  scanClientFiles(collectClientFiles());
} catch {
  failure = "sentinel client bundle scan failed";
} finally {
  try {
    if ((originalBuildBackedUp || (!hadOriginalBuild && sentinelBuildStarted)) && existsSync(BUILD_DIR)) {
      rmSync(BUILD_DIR, { recursive: true, force: true });
    }
    if (originalBuildBackedUp && backupBuildDir && existsSync(backupBuildDir)) {
      renameSync(backupBuildDir, BUILD_DIR);
      originalBuildBackedUp = false;
    }
    if (!originalBuildBackedUp && temporaryRoot && existsSync(temporaryRoot)) {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  } catch {
    failure = "sentinel client bundle cleanup failed";
  }
}

if (failure) {
  console.error(`[web-whatsapp-bff-bundle] ${failure}`);
  process.exit(1);
}
