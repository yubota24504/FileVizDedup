const translations = {
    en: {
        scanBtn: "Scan",
        scanTitle: "Directory Scanner",
        pathPlaceholder: "Enter path (e.g., F:/)",
        loading: "Scanning...",
        vizTitle: "File Visualization",
        dedupTitle: "Duplicates & Improvements",
        checkDupBtn: "Check Duplicates",
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
        dedupEmpty: "まだ重複チェックを行っていません。",
        size: "サイズ",
        files: "ファイル",
        wastedSpace: "無駄なスペースの可能性",
        suggestion: "改善案: これらのファイルを確認し、不要なコピーを削除してください。"
    }
};

let currentLang = 'en';
let fileTreeData = null;

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
    dedupContent: document.getElementById('dedup-content'),
    dedupEmpty: document.getElementById('dedup-empty'),
    scanTitle: document.getElementById('scan-title'),
    vizTitle: document.getElementById('viz-title'),
    dedupTitle: document.getElementById('dedup-title'),
    checkDupText: document.getElementById('check-dup-text'),
    dedupEmptyText: document.getElementById('dedup-empty-text'),
    scanBtnText: document.getElementById('scan-btn-text'),
    chartContainer: document.getElementById('chart-container'),
    fileChart: document.getElementById('file-chart'),
    viewToggles: document.querySelectorAll('.view-toggles button')
};

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
    els.dedupEmptyText.textContent = t.dedupEmpty;
}

// File Scanning
els.scanBtn.addEventListener('click', async () => {
    const path = els.pathInput.value;
    if (!path) return;

    setLoading(true);
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

// Duplicates
els.checkDupBtn.addEventListener('click', async () => {
    const path = els.pathInput.value;
    if (!path) return;

    setLoading(true);
    try {
        const res = await fetch('/api/duplicates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        
        if (!res.ok) throw new Error('Duplicate check failed');
        
        const duplicates = await res.json();
        renderDuplicates(duplicates);
    } catch (e) {
        alert('Error checking duplicates: ' + e.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        els.loading.classList.remove('hidden');
        els.scanBtn.disabled = true;
    } else {
        els.loading.classList.add('hidden');
        els.scanBtn.disabled = false;
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
            if (childrenContainer.classList.contains('hidden')) {
                icon.className = 'fa-regular fa-folder';
            } else {
                icon.className = 'fa-regular fa-folder-open';
            }
            e.stopPropagation();
        });

        div.appendChild(header);
        div.appendChild(childrenContainer);

        // Lazy load children only when expanded? No, data is already here.
        // But for performance, maybe render only directories first? 
        // Let's render everything but maybe limit depth if it's too huge.
        // For now, simple recursion.
        node.children.forEach(child => {
            childrenContainer.appendChild(createTreeNode(child));
        });
    } else {
        div.innerHTML = `<div class="file-item"><i class="fa-regular fa-file"></i> ${node.name} <span class="size-badge">${formatSize(node.size)}</span></div>`;
    }
    return div;
}

function renderDuplicates(duplicates) {
    els.dedupContent.innerHTML = '';
    const t = translations[currentLang];

    if (duplicates.length === 0) {
        els.dedupContent.innerHTML = `<div class="empty-state"><p>${t.dedupEmpty}</p></div>`;
        return;
    }

    duplicates.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'dup-group glass-panel';
        
        const wasted = group.size * (group.paths.length - 1);
        
        groupDiv.innerHTML = `
            <div class="dup-header">
                <span>${t.wastedSpace}: ${formatSize(wasted)}</span>
                <span>${group.paths.length} ${t.files} (${formatSize(group.size)} each)</span>
            </div>
            <div class="dup-paths">
                ${group.paths.map(p => `<div class="dup-path"><i class="fa-solid fa-turn-up"></i> ${p}</div>`).join('')}
            </div>
            <div class="dup-warning">
                <i class="fa-solid fa-lightbulb"></i> ${t.suggestion}
            </div>
        `;
        els.dedupContent.appendChild(groupDiv);
    });
}

// Chart Visualization
let myChart = null;

function renderChart(data) {
    if (typeof Chart === 'undefined') {
        // Chart.js is not available (offline). Show a friendly placeholder instead of throwing.
        if (myChart) {
            try { myChart.destroy(); } catch (e) { /* ignore */ }
            myChart = null;
        }
        els.chartContainer.innerHTML = '<div class="empty-state">Chart visualization unavailable (offline).</div>';
        return;
    }

    if (myChart) myChart.destroy();

    // Flatten top level dirs for chart
    const labels = data.children.map(c => c.name);
    const params = data.children.map(c => c.size);
    
    // Sort and take top 10
    const indices = Array.from(params.keys()).sort((a,b) => params[b] - params[a]).slice(0, 10);
    const sortedLabels = indices.map(i => labels[i]);
    const sortedData = indices.map(i => params[i]);

    const ctx = els.fileChart.getContext('2d');
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedLabels,
            datasets: [{
                data: sortedData,
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', 
                    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#64748b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
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
