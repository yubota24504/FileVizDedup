This folder is intended to hold frontend vendor assets for offline use.

Expected files (place here or use `scripts/fetch_assets.ps1` to download):

- `chart.min.js`                   - Chart.js bundle
- `fontawesome.min.css`            - Font Awesome CSS
- `webfonts/`                      - Font files referenced by Font Awesome CSS

How to populate (online machine):
1. From repository root run PowerShell (Windows):
   `powershell -ExecutionPolicy Bypass -File scripts\fetch_assets.ps1`

After running, verify `index.html` references `/static/vendor/...` and that the files exist.
