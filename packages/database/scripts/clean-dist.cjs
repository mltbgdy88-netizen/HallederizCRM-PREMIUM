const fs = require("node:fs");
const path = require("node:path");

const packageRoot = path.join(__dirname, "..");
const distDir = path.join(packageRoot, "dist");
const flatCli = path.join(distDir, "cli.js");

if (!fs.existsSync(distDir)) {
  process.exit(0);
}

const nestedCli = path.join(distDir, "database", "src", "cli.js");
if (!fs.existsSync(flatCli) && fs.existsSync(nestedCli)) {
  process.exit(0);
}

if (fs.existsSync(flatCli)) {
  process.exit(0);
}

fs.rmSync(distDir, { recursive: true, force: true });
