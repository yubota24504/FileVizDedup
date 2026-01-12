# FileVizDedup - File Visualization & Deduplication Tool

**[English]** / [日本語](#filevizdedup---ファイル可視化--重複排除ツール)

---

## 🇺🇸 English Guide

### Overview
FileVizDedup is an offline tool to visualize your directory structure and identify duplicate files to save space. It runs entirely on your local machine for security.

### Features
*   **Safe**: Runs only on `localhost` (not accessible from network).
*   **Visual**: See which folders take up the most space.
*   **Cleanup**: Find and list duplicate files by size and content.
*   **Bilingual**: Switch between English and Japanese.

### Installation
1.  Ensure you have **Python 3.x** installed.
2.  Run the **`install_requirements.bat`** file (double-click).
    *   This installs `fastapi`, `uvicorn`, and `pydantic`.
    *   *You only need to do this once.*

### How to Run
1.  Double-click **`run_app.bat`**.
2.  A command window will open (do not close it).
3.  Your default web browser should automatically open `http://127.0.0.1:8000`.

### Usage
1.  **Scan**: Enter a drive or folder path (e.g., `F:\` or `C:\Users`) and click "Scan".
2.  **Visualize**: Use the tabs to toggle between "Tree View" and "Chart View".
3.  **Find Duplicates**: Click "Check Duplicates" to analyze files. It will group matches by content.
4.  **Language**: Click the Globe icon 🌐 in the top right to switch to Japanese.

---

## 🇯🇵 日本語ガイド (Japanese Guide)

### 概要 (Overview)
FileVizDedupは、フォルダ構造を可視化し、重複ファイルを特定してディスク容量を節約するためのオフラインツールです。セキュリティのため、ローカルマシン上でのみ動作します。

### 特徴 (Features)
*   **安全**: `localhost` (自分のPC) のみで動作し、外部ネットワークからはアクセスできません。
*   **可視化**: どのフォルダが容量を占有しているか一目でわかります。
*   **整理**: サイズと内容で重複ファイルを検出し、リストアップします。
*   **バイリンガル**: 日本語と英語を切り替え可能です。

### インストール (Installation)
1.  **Python 3.x** がインストールされていることを確認してください。
2.  フォルダ内の **`install_requirements.bat`** をダブルクリックして実行します。
    *   必要なライブラリ (`fastapi`, `uvicorn` など) がインストールされます。
    *   *これは最初の1回だけ行えばOKです。*

### 起動方法 (How to Run)
1.  **`run_app.bat`** をダブルクリックします。
2.  黒い画面（コマンドプロンプト）が開きます（閉じないでください）。
3.  自動的にブラウザが立ち上がり、`http://127.0.0.1:8000` が開きます。

### 使い方 (Usage)
1.  **スキャン**: ドライブやフォルダのパス（例: `F:\` や `C:\Users`）を入力し、「スキャン」ボタンを押します。
2.  **可視化**: ツリー表示とグラフ表示を切り替えて、ファイル構成を確認できます。
3.  **重複チェック**: 「重複チェック」ボタンを押すと、内容が完全に一致するファイルを探し出します。
4.  **言語切り替え**: 右上の地球儀アイコン 🌐 をクリックすると、日本語/英語が切り替わります。

---

## License & Publishing / ライセンスと公開について

**English (recommended)**

- Repository inspection (manual, 2026-01-12): no embedded secrets or credentials were found in the files I reviewed. This statement is not a substitute for automated secret scanning — run tools such as `git-secrets` or `truffleHog` before publishing for higher assurance.
- The application is intended for local use: the FastAPI server binds to `127.0.0.1` by default. The provided `run_app.bat` uses `--reload` for development convenience; do not use `--reload` in production.
- Front-end assets are fetched from third-party CDNs (Google Fonts, Font Awesome, Chart.js). If you require a fully offline distribution or want to avoid external network requests, bundle these assets into the repository or serve them locally.
- CORS: the app is configured to allow only `http://127.0.0.1:8000` by default. If you need to change this flag for your environment, edit `backend/main.py`'s `allow_origins` list accordingly.
- Licensing: this repository includes an `LICENSE` file using the MIT license. Before publishing, replace the placeholder copyright holder in `LICENSE` with your
    name or organization. If you prefer a different license (Apache-2.0, GPLv3, etc.), replace `LICENSE` with your chosen license.

**日本語（推奨）**

- （手動チェック、2026-01-12）確認したファイル群からは認証情報や秘密鍵などの機密情報は見つかりませんでした。本記載は目視による確認に基づいており、自動スキャンの代替にはなりません。公開前に `git-secrets` や `truffleHog` などのツールで追加確認することを推奨します。
- 本アプリはローカル実行を想定しており、FastAPIはデフォルトで `127.0.0.1` にバインドします。`run_app.bat` は開発用に `--reload` を使っています。本番では `--reload` を外してください。
- フロントエンドは外部CDN（Google Fonts、Font Awesome、Chart.js）を利用しています。完全オフライン配布や外部依存を避けたい場合は、これらをリポジトリに同梱して配布してください。
- CORS: デフォルトで `http://127.0.0.1:8000` のみ許可する設定に変更済みです。必要に応じて `backend/main.py` の `allow_origins` を編集してください。
- ライセンス: リポジトリに MIT ライセンスの `LICENSE` が含まれています。公開前に `LICENSE` の著作権者表記（<Your Name>）を適切に変更してください。別のライセンスを希望する場合は差し替えます。

 Quick suggestions:
 
 - Add a `SECURITY.md` with reporting instructions and a contact address for vulnerability reports. (A template is already included.)
 - Include the inspection date (as above) so future reviewers know when the manual check was performed.
 - Run a secret-scan across the full git history to ensure no secrets were committed previously.

 Offline packaging

 - This repository can be used fully offline after you populate local vendor assets and Python wheels. To prepare a machine with internet access to generate offline artifacts, perform the following from the repository root (PowerShell):

 ```powershell
 # Download frontend vendor assets (Chart.js, Font Awesome webfonts)
 powershell -ExecutionPolicy Bypass -File scripts\fetch_assets.ps1

 # Download pip wheels for offline install
 powershell -ExecutionPolicy Bypass -File scripts\fetch_wheels.ps1
 ```

 - After running those scripts you will have:
     - `backend/static/vendor/` with `chart.min.js`, `fontawesome.min.css`, and `webfonts/`.
     - `backend/vendor/wheels/` containing Python wheels for packages in `requirements.txt`.

 - To install packages on an offline machine that has the repo and the wheels directory, run:

 ```powershell
 pip install --no-index --find-links=backend/vendor/wheels -r requirements.txt
 ```

If you want, I can: 1) replace the license with another SPDX choice, 2) bundle external assets for offline use, or 3) add a `SECURITY.md` and suggested `SECURITY` instructions. Which would you like me to do next?
