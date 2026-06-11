#!/usr/bin/env node
const { readFileSync, readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const ROOT = join(__dirname, "..", "..");
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "artifacts", ".venv", "dist", "build", "docs"]);
const IGNORE_FILES = new Set([".env.example"]);
const PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----/,
  /postgresql:\/\/[^\s'"]+:[^\s'"]+@/i,
  /mongodb(\+srv)?:\/\/[^\s'"]+:[^\s'"]+@/i
];

let findings = 0;

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  for (const pattern of PATTERNS) {
    if (pattern.test(content)) {
      console.error(`[secret-scan] potential secret in ${filePath}`);
      findings += 1;
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(entry)) continue;
      walk(fullPath);
      continue;
    }
    if (IGNORE_FILES.has(entry)) continue;
    if (/\.(ts|tsx|js|cjs|json|yml|yaml)$/.test(entry)) {
      scanFile(fullPath);
    }
  }
}

walk(ROOT);
if (findings > 0) {
  process.exitCode = 1;
} else {
  console.log("[secret-scan] no obvious secret patterns found");
}
