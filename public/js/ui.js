import { formatBytes, FILE_CATEGORIES } from './utils.js';
import { isDarkMode } from './theme.js';

/**
 * Displays a temporary status message to the user for 3 seconds.
 * @param {string} msg - The message to display.
 */
export function showStatus(msg) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.add('visible');
  setTimeout(() => {
    statusEl.classList.remove('visible');
  }, 3000);
}

/**
 * Renders the file distribution doughnut chart using grouped categories.
 * Performs side-effects on the DOM (canvas).
 * @param {Array} files - List of file objects with 'name' and 'length'.
 */
function renderDistributionChart(files) {
  const ctx = document.getElementById('distChart').getContext('2d');
  
  if (!files || files.length === 0) {
    const isDark = isDarkMode();
    
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#888888' : '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('File distribution data unavailable for Magnet links', ctx.canvas.width / 2, ctx.canvas.height / 2);
    return;
  }

  const dataMap = {
    'Video': 0, 'Audio': 0, 'Images': 0, 'Documents': 0, 'Archives': 0, 'Software': 0, 'Other': 0
  };

  files.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    let found = false;
    for (const [cat, exts] of Object.entries(FILE_CATEGORIES)) {
      if (exts.includes(ext)) {
        dataMap[cat] += file.length;
        found = true;
        break;
      }
    }
    if (!found) dataMap['Other'] += file.length;
  });

  const labels = Object.keys(dataMap).filter(k => dataMap[k] > 0);
  const values = labels.map(k => dataMap[k]);
  
  const isDark = isDarkMode();

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#6b7280'],
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
        }
      }
    }
  });
}

/**
 * Builds HTML for the primary torrent statistics grid.
 * @param {Object} data - The torrent metadata.
 * @returns {string} HTML string.
 */
function buildStatsGridHtml(data) {
  const isMagnet = data.isMagnet;
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Size</div><div class="stat-value">${isMagnet ? 'Unknown' : formatBytes(data.length)}</div></div>
      <div class="stat-card"><div class="stat-label">Seeds</div><div class="stat-value seeds">${data.seeds || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Peers</div><div class="stat-value">${data.peers || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Files</div><div class="stat-value">${isMagnet ? 'Unknown' : data.numFiles}</div></div>
    </div>
  `;
}

/**
 * Builds HTML for the magnet link actions and disclaimer.
 * @param {string} magnet - The magnet URI.
 * @param {boolean} isMagnet - Whether the input was a raw magnet link.
 * @returns {string} HTML string.
 */
function buildMagnetSectionHtml(magnet, isMagnet) {
  const disclaimerHtml = isMagnet ? `
    <div class="magnet-disclaimer">
      <strong>⚠️ Limited Metadata</strong>
      Raw magnet links only contain an identifier (hash). Full file list, total size, and technical details will only be visible once your torrent client connects to peers and downloads the metadata.
    </div>
  ` : '';

  return `
    ${disclaimerHtml}
    <div class="magnet-section">
      <div class="magnet-actions">
        <button id="copyBtn" class="btn-primary">Copy Magnet Link</button>
        <a href="${magnet}" class="btn-secondary">Open in Client</a>
      </div>
    </div>
  `;
}

/**
 * Builds HTML for the technical metadata table and trackers.
 * @param {Object} data - The torrent metadata.
 * @returns {string} HTML string.
 */
function buildTechnicalDetailsHtml(data) {
  const isMagnet = data.isMagnet;
  const pendingText = '<span style="color: var(--text-muted); font-style: italic;">Awaiting peer metadata...</span>';

  return `
    <div class="file-list-toggle" id="techToggle">
      <span>Technical Details</span>
      <span id="techIcon">↓</span>
    </div>
    <div class="file-list" id="techList" style="display: none; padding: 1rem 1.5rem; font-size: 0.85rem;">
      <table class="tech-table">
        <tr><td>Created</td><td>${data.created ? new Date(data.created).toLocaleString() : (isMagnet ? pendingText : 'N/A')}</td></tr>
        <tr><td>By</td><td>${data.createdBy || (isMagnet ? pendingText : 'N/A')}</td></tr>
        <tr><td>Comment</td><td>${data.comment || (isMagnet ? pendingText : 'N/A')}</td></tr>
        <tr><td>Piece Size</td><td>${data.pieceLength ? formatBytes(data.pieceLength, 0) : (isMagnet ? pendingText : 'N/A')}</td></tr>
        <tr><td>Private</td><td>${data.isPrivate ? 'Yes (DHT Disabled)' : 'No'}</td></tr>
        ${data.source ? `<tr><td>Source</td><td>${data.source}</td></tr>` : ''}
      </table>
      ${data.urlList && data.urlList.length > 0 ? `
        <div style="margin-top: 1.5rem; font-weight: 600; margin-bottom: 0.75rem;">Web Seeds</div>
        <div class="trackers-container" style="margin-bottom: 1rem;">
          <table class="trackers-table">${data.urlList.map((url, i) => `<tr><td>${i+1}</td><td>${url}</td></tr>`).join('')}</table>
        </div>
      ` : ''}
      <div style="margin-top: 1.5rem; font-weight: 600; margin-bottom: 0.75rem;">Trackers</div>
      <div class="trackers-container">
        <table class="trackers-table">
          ${data.trackers && data.trackers.length > 0 ? data.trackers.map((tr, i) => `<tr><td>${i+1}</td><td>${tr}</td></tr>`).join('') : '<tr><td colspan="2">None</td></tr>'}
        </table>
      </div>
    </div>
  `;
}

/**
 * Builds HTML for the scrollable list of files.
 * @param {Object} data - The torrent metadata.
 * @returns {string} HTML string.
 */
function buildFileListHtml(data) {
  const pendingText = '<span style="color: var(--text-muted); font-style: italic;">Awaiting peer metadata...</span>';
  return `
    <div class="file-list-toggle" id="fileListToggle"><span>File Contents</span><span id="toggleIcon">↓</span></div>
    <div class="file-list" id="fileList" style="display: none;">
      ${data.files ? data.files.map(f => `
        <div class="file-item">
          <span class="file-name" title="${f.name}">${f.name}</span>
          <span class="file-size">${formatBytes(f.length)}</span>
        </div>
      `).join('') : `<div class="file-item"><span class="file-name">${pendingText}</span></div>`}
    </div>
  `;
}

/**
 * @typedef {Object} TorrentFile
 * @property {string} name - File name or path.
 * @property {number} length - File size in bytes.
 */

/**
 * @typedef {Object} TorrentMetadata
 * @property {string} magnetUri - Generated magnet link.
 * @property {boolean} isMagnet - Whether the source was a magnet URI.
 * @property {string} name - Torrent name.
 * @property {string} infoHash - Torrent info hash.
 * @property {number} length - Total size in bytes.
 * @property {number} numFiles - Number of files.
 * @property {number} seeds - Number of seeds.
 * @property {number} peers - Number of peers.
 * @property {string|null} created - Creation date ISO string.
 * @property {string|null} createdBy - Client that created the torrent.
 * @property {string|null} comment - Torrent comment.
 * @property {number|null} pieceLength - Size of each piece in bytes.
 * @property {boolean} isPrivate - Private torrent flag.
 * @property {string[]} urlList - List of web seeds.
 * @property {string|null} source - Originating source site.
 * @property {string[]} trackers - List of announce URLs.
 * @property {TorrentFile[]} [files] - List of files.
 */

/**
 * Orchestrates the full dashboard rendering, including stats, chart, and file list.
 * Automatically scrolls the new result into view.
 * Performs side-effects on the DOM.
 * @param {TorrentMetadata} data - Comprehensive metadata object from backend.
 */
export function renderDashboard(data) {
  const resultContainer = document.getElementById('resultContainer');
  if (!resultContainer) return;

  const infoHash = data.infoHash;
  const magnet = data.magnetUri;

  resultContainer.innerHTML = `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2 class="torrent-title">${data.name}</h2>
        <code class="info-hash">${infoHash}</code>
      </div>
      ${buildStatsGridHtml(data)}
      <div style="padding: 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border); height: 220px;">
        <canvas id="distChart"></canvas>
      </div>
      ${buildMagnetSectionHtml(magnet, data.isMagnet)}
      ${buildTechnicalDetailsHtml(data)}
      ${buildFileListHtml(data)}
    </div>
  `;

  renderDistributionChart(data.files);
  initDashboardInteractions(magnet);
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Attaches dynamic event listeners for collapsible sections and action buttons.
 * Performs side-effects on the DOM.
 * @param {string} magnet - The magnet URI for copy interaction.
 */
function initDashboardInteractions(magnet) {
  const setupToggle = (toggleId, listId, iconId) => {
    const toggle = document.getElementById(toggleId);
    const list = document.getElementById(listId);
    const icon = document.getElementById(iconId);
    if (!toggle || !list) return;
    toggle.addEventListener('click', () => {
      const isHidden = list.style.display === 'none';
      list.style.display = isHidden ? 'block' : 'none';
      icon.textContent = isHidden ? '↑' : '↓';
    });
  };

  setupToggle('fileListToggle', 'fileList', 'toggleIcon');
  setupToggle('techToggle', 'techList', 'techIcon');

  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(magnet).then(() => showStatus('Copied!'));
    });
  }
}
