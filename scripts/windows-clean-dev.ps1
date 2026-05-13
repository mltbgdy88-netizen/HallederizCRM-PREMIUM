param(
  [switch]$Reinstall
)

$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")

function Remove-RepoPath {
  param([string]$RelativePath)
  $target = Join-Path $repo $RelativePath
  if (-not (Test-Path -LiteralPath $target)) {
    return
  }
  $resolved = Resolve-Path -LiteralPath $target
  if (-not $resolved.Path.StartsWith($repo.Path, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove path outside repo: $($resolved.Path)"
  }
  Remove-Item -LiteralPath $resolved.Path -Recurse -Force
}

Get-Process node,pnpm -ErrorAction SilentlyContinue | Stop-Process -Force

@(
  ".turbo",
  "apps/web/.next",
  "apps/web/.next-cache",
  "apps/web/.runtime-next",
  "apps/web/.runtime-next-dev",
  "apps/web/tsconfig.tsbuildinfo",
  "apps/api/dist",
  "apps/worker/dist",
  "apps/local-agent/dist",
  "apps/ai-service/dist"
) | ForEach-Object { Remove-RepoPath $_ }

Get-ChildItem -LiteralPath $repo -Recurse -Filter "*.tsbuildinfo" -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName.StartsWith($repo.Path, [StringComparison]::OrdinalIgnoreCase) } |
  Remove-Item -Force

if ($Reinstall) {
  pnpm install --force
}

Write-Output "Windows dev cleanup completed."
