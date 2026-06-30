/**
 * Ensures migrate CLI entrypoints exist at dist/*.js (flat layout).
 * Some incremental builds emit to dist/database/src when dist was previously corrupted.
 */
const fs = require("node:fs");
const path = require("node:path");

const packageRoot = path.join(__dirname, "..");
const flatCli = path.join(packageRoot, "dist", "cli.js");
const nestedCli = path.join(packageRoot, "dist", "database", "src", "cli.js");

if (fs.existsSync(flatCli) || !fs.existsSync(nestedCli)) {
  process.exit(0);
}

function copyTree(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(sourcePath, targetPath);
      continue;
    }
    fs.copyFileSync(sourcePath, targetPath);
  }
}

const nestedRoot = path.join(packageRoot, "dist", "database", "src");
const flatRoot = path.join(packageRoot, "dist");
for (const entry of fs.readdirSync(nestedRoot, { withFileTypes: true })) {
  const sourcePath = path.join(nestedRoot, entry.name);
  const targetPath = path.join(flatRoot, entry.name);
  if (entry.isDirectory()) {
    if (fs.existsSync(targetPath)) {
      copyTree(sourcePath, targetPath);
    } else {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    }
    continue;
  }
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}
