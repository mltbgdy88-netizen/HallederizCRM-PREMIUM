param(
  [string]$HostAddress = "127.0.0.1",
  [int]$Port = 8008
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$piperModelPath = Join-Path $scriptDir "assets\tr_TR-dfki-medium.onnx"
$piperConfigPath = Join-Path $scriptDir "assets\tr_TR-dfki-medium.onnx.json"
$piperModelUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx?download=true"
$piperConfigUrl = "https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx.json?download=true"

function Resolve-PythonCommand {
  $launcher = Get-Command py -ErrorAction SilentlyContinue
  if ($launcher) {
    try {
      & py -3.11 --version *> $null
      if ($LASTEXITCODE -eq 0) {
        return "py -3.11"
      }
    } catch {
      # ignore and fallback
    }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    $version = (& python --version 2>&1) -join ""
    if ($version -like "Python 3.11*") {
      return "python"
    }
  }

  return $null
}

function Get-VenvPythonVersion {
  $venvPython = ".venv\Scripts\python.exe"
  if (-not (Test-Path $venvPython)) {
    return $null
  }

  try {
    $ver = (& $venvPython --version 2>&1) -join ""
    return $ver
  } catch {
    return $null
  }
}

function Resolve-OllamaCommand {
  $ollama = Get-Command ollama -ErrorAction SilentlyContinue
  if ($ollama) {
    return "ollama"
  }

  $fallback = "C:\Users\mevlu\AppData\Local\Programs\Ollama\ollama.exe"
  if (Test-Path $fallback) {
    return "`"$fallback`""
  }

  return $null
}

$pythonCmd = Resolve-PythonCommand
if (-not $pythonCmd) {
  Write-Error "Python 3.11 bulunamadi. XTTS/TTS bu projede Python 3.11 ister. Lutfen Python 3.11 kurup tekrar deneyin."
  Write-Host "Oneri: winget install -e --id Python.Python.3.11 --accept-package-agreements --accept-source-agreements"
  exit 1
}

$ollamaCmd = Resolve-OllamaCommand
if (-not $ollamaCmd) {
  Write-Error "ollama komutu bulunamadi. Once Ollama kurun ve ollama serve calistirin."
  Write-Host "Oneri: winget install -e --id Ollama.Ollama --accept-package-agreements --accept-source-agreements"
  exit 1
}

if (-not (Test-Path ".\assets")) {
  New-Item -ItemType Directory -Path ".\assets" | Out-Null
}

if (-not (Test-Path $piperModelPath)) {
  Write-Host "Piper Turkce ses modeli indiriliyor..."
  Invoke-WebRequest -Uri $piperModelUrl -OutFile $piperModelPath
}

if (-not (Test-Path $piperConfigPath)) {
  Write-Host "Piper Turkce ses konfigurasyonu indiriliyor..."
  Invoke-WebRequest -Uri $piperConfigUrl -OutFile $piperConfigPath
}

if (-not (Test-Path ".venv\Scripts\Activate.ps1")) {
  Write-Host "Python venv not found. Creating .venv with $pythonCmd ..."
  Invoke-Expression "$pythonCmd -m venv .venv"
}

$venvVersion = Get-VenvPythonVersion
if ($venvVersion -and ($venvVersion -notlike "Python 3.11*")) {
  Write-Host "Existing .venv uses '$venvVersion'. Recreating with Python 3.11..."
  Remove-Item -Recurse -Force ".venv"
  Invoke-Expression "$pythonCmd -m venv .venv"
}

. ".venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

$env:LOCAL_AI_HOST = $HostAddress
$env:LOCAL_AI_PORT = "$Port"
$env:PATH = "C:\Users\mevlu\AppData\Local\Programs\Ollama;$env:PATH"

python -m uvicorn app.main:app --host $HostAddress --port $Port --reload

