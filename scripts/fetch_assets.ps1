<#
Downloads frontend vendor assets into `backend/static/vendor/`.
Run this once on a machine with internet access before using the app fully offline.
#>

$vendorDir = Join-Path -Path $PSScriptRoot -ChildPath "..\backend\static\vendor"
$vendorDir = (Resolve-Path $vendorDir).ProviderPath
if (-not (Test-Path $vendorDir)) { New-Item -ItemType Directory -Path $vendorDir | Out-Null }

Write-Host "Downloading Chart.js..."
$chartUrl = "https://cdn.jsdelivr.net/npm/chart.js"
$chartDest = Join-Path $vendorDir "chart.min.js"
Invoke-WebRequest -Uri $chartUrl -OutFile $chartDest

Write-Host "Downloading Font Awesome css and webfonts..."
$faCssUrl = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
$faCssDest = Join-Path $vendorDir "fontawesome.min.css"
Invoke-WebRequest -Uri $faCssUrl -OutFile $faCssDest

# Attempt to download referenced webfonts used by Font Awesome CSS.
# This is a best-effort approach: the CSS references webfonts under a webfonts/ path.
$css = Get-Content $faCssDest -Raw
$fontUrls = ([regex]"url\(['\"]?(https?:\\/\\/[^)'"]+)['\"]?\)").Matches($css) | ForEach-Object { $_.Groups[1].Value }
$fontDir = Join-Path $vendorDir "webfonts"
if (-not (Test-Path $fontDir)) { New-Item -ItemType Directory -Path $fontDir | Out-Null }
foreach ($u in $fontUrls) {
    try {
        $uri = $u -replace "\\/\\/", "//"
        $fileName = Split-Path -Path $uri -Leaf
        $dest = Join-Path $fontDir $fileName
        Write-Host "  Downloading $fileName"
        Invoke-WebRequest -Uri $uri -OutFile $dest -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $u : $_"
    }
}

Write-Host "Finished downloading frontend assets to $vendorDir"
Write-Host "If any font files failed, open $faCssDest and update URL paths to point to /static/vendor/webfonts/<file> as needed."
