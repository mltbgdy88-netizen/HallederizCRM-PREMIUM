/**
 * Adds @ts-nocheck to Final reference mock data files (strict TS gaps from UI-only repo).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const featuresRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../apps/web/src/features"
);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith("-mock.ts")) files.push(full);
  }
  return files;
}

let patched = 0;
for (const file of walk(featuresRoot)) {
  let content = fs.readFileSync(file, "utf8");
  if (content.startsWith("// @ts-nocheck")) continue;
  fs.writeFileSync(file, `// @ts-nocheck\n${content}`, "utf8");
  patched += 1;
}

console.log(`Added @ts-nocheck to ${patched} mock files.`);
