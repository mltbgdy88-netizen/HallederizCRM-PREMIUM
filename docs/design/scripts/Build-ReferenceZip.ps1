# Builds page/layer folder tree + zip from docs/design/reference/*.png
$ErrorActionPreference = 'Stop'
$designDir = Resolve-Path (Join-Path $PSScriptRoot '..')
$root = Resolve-Path (Join-Path $designDir '..\..')
$srcDir = Join-Path $designDir 'reference'
$outBase = Join-Path $designDir 'export'
$bundleName = 'HallederizCRM-Referans-Gorseller'
$bundleDir = Join-Path $outBase $bundleName
$zipPath = Join-Path $outBase "$bundleName.zip"

# pageFolder -> @{ 'relative/sub' = @('file1.png', ...) }
$layout = @{
  '00-onayli-sprint1\stok' = @(
    @{ sub = 'liste'; files = @('stok-operasyon-masasi-acik-mod.png') }
  )
  '00-onayli-sprint1\arsiv' = @(
    @{ sub = 'liste'; files = @('arsiv-operasyon-merkezi-acik-mod.png') }
  )
  '00-onayli-sprint1\raporlar' = @(
    @{ sub = 'liste'; files = @('rapor-operasyon-merkezi-acik-mod.png') }
  )
  '00-onayli-sprint1\whatsapp' = @(
    @{ sub = 'panel'; files = @('whatsapp-operasyon-paneli-acik-mod.png') }
  )
  '01-teklifler' = @(
    @{ sub = 'liste'; files = @('teklifler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('teklifler-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('teklifler-yeni-hub-acik-mod.png') }
    @{ sub = 'katmanlar\ozet'; files = @('teklifler-katman-ozet-acik-mod.png') }
    @{ sub = 'katmanlar\satirlar'; files = @('teklifler-katman-satirlar-acik-mod.png') }
    @{ sub = 'katmanlar\musteri'; files = @('teklifler-katman-musteri-acik-mod.png') }
    @{ sub = 'katmanlar\siparise-donusturme'; files = @('teklifler-katman-donusum-acik-mod.png') }
    @{ sub = 'katmanlar\belgeler'; files = @('teklifler-katman-belgeler-acik-mod.png') }
    @{ sub = 'katmanlar\timeline'; files = @('teklifler-katman-timeline-acik-mod.png') }
  )
  '02-siparisler' = @(
    @{ sub = 'liste'; files = @('siparisler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('siparisler-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('siparisler-yeni-hub-acik-mod.png') }
    @{ sub = 'katmanlar\ozet'; files = @('siparisler-katman-ozet-acik-mod.png') }
    @{ sub = 'katmanlar\satirlar'; files = @('siparisler-katman-satirlar-acik-mod.png') }
    @{ sub = 'katmanlar\odeme-tahsilat'; files = @('siparisler-katman-odeme-acik-mod.png') }
    @{ sub = 'katmanlar\teslimat'; files = @('siparisler-katman-teslimat-acik-mod.png') }
    @{ sub = 'katmanlar\fatura'; files = @('siparisler-katman-fatura-acik-mod.png') }
    @{ sub = 'katmanlar\iade'; files = @('siparisler-katman-iade-acik-mod.png') }
    @{ sub = 'katmanlar\depo-stok-etkisi'; files = @('siparisler-katman-depo-stok-acik-mod.png') }
    @{ sub = 'katmanlar\timeline'; files = @('siparisler-katman-timeline-acik-mod.png') }
  )
  '03-cariler' = @(
    @{ sub = 'liste'; files = @('cariler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('cariler-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('cariler-yeni-form-acik-mod.png') }
    @{ sub = 'katmanlar\ozet'; files = @('cariler-katman-ozet-acik-mod.png') }
    @{ sub = 'katmanlar\iletisim'; files = @('cariler-katman-iletisim-acik-mod.png') }
    @{ sub = 'katmanlar\finans'; files = @('cariler-katman-finans-acik-mod.png') }
    @{ sub = 'katmanlar\teklifler'; files = @('cariler-katman-teklifler-acik-mod.png') }
    @{ sub = 'katmanlar\siparisler'; files = @('cariler-katman-siparisler-acik-mod.png') }
    @{ sub = 'katmanlar\tahsilatlar'; files = @('cariler-katman-tahsilatlar-acik-mod.png') }
    @{ sub = 'katmanlar\timeline'; files = @('cariler-katman-timeline-acik-mod.png') }
  )
  '04-tahsilatlar' = @(
    @{ sub = 'liste'; files = @('tahsilatlar-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('tahsilatlar-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('tahsilatlar-yeni-form-acik-mod.png') }
  )
  '05-teslimatlar' = @(
    @{ sub = 'liste'; files = @('teslimatlar-operasyon-masasi-acik-mod.png') }
    @{ sub = 'rota'; files = @('teslimatlar-rota-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('teslimatlar-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('teslimatlar-yeni-form-acik-mod.png') }
  )
  '06-faturalar' = @(
    @{ sub = 'liste'; files = @('faturalar-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('faturalar-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('faturalar-yeni-form-acik-mod.png') }
  )
  '07-iadeler' = @(
    @{ sub = 'liste'; files = @('iadeler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('iadeler-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('iadeler-yeni-form-acik-mod.png') }
  )
  '08-depo' = @(
    @{ sub = 'liste-hazirlik'; files = @('depo-hazirlik-masasi-acik-mod.png') }
    @{ sub = 'detay-fis'; files = @('depo-fis-detay-masasi-acik-mod.png') }
  )
  '09-fabrikalar' = @(
    @{ sub = 'stok-liste'; files = @('fabrikalar-stok-operasyon-masasi-acik-mod.png') }
    @{ sub = 'siparis-liste'; files = @('fabrikalar-siparis-operasyon-masasi-acik-mod.png') }
    @{ sub = 'siparis-detay'; files = @('fabrikalar-siparis-detay-acik-mod.png') }
  )
  '10-belgeler' = @(
    @{ sub = 'liste'; files = @('belgeler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('belgeler-detay-masasi-acik-mod.png') }
    @{ sub = 'yeni'; files = @('belgeler-yeni-form-acik-mod.png') }
  )
  '11-gorevler' = @(
    @{ sub = 'liste'; files = @('gorevler-operasyon-masasi-acik-mod.png') }
    @{ sub = 'detay'; files = @('gorevler-detay-masasi-acik-mod.png') }
  )
  '12-kullanicilar' = @(
    @{ sub = 'liste'; files = @('kullanicilar-operasyon-masasi-acik-mod.png') }
    @{ sub = 'roller'; files = @('kullanicilar-roller-matris-acik-mod.png') }
  )
  '13-erp' = @(
    @{ sub = 'entegrasyon'; files = @('erp-entegrasyon-masasi-acik-mod.png') }
  )
  '14-ayarlar' = @(
    @{ sub = 'hub'; files = @('ayarlar-hub-acik-mod.png') }
  )
  '15-onaylar' = @(
    @{ sub = 'komut-masasi'; files = @('onaylar-komut-masasi-acik-mod.png') }
    @{ sub = 'kurallar-limitler'; files = @('onaylar-kurallar-matris-acik-mod.png') }
    @{ sub = 'detay-karar'; files = @('onaylar-detay-karar-acik-mod.png') }
  )
  '16-dashboard' = @(
    @{ sub = 'ana-sayfa'; files = @('dashboard-operasyon-acik-mod.png') }
  )
  '17-hizli-islem' = @(
    @{ sub = 'satis-masasi'; files = @('hizli-islem-satis-masasi-acik-mod.png') }
  )
  '18-ai' = @(
    @{ sub = 'operator-hub'; files = @('ai-operator-hub-acik-mod.png') }
    @{ sub = 'icgoruler'; files = @('ai-icgoruler-acik-mod.png') }
  )
  '19-gelen-kutu' = @(
    @{ sub = 'uc-panel'; files = @('gelen-kutu-uc-panel-acik-mod.png') }
    @{ sub = 'konusma-detay'; files = @('gelen-kutu-konusma-detay-acik-mod.png') }
  )
  '20-workflow' = @(
    @{ sub = 'timeline-detay'; files = @('workflow-timeline-detay-acik-mod.png') }
  )
  '21-sistem' = @(
    @{ sub = 'login'; files = @('login-split-acik-mod.png') }
    @{ sub = 'unauthorized'; files = @('unauthorized-state-acik-mod.png') }
    @{ sub = 'offline-api'; files = @('offline-api-state-acik-mod.png') }
    @{ sub = 'demo-mode'; files = @('demo-mode-state-acik-mod.png') }
    @{ sub = 'live-empty'; files = @('live-empty-state-acik-mod.png') }
  )
}

if (Test-Path $bundleDir) { Remove-Item $bundleDir -Recurse -Force }
New-Item -ItemType Directory -Path $bundleDir -Force | Out-Null

$mapped = New-Object 'System.Collections.Generic.HashSet[string]'
$copied = 0
$missing = @()

foreach ($pageKey in $layout.Keys | Sort-Object) {
  foreach ($entry in $layout[$pageKey]) {
    $destSub = Join-Path $bundleDir (Join-Path $pageKey $entry.sub)
    New-Item -ItemType Directory -Path $destSub -Force | Out-Null
    foreach ($file in $entry.files) {
      [void]$mapped.Add($file)
      $from = Join-Path $srcDir $file
      if (-not (Test-Path $from)) {
        $missing += $file
        continue
      }
      Copy-Item $from -Destination (Join-Path $destSub $file) -Force
      $copied++
    }
  }
}

# Alternatif / katalog dışı PNG'ler
$extras = Get-ChildItem $srcDir -Filter '*.png' -File | Where-Object { -not $mapped.Contains($_.Name) }
if ($extras.Count -gt 0) {
  $extraDir = Join-Path $bundleDir '_ek-alternatifler'
  New-Item -ItemType Directory -Path $extraDir -Force | Out-Null
  foreach ($f in $extras) {
    Copy-Item $f.FullName -Destination (Join-Path $extraDir $f.Name) -Force
    $copied++
  }
}

$readme = @"
HallederizCRM — Referans görsel paketi
=====================================
Üretim: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
Kaynak: docs/design/reference/

Klasör yapısı
-------------
Her sayfa modülü kendi klasöründe.
  liste / panel / hub     → ana liste veya giriş ekranı
  detay                   → entity kök detay (şablon B)
  katmanlar\<sekme>       → alt route katmanı (şablon C)
  yeni                    → form veya hub (şablon E/F)
  rota, roller, ...       → sayfaya özel alt yüzey

00-onayli-sprint1 → kodu onaylı 4 referans (stok, arşiv, rapor, whatsapp)

Route eşlemesi: docs/development/UI_REFERENCE_CATALOG.md

Onay
----
ONAY: TÜMÜ
veya modül: ONAY: 03-cariler, 02-siparisler, ...
"@
Set-Content -Path (Join-Path $bundleDir 'README.txt') -Value $readme -Encoding UTF8

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path $bundleDir -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host "Copied PNG: $copied"
Write-Host "Missing: $($missing.Count)"
if ($missing.Count) { $missing | ForEach-Object { Write-Host "  - $_" } }
Write-Host "Bundle: $bundleDir"
Write-Host "Zip: $zipPath"
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host ("Zip size: {0:N1} MB" -f $zipSize)
