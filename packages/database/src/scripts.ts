import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function dirnameFromImportMeta(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl));
}

export async function loadMigrationSqlFiles(importMetaUrl: string): Promise<string[]> {
  const root = dirnameFromImportMeta(importMetaUrl);
  const migrationDir = path.join(root, "migrations");
  const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
  return Promise.all(files.map((file) => readFile(path.join(migrationDir, file), "utf8")));
}

export async function loadSeedSqlFiles(importMetaUrl: string): Promise<string[]> {
  const root = dirnameFromImportMeta(importMetaUrl);
  const seedDir = path.join(root, "seeds");
  const files = (await readdir(seedDir)).filter((file) => file.endsWith(".sql")).sort();
  return Promise.all(files.map((file) => readFile(path.join(seedDir, file), "utf8")));
}
