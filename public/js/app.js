import { initTheme } from './theme.js';
import { fetchTorrentFromFile, fetchTorrentFromUrl } from './api.js';
import { renderDashboard, showStatus } from './ui.js';

let selectedFile = null;
let currentTab = 'file';
let urlDebounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const urlInput = document.getElementById('urlInput');
  const resultContainer = document.getElementById('resultContainer');
  
  initTheme();

  // --- Tab Management ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (currentTab === tab) return;
      
      currentTab = tab;
      clearSelection();
      urlInput.value = '';
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.getElementById('file-input').classList.toggle('active', tab === 'file');
      document.getElementById('url-input').classList.toggle('active', tab === 'url');
    });
  });

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
      selectionBox.querySelector('#clearBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelection();
      });
    }
    processTorrent();
  }

  function clearSelection() {
    selectedFile = null;
    fileInput.value = '';
    const selectionBox = document.getElementById('selectionBox');
    if (selectionBox) selectionBox.style.display = 'none';
    resultContainer.innerHTML = '';
  }

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
        data = await fetchTorrentFromFile(selectedFile);
      } else {
        const url = urlInput.value.trim();
        if (!url) return;
        data = await fetchTorrentFromUrl(url);
      }
      renderDashboard(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      showStatus(err.message);
    }
  }
});
