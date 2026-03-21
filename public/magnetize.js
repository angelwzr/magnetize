// Magnetize - Minimal Client Script
'use strict';

// Prevent browser from auto-launching magnet links
window.addEventListener('beforeunload', (e) => {
  // Cancel any pending navigations
});

const API_BASE = window.location.origin + '/api/torrent';

let selectedFile = null;
let currentTab = 'file';
let urlDebounceTimer = null;

// Global error handler for uncaught errors
window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.error('Global error:', { msg, url, lineNo, columnNo, error });
  return false;
};

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const urlInput = document.getElementById('urlInput');
  const resultContainer = document.getElementById('resultContainer');
  const statusEl = document.getElementById('status');
  const themeSwitcher = document.getElementById('themeSwitcher');
  
  // --- Theme Management ---
  const applyTheme = (theme) => {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme !== 'system') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    // Update UI
    themeSwitcher.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    localStorage.setItem('magnetize-theme', theme);
  };

  const savedTheme = localStorage.getItem('magnetize-theme') || 'system';
  applyTheme(savedTheme);

  themeSwitcher.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) applyTheme(btn.dataset.theme);
  });

  // --- Tab Management ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (currentTab === tab) return; // No change
      
      currentTab = tab;
      
      // Clear previous state when switching
      clearSelection();
      urlInput.value = '';
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.getElementById('file-input').classList.toggle('active', tab === 'file');
      document.getElementById('url-input').classList.toggle('active', tab === 'url');
    });
  });

  // --- Status UI ---
  function showStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.add('visible');
    setTimeout(() => {
      statusEl.classList.remove('visible');
    }, 3000);
  }

  // --- File Logic ---
  function handleFileSelect(file) {
    if (!file) return;
    
    if (!file.name.endsWith('.torrent') && !file.name.endsWith('.magnet')) {
      showStatus('Invalid file type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showStatus('File too large (Max 5MB)');
      return;
    }

    selectedFile = file;
    const selectionBox = document.getElementById('selectionBox');
    if (selectionBox) {
      selectionBox.innerHTML = `
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📄 ${file.name}</span>
        <button type="button" class="btn-clear" id="clearBtn">Clear</button>
      `;
      selectionBox.style.display = 'flex';
      
      document.getElementById('clearBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelection();
      });
    }
    
    // AUTO PREVIEW
    processTorrent();
  }

  function clearSelection() {
    selectedFile = null;
    fileInput.value = '';
    const selectionBox = document.getElementById('selectionBox');
    if (selectionBox) selectionBox.style.display = 'none';
    resultContainer.innerHTML = '';
  }

  // Drag & Drop
  const fileDropZone = document.getElementById('fileDropZone');
  if (fileDropZone) {
    fileDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropZone.style.borderColor = 'var(--text-muted)';
    });
    fileDropZone.addEventListener('dragleave', () => {
      fileDropZone.style.borderColor = 'var(--border)';
    });
    fileDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropZone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
    fileDropZone.addEventListener('click', () => fileInput.click());
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
  });

  // --- URL Logic ---
  const urlGoBtn = document.getElementById('urlGoBtn');
  
  const handleUrlGo = () => {
    const url = urlInput.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('magnet:?xt='))) {
      processTorrent();
    } else if (url) {
      showStatus('Please enter a valid HTTP/HTTPS URL or Magnet link');
    }
  };

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlGo();
    }
  });

  urlGoBtn.addEventListener('click', handleUrlGo);

  // Debounced Auto-Preview
  urlInput.addEventListener('input', () => {
    clearTimeout(urlDebounceTimer);
    const url = urlInput.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('magnet:?xt='))) {
      urlDebounceTimer = setTimeout(processTorrent, 1200);
    }
  });

  // --- Processing ---
  async function processTorrent() {
    try {
      let data;
      if (currentTab === 'file') {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch(API_BASE, { method: 'POST', body: formData });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Server error: ${res.status} - ${errText}`);
        }
        data = await res.json();
      } else {
        const url = urlInput.value.trim();
        if (!url) return;
        const res = await fetch(`${API_BASE}?url=${encodeURIComponent(url)}`, { method: 'POST' });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Server error: ${res.status} - ${errText}`);
        }
        data = await res.json();
      }
      
      console.log('API Response:', data);
      displayResults(data);
    } catch (err) {
      console.error('processTorrent error:', err);
      showStatus(err.message);
    }
  }

  function renderDistributionChart(files) {
    const ctx = document.getElementById('distChart').getContext('2d');
    
    // If no files (Magnet link), show placeholder
    if (!files || files.length === 0) {
      const isDark = document.body.classList.contains('theme-dark') || 
                     (!document.body.classList.contains('theme-light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = isDark ? '#888888' : '#6b7280';
      ctx.textAlign = 'center';
      ctx.fillText('File distribution data unavailable for Magnet links', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const categories = {
      'Video': ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'ts', 'm2ts'],
      'Audio': ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a'],
      'Images': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      'Documents': ['pdf', 'epub', 'txt', 'doc', 'docx', 'mobi'],
      'Archives': ['zip', 'rar', '7z', 'tar', 'gz'],
      'Software': ['exe', 'msi', 'dmg', 'iso', 'bin'],
    };

    const data = {
      'Video': 0, 'Audio': 0, 'Images': 0, 'Documents': 0, 'Archives': 0, 'Software': 0, 'Other': 0
    };

    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let found = false;
      for (const [cat, exts] of Object.entries(categories)) {
        if (exts.includes(ext)) {
          data[cat] += file.length;
          found = true;
          break;
        }
      }
      if (!found) data['Other'] += file.length;
    });

    const labels = Object.keys(data).filter(k => data[k] > 0);
    const values = labels.map(k => data[k]);
    
    const isDark = document.body.classList.contains('theme-dark') || 
                   (!document.body.classList.contains('theme-light') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#6b7280'
          ],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: isDark ? '#888888' : '#6b7280',
              font: { family: 'Inter', size: 12 },
              padding: 20,
              usePointStyle: true,
            }
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const val = item.raw;
                const total = values.reduce((a, b) => a + b, 0);
                const perc = ((val / total) * 100).toFixed(1);
                return ` ${item.label}: ${perc}%`;
              }
            }
          }
        }
      }
    });
  }

  function displayResults(data) {
    const infoHash = data.info_hash || data.infoHash;
    const magnet = data.magnetUri;
    const isMagnet = data.isMagnet;

    const disclaimerHtml = isMagnet ? `
      <div class="magnet-disclaimer">
        <strong>⚠️ Limited Metadata</strong>
        Raw magnet links only contain an identifier (hash). Full file list, total size, and technical details will only be visible once your torrent client connects to peers and downloads the metadata.
      </div>
    ` : '';

    const pendingText = '<span style="color: var(--text-muted); font-style: italic;">Awaiting peer metadata...</span>';

    // Technical Details HTML
    const formatPieceSize = (bytes) => {
      if (!bytes) return isMagnet ? pendingText : 'N/A';
      const k = 1024;
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(0) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const techHtml = `
      <div class="file-list-toggle" id="techToggle">
        <span>Technical Details</span>
        <span id="techIcon">↓</span>
      </div>
      <div class="file-list" id="techList" style="display: none; padding: 1rem 1.5rem; font-size: 0.85rem;">
        <table class="tech-table">
          <tr><td>Created</td><td>${data.created ? new Date(data.created).toLocaleString() : (isMagnet ? pendingText : 'N/A')}</td></tr>
          <tr><td>By</td><td>${data.createdBy || (isMagnet ? pendingText : 'N/A')}</td></tr>
          <tr><td>Comment</td><td>${data.comment || (isMagnet ? pendingText : 'N/A')}</td></tr>
          <tr><td>Piece Size</td><td>${formatPieceSize(data.pieceLength)}</td></tr>
          <tr><td>Private</td><td>${data.isPrivate ? 'Yes (DHT Disabled)' : 'No'}</td></tr>
          ${data.source ? `<tr><td>Source</td><td>${data.source}</td></tr>` : ''}
        </table>
        
        ${data.urlList && data.urlList.length > 0 ? `
          <div style="margin-top: 1.5rem; font-weight: 600; margin-bottom: 0.75rem;">Web Seeds</div>
          <div class="trackers-container" style="margin-bottom: 1rem;">
            <table class="trackers-table">
              ${data.urlList.map((url, i) => `<tr><td>${i+1}</td><td>${url}</td></tr>`).join('')}
            </table>
          </div>
        ` : ''}

        <div style="margin-top: 1.5rem; font-weight: 600; margin-bottom: 0.75rem;">Trackers</div>
        <div class="trackers-container">
          <table class="trackers-table">
            ${data.trackers && data.trackers.length > 0 ? data.trackers.map((tr, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${tr}</td>
              </tr>
            `).join('') : '<tr><td colspan="2">None</td></tr>'}
          </table>
        </div>
      </div>
    `;

    resultContainer.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <h2 class="torrent-title">${data.name}</h2>
          <code class="info-hash">${infoHash}</code>
          ${disclaimerHtml}
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Size</div>
            <div class="stat-value">${isMagnet ? 'Unknown' : data.size}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Seeds</div>
            <div class="stat-value seeds">${data.seeds || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Peers</div>
            <div class="stat-value">${data.peers || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Files</div>
            <div class="stat-value">${isMagnet ? 'Unknown' : data.num_files}</div>
          </div>
        </div>

        <div style="padding: 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border); height: 220px;">
          <canvas id="distChart"></canvas>
        </div>

        <div class="magnet-section">
          <div class="magnet-actions">
            <button id="copyBtn" class="btn-primary">Copy Magnet Link</button>
            <button id="openClientBtn" class="btn-secondary">Open in Client</button>
          </div>
          <p class="magnet-hint">Requires a torrent client installed</p>
        </div>

        ${techHtml}

        <div class="file-list-toggle" id="fileListToggle">
          <span>File Contents</span>
          <span id="toggleIcon">↓</span>
        </div>
        <div class="file-list" id="fileList" style="display: none;">
          ${data.files ? data.files.map(f => `
            <div class="file-item">
              <span class="file-name" title="${f.name}">${f.name}</span>
              <span class="file-size">${f.size}</span>
            </div>
          `).join('') : `<div class="file-item"><span class="file-name">${pendingText}</span></div>`}
        </div>
      </div>
    `;

    renderDistributionChart(data.files);

    // Collapsible Logic
    const setupToggle = (toggleId, listId, iconId) => {
      const toggle = document.getElementById(toggleId);
      const list = document.getElementById(listId);
      const icon = document.getElementById(iconId);
      toggle.addEventListener('click', () => {
        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'block' : 'none';
        icon.textContent = isHidden ? '↑' : '↓';
      });
    };

    setupToggle('fileListToggle', 'fileList', 'toggleIcon');
    setupToggle('techToggle', 'techList', 'techIcon');

    document.getElementById('copyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(magnet).then(() => showStatus('Copied!'));
    });

    // Handle "Open in Client" - handle case when no torrent client is installed
    const openClientBtn = document.getElementById('openClientBtn');
    if (openClientBtn) {
      openClientBtn.addEventListener('click', () => {
        const success = window.open(magnet);
        if (!success || success === null || success === '') {
          showStatus('No torrent client installed');
        }
      });
    }

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
