import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveAssetDirectory(importMetaUrl: string, subdir: "migrations" | "seeds"): string {
  const moduleDir = path.dirname(fileURLToPath(importMetaUrl));
  const candidates = [
    path.join(moduleDir, subdir),
    path.join(moduleDir, "..", "src", subdir),
    path.join(moduleDir, "..", "..", "..", "src", subdir)
  ];

  let current = moduleDir;
  while (current !== path.dirname(current)) {
    const packageJson = path.join(current, "package.json");
    const srcDir = path.join(current, "src", subdir);
    if (existsSync(packageJson) && existsSync(srcDir)) {
      candidates.push(srcDir);
    }
    current = path.dirname(current);
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Database ${subdir} directory not found.`);
}

export async function loadMigrationSqlFiles(importMetaUrl: string): Promise<string[]> {
  const migrationDir = resolveAssetDirectory(importMetaUrl, "migrations");
  const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
  return Promise.all(files.map((file) => readFile(path.join(migrationDir, file), "utf8")));
}

export async function loadSeedSqlFiles(importMetaUrl: string): Promise<string[]> {
  const seedDir = resolveAssetDirectory(importMetaUrl, "seeds");
  const files = (await readdir(seedDir)).filter((file) => file.endsWith(".sql")).sort();
  return Promise.all(files.map((file) => readFile(path.join(seedDir, file), "utf8")));
}

/** Load migration SQL from this package (works from dist after build). */
export async function listPackageMigrationSqlContents(): Promise<string[]> {
  return loadMigrationSqlFiles(import.meta.url);
}

/** Load seed SQL from this package (works from dist after build). */
export async function listPackageSeedSqlContents(): Promise<string[]> {
  return loadSeedSqlFiles(import.meta.url);
}
