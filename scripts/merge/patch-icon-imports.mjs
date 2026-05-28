/**
 * Point Final UI icon imports at reference icons bundle.
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
    else if (/\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

let patched = 0;
for (const file of walk(featuresRoot)) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("@/components/icons")) continue;
  const next = content.replaceAll("@/components/icons", "@/components/reference/icons");
  if (next !== content) {
    fs.writeFileSync(file, next, "utf8");
    patched += 1;
  }
}

console.log(`Fixed icon imports in ${patched} feature files.`);
