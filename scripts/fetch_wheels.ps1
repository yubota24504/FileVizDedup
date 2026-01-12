<#
Downloads Python packages (wheels) for offline installation.
Run this on a machine with internet access.
#>
$repoRoot = Join-Path -Path $PSScriptRoot -ChildPath ".."
$req = Join-Path $repoRoot "requirements.txt"
$outDir = Join-Path $repoRoot "backend\vendor\wheels"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

if (-not (Test-Path $req)) {
    Write-Error "requirements.txt not found at $req"
    exit 1
}

Write-Host "Downloading wheels listed in $req to $outDir"
python -m pip download -r $req -d $outDir
Write-Host "Done. To install offline on target machine, run:"
Write-Host "  pip install --no-index --find-links=backend/vendor/wheels -r requirements.txt"
