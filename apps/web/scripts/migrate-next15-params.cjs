#!/usr/bin/env node
const { readFileSync, writeFileSync, readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const appRoot = join(__dirname, "..", "app");

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else if (entry === "page.tsx") {
      acc.push(full);
    }
  }
  return acc;
}

function migrateContent(content) {
  if (!content.includes("params:") && !content.includes("searchParams")) {
    return content;
  }
  if (content.includes("await params") || content.includes("await searchParams")) {
    return content;
  }

  let next = content;

  next = next.replace(
    /type PageProps = \{\s*\n\s*params: (\{[^\n]+\});\s*\n\};/g,
    "type PageProps = {\n  params: Promise<$1>;\n};"
  );

  next = next.replace(
    /searchParams\?\s*:\s*(\{[\s\S]*?\});/g,
    (match, inner) => (match.includes("Promise<") ? match : `searchParams?: Promise<${inner}>;`)
  );

  next = next.replace(/\{ params: (\{[^}]+\}) \}/g, "{ params: Promise<$1> }");
  next = next.replace(/\{ searchParams\?: (\{[^}]+\}) \}/g, "{ searchParams?: Promise<$1> }");

  next = next.replace(/export default function /g, "export default async function ");

  const hasParams = /\bparams\b/.test(next);
  const hasSearchParams = /\bsearchParams\b/.test(next);

  const preamble = [];
  if (hasParams) {
    preamble.push("  const resolvedParams = await params;");
  }
  if (hasSearchParams) {
    preamble.push("  const resolvedSearchParams = searchParams ? await searchParams : undefined;");
  }

  if (preamble.length > 0) {
    next = next.replace(/(export default async function[\s\S]+\) \{)(\r?\n)/, `$1$2${preamble.join("\n")}$2`);
  }

  if (hasParams) {
    next = next.replace(/\bparams\./g, "resolvedParams.");
  }
  if (hasSearchParams) {
    next = next.replace(/\bsearchParams\?\./g, "resolvedSearchParams?.");
    next = next.replace(/\bsearchParams\./g, "resolvedSearchParams.");
  }

  return next;
}

let updated = 0;

for (const absolute of walk(appRoot)) {
  const original = readFileSync(absolute, "utf8");
  const migrated = migrateContent(original);
  if (migrated !== original) {
    writeFileSync(absolute, migrated, "utf8");
    updated += 1;
  }
}

console.log(`Updated ${updated} page files for Next.js 15 async params.`);
