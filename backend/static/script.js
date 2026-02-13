const translations = {
    en: {
        scanBtn: "Scan",
        scanTitle: "Directory Scanner",
        pathPlaceholder: "Enter path (e.g., F:/)",
        loading: "Scanning...",
        vizTitle: "File Visualization",
        dedupTitle: "Duplicates & Improvements",
        checkDupBtn: "Check Duplicates",
        explainBtn: "Explain with AI",
        explainLoading: "AI is thinking...",
        deleteBtn: "Delete Selected",
        deleteConfirm: "Are you sure you want to delete the selected files? This cannot be undone.",
        deleteSuccess: "Files deleted successfully.",
        deleteError: "Error deleting files",
        dedupEmpty: "No duplicates check passed yet.",
        size: "Size",
        files: "files",
        wastedSpace: "Potential Wasted Space",
        suggestion: "Suggestion: Review these files and delete unnecessary copies."
    },
    ja: {
        scanBtn: "スキャン",
        scanTitle: "ディレクトリスキャナー",
        pathPlaceholder: "パスを入力 (例: F:/)",
        loading: "スキャン中...",
        vizTitle: "ファイル可視化",
        dedupTitle: "重複・改善提案",
        checkDupBtn: "重複チェック",
        explainBtn: "AIで説明",
        explainLoading: "AIが分析中...",
        deleteBtn: "選択ファイルを削除",
        deleteConfirm: "選択したファイルを削除してもよろしいですか？この操作は取り消せません。",
        deleteSuccess: "ファイルが正常に削除されました。",
        deleteError: "ファイルの削除に失敗しました",
        dedupEmpty: "まだ重複チェックを行っていません。",
        size: "サイズ",
        files: "ファイル",
        wastedSpace: "無駄なスペースの可能性",
        suggestion: "改善案: これらのファイルを確認し、不要なコピーを削除してください。"
    }
};

let currentLang = 'en';
let fileTreeData = null;
let currentDuplicates = [];

// DOM Elements
const els = {
    langToggle: document.getElementById('lang-toggle'),
    currentLang: document.getElementById('current-lang'),
    scanBtn: document.getElementById('scan-btn'),
    pathInput: document.getElementById('path-input'),
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loading-text'),
    fileTree: document.getElementById('file-tree'),
    checkDupBtn: document.getElementById('check-dup-btn'),
    explainBtn: document.getElementById('explain-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    dedupContent: document.getElementById('dedup-content'),
    dedupEmpty: document.getElementById('dedup-empty'),
    scanTitle: document.getElementById('scan-title'),
    vizTitle: document.getElementById('viz-title'),
    dedupTitle: document.getElementById('dedup-title'),
    checkDupText: document.getElementById('check-dup-text'),
    explainBtnText: document.getElementById('explain-btn-text'),
    deleteText: document.getElementById('delete-text'),
    dedupEmptyText: document.getElementById('dedup-empty-text'),
    scanBtnText: document.getElementById('scan-btn-text'),
    chartContainer: document.getElementById('chart-container'),
    fileChart: document.getElementById('file-chart'),
    viewToggles: document.querySelectorAll('.view-toggles button')
};

// Track selected files for deletion
let selectedFiles = new Set();

// Language Switching
els.langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ja' : 'en';
    updateLanguage();
});

function updateLanguage() {
    const t = translations[currentLang];
    els.currentLang.textContent = currentLang.toUpperCase();
    els.scanBtnText.textContent = t.scanBtn;
    els.scanTitle.textContent = t.scanTitle;
    els.pathInput.placeholder = t.pathPlaceholder;
    els.loadingText.textContent = t.loading;
    els.vizTitle.textContent = t.vizTitle;
    els.dedupTitle.textContent = t.dedupTitle;
    els.checkDupText.textContent = t.checkDupBtn;
    els.explainBtnText.textContent = t.explainBtn;
    els.deleteText.textContent = t.deleteBtn;
    els.dedupEmptyText.textContent = t.dedupEmpty;
    // Re-render duplicates to update text
    if (currentDuplicates && currentDuplicates.length > 0) {
        renderDuplicates(currentDuplicates);
    }
}


// File Scanning
els.scanBtn.addEventListener('click', async () => {
    const path = els.pathInput.value;
    if (!path) return;

    setLoading(true, translations[currentLang].loading);
    try {
        const res = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        
        if (!res.ok) throw new Error('Scan failed');
        
        fileTreeData = await res.json();
        renderFileTree(fileTreeData, els.fileTree);
        renderChart(fileTreeData);
    } catch (e) {
        alert('Error scanning directory: ' + e.message);
    } finally {
        setLoading(false);
    }
});

// Duplicates Check
els.checkDupBtn.addEventListener('click', async () => {
    const path = els.pathInput.value;
    if (!path) return;

    setLoading(true, translations[currentLang].loading);
    try {
        const res = await fetch('/api/duplicates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        
        if (!res.ok) throw new Error('Duplicate check failed');
        
        const result = await res.json();
        currentDuplicates = result || []; // API returns an array directly
        selectedFiles.clear();
        renderDuplicates(currentDuplicates);
        
        if (currentDuplicates.length > 0) {
            els.explainBtn.style.display = 'inline-block';
        } else {
            els.explainBtn.style.display = 'none';
        }

    } catch (e) {
        alert('Error checking duplicates: ' + e.message);
    } finally {
        setLoading(false);
    }
});

// Explain Duplicates
els.explainBtn.addEventListener('click', async () => {
    const path = els.pathInput.value;
    if (!path || currentDuplicates.length === 0) return;

    setLoading(true, translations[currentLang].explainLoading);
    try {
        const res = await fetch('/api/duplicates/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, lang: currentLang, max_groups: 10 })
        });

        if (!res.ok) throw new Error('Explain duplicates failed');

        const result = await res.json();
        // Merge explanations into currentDuplicates
        const explainedGroups = result.groups || [];
        explainedGroups.forEach(explainedGroup => {
            const originalGroup = currentDuplicates.find(g => g.hash === explainedGroup.hash);
            if (originalGroup) {
                originalGroup.explanation = explainedGroup.explanation;
            }
        });
        renderDuplicates(currentDuplicates);

    } catch (e) {
        alert('Error explaining duplicates: ' + e.message);
    } finally {
        setLoading(false);
    }
});


// Delete Selected Files
els.deleteBtn.addEventListener('click', async () => {
    if (selectedFiles.size === 0) {
        alert('No files selected for deletion.');
        return;
    }

    const t = translations[currentLang];
    if (!confirm(t.deleteConfirm)) return;

    setLoading(true, translations[currentLang].loading);
    try {
        const res = await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: Array.from(selectedFiles) })
        });
        
        if (!res.ok) throw new Error('Delete operation failed');
        
        const result = await res.json();
        alert(t.deleteSuccess);
        selectedFiles.clear();
        els.deleteBtn.style.display = 'none';
        
        // Refresh duplicates list by clicking the button again
        els.checkDupBtn.click();

    } catch (e) {
        alert(t.deleteError + ': ' + e.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading, text = "Loading...") {
    els.loadingText.textContent = text;
    if (isLoading) {
        els.loading.classList.remove('hidden');
        els.scanBtn.disabled = true;
        els.checkDupBtn.disabled = true;
        els.explainBtn.disabled = true;
    } else {
        els.loading.classList.add('hidden');
        els.scanBtn.disabled = false;
        els.checkDupBtn.disabled = false;
        els.explainBtn.disabled = false;
    }
}

// Rendering
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderFileTree(node, container) {
    container.innerHTML = '';
    container.appendChild(createTreeNode(node));
}

function createTreeNode(node) {
    const div = document.createElement('div');
    div.className = 'file-tree-item';

    if (node.type === 'directory') {
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `<i class="fa-regular fa-folder"></i> ${node.name} <span class="size-badge">${formatSize(node.size)}</span>`;
        
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'nested hidden';
        
        header.addEventListener('click', (e) => {
            childrenContainer.classList.toggle('hidden');
            const icon = header.querySelector('i');
            icon.className = childrenContainer.classList.contains('hidden') ? 'fa-regular fa-folder' : 'fa-regular fa-folder-open';
            e.stopPropagation();
        });

        div.appendChild(header);
        div.appendChild(childrenContainer);

        node.children.forEach(child => {
            childrenContainer.appendChild(createTreeNode(child));
        });
    } else {
        div.innerHTML = `<div class="file-item"><i class="fa-regular fa-file"></i> ${node.name} <span class="size-badge">${formatSize(node.size)}</span></div>`;
    }
    return div;
}

function renderDuplicates(groups) {
    els.dedupContent.innerHTML = '';
    const t = translations[currentLang];

    if (!groups || groups.length === 0) {
        els.dedupContent.innerHTML = `<div class="empty-state" id="dedup-empty">
            <i class="fa-regular fa-clone"></i>
            <p id="dedup-empty-text">${t.dedupEmpty}</p>
        </div>`;
        els.deleteBtn.style.display = 'none';
        els.explainBtn.style.display = 'none';
        return;
    }

    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'dup-group glass-panel';
        
        const wasted = group.wasted;
        
        const pathsHtml = group.paths.map(p => {
            const isSelected = selectedFiles.has(p);
            return `
                <div class="dup-path">
                    <input type="checkbox" class="file-checkbox" data-file="${p}" ${isSelected ? 'checked' : ''}>
                    <i class="fa-solid fa-turn-up"></i> ${p}
                </div>
            `;
        }).join('');

        const explanationHtml = group.explanation 
            ? `<div class="dup-explanation">${group.explanation}</div>` 
            : '';
        
        groupDiv.innerHTML = `
            <div class="dup-header">
                <span>${t.wastedSpace}: ${formatSize(wasted)}</span>
                <span>${group.paths.length} ${t.files} (${formatSize(group.size)} each)</span>
            </div>
            <div class="dup-paths">
                ${pathsHtml}
            </div>
            <div class="dup-warning">
                <i class="fa-solid fa-lightbulb"></i> ${t.suggestion}
            </div>
            ${explanationHtml}
        `;
        
        groupDiv.querySelectorAll('.file-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const file = e.target.dataset.file;
                if (e.target.checked) {
                    selectedFiles.add(file);
                } else {
                    selectedFiles.delete(file);
                }
                els.deleteBtn.style.display = selectedFiles.size > 0 ? 'inline-block' : 'none';
            });
        });
        
        els.dedupContent.appendChild(groupDiv);
    });

    els.deleteBtn.style.display = selectedFiles.size > 0 ? 'inline-block' : 'none';
    els.explainBtn.style.display = 'inline-block';
}


// Chart Visualization
let myChart = null;

function renderChart(data) {
    if (typeof Chart === 'undefined') {
        if (myChart) myChart.destroy();
        els.chartContainer.innerHTML = '<div class="empty-state">Chart visualization unavailable.</div>';
        return;
    }

    if (myChart) myChart.destroy();

    const labels = data.children.map(c => c.name);
    const sizes = data.children.map(c => c.size);
    
    const others = { label: 'Others', size: 0 };
    const chartData = sizes.map((size, i) => ({ label: labels[i], size }))
        .sort((a, b) => b.size - a.size);

    const top10 = chartData.slice(0, 10);
    const otherSize = chartData.slice(10).reduce((acc, curr) => acc + curr.size, 0);
    if(otherSize > 0) {
        top10.push({label: 'Others', size: otherSize});
    }

    const ctx = els.fileChart.getContext('2d');
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: top10.map(d => d.label),
            datasets: [{
                data: top10.map(d => d.size),
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', 
                    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#64748b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#f8fafc' }
                }
            }
        }
    });
}

// View Toggles
els.viewToggles.forEach(btn => {
    btn.addEventListener('click', () => {
        els.viewToggles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.dataset.view;
        if (view === 'tree') {
            els.fileTree.classList.remove('hidden');
            els.chartContainer.classList.add('hidden');
        } else {
            els.fileTree.classList.add('hidden');
            els.chartContainer.classList.remove('hidden');
        }
    });
});

updateLanguage();
