param(
  [ValidateSet("up", "down", "logs", "restart", "status")]
  [string]$Action = "up"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$ComposeFile = "docker-compose.local.yml"

if ($Action -eq "up") {
  docker compose -f $ComposeFile up -d
  docker compose -f $ComposeFile ps
  Write-Host ""
  Write-Host "Web: http://localhost:3000"
  Write-Host "API: http://localhost:4000"
  exit
}

if ($Action -eq "down") {
  docker compose -f $ComposeFile down
  exit
}

if ($Action -eq "logs") {
  docker compose -f $ComposeFile logs -f
  exit
}

if ($Action -eq "restart") {
  docker compose -f $ComposeFile restart
  docker compose -f $ComposeFile ps
  exit
}

if ($Action -eq "status") {
  docker compose -f $ComposeFile ps
  exit
}
