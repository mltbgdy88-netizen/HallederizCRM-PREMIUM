const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const repoRoot = join(__dirname, "..", "..");
const packageDirs = [
  join(repoRoot, "packages", "database"),
  join(repoRoot, "packages", "domain"),
  join(repoRoot, "packages", "types"),
  join(repoRoot, "packages", "utils")
];

for (const packageDir of packageDirs) {
  const packageJsonPath = join(packageDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const packageFolderName = packageDir.split(/[\\/]/).at(-1);
  const compiledIndex = join(packageDir, "dist", packageFolderName, "src", "index.js");
  const compiledTypes = join(packageDir, "dist", packageFolderName, "src", "index.d.ts");

  if (!existsSync(compiledIndex)) {
    continue;
  }

  const distDir = join(packageDir, "dist");
  mkdirSync(distDir, { recursive: true });

  if (packageJson.main === "dist/index.js") {
    writeFileSync(
      join(distDir, "index.js"),
      `export * from "./${packageFolderName}/src/index.js";\n`
    );
  }

  if (packageJson.types === "dist/index.d.ts" && existsSync(compiledTypes)) {
    writeFileSync(
      join(distDir, "index.d.ts"),
      `export * from "./${packageFolderName}/src/index";\n`
    );
  }
}
