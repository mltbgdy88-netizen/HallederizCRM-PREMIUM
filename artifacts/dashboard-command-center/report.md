# Dashboard Command Center QA (compact)

## Build gates

| Gate | Result |
|------|--------|
| pnpm ui:guard | PASS |
| web/ui typecheck | PASS |
| api test | PASS |
| web/ui build | PASS |
| smoke:navigation | PASS |
| smoke:routes | PASS |

## Screenshot capture

Otomatik Playwright çekimi bu ortamda demo login tamamlanamadı (API oturumu gerekli). Dev + API ayaktayken:

```powershell
$tempDir = "$env:TEMP\hz-playwright-capture"
$outDir = "C:\Users\mevlu\Desktop\HallederizCRM-PREMIUM-CURSOR\artifacts\dashboard-command-center"
Copy-Item "$outDir\capture-dashboard.mjs" "$tempDir\capture-dashboard.mjs" -Force
Set-Location $tempDir
$env:UI_CAPTURE_BASE_URL = "http://localhost:3001"
$env:UI_CAPTURE_OUT_ROOT = $outDir
node capture-dashboard.mjs
```

## Manuel kontrol (/dashboard)

- [ ] 1366×768 — ana panel kompakt, taşma yok
- [ ] 1920×1080 — Acil, Görevler, Operasyon, Son İşlemler, AI, Video görünür
- [ ] Sidebar ikonları altın (#FACC15), 18px
- [ ] Renkler canlı zümrüt/altın
- [ ] Grafik yok
