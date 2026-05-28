/**
 * Patches Final-internal route links to PREMIUM canonical routes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const featuresRoot = path.resolve(__dirname, "../../apps/web/src/features");
const componentsRoot = path.resolve(__dirname, "../../apps/web/src/components");

const REPLACEMENTS = [
  ['"/arsiv"', '"/archive"'],
  ["'/arsiv'", "'/archive'"],
  ['"/demo"', '"/demo-mode"'],
  ["'/demo'", "'/demo-mode'"],
  ['"/empty"', '"/live-empty"'],
  ["'/empty'", "'/live-empty'"],
  ['"/offline"', '"/offline-api"'],
  ["'/offline'", "'/offline-api'"],
  ['href: "/arsiv"', 'href: "/archive"'],
  ['href: "/demo"', 'href: "/demo-mode"'],
  ['href: "/empty"', 'href: "/live-empty"']
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let patched = 0;
for (const file of [...walk(featuresRoot), ...walk(componentsRoot)]) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    patched += 1;
  }
}

console.log(`Patched route links in ${patched} files.`);
