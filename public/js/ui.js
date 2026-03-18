import { formatBytes } from './utils.js';

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
 * @property {TorrentFile[]} files - List of files.
 */

/**
 * Renders the torrent metadata results in the UI.
 * @param {TorrentMetadata} data - The torrent metadata to render.
 */
export function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    const magnetInput = document.getElementById('magnetResult');
    const magnetDisplay = document.getElementById('magnetDisplay');

    magnetInput.value = data.magnetUri;
    magnetDisplay.textContent = data.magnetUri;
    
    // Summary data
    document.getElementById('torrentName').textContent = data.name;
    document.getElementById('infoHash').textContent = data.infoHash;
    document.getElementById('totalSize').textContent = formatBytes(data.length);
    document.getElementById('fileCount').textContent = data.numFiles;
    
    // Health data
    const seedsEl = document.getElementById('seeds');
    const peersEl = document.getElementById('peers');
    seedsEl.textContent = data.seeds;
    peersEl.textContent = data.peers;

    // Update health colors
    seedsEl.className = data.seeds > 0 ? 'text-success' : 'text-muted';
    peersEl.className = data.peers > 0 ? 'text-info' : 'text-muted';

    renderTechnicalDetails(data);
    renderFileList(data.files);
    
    resultsDiv.classList.remove('d-none');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Renders extended technical details.
 * @param {TorrentMetadata} data - The torrent metadata.
 */
function renderTechnicalDetails(data) {
    const trackersList = document.getElementById('trackersList');
    trackersList.innerHTML = '';
    
    if (data.trackers.length === 0) {
        trackersList.innerHTML = '<li class="text-muted italicText">No trackers found</li>';
    } else {
        data.trackers.forEach(tracker => {
            const li = document.createElement('li');
            li.textContent = tracker;
            trackersList.appendChild(li);
        });
    }

    // Extended info fields
    document.getElementById('creationDate').textContent = data.created ? new Date(data.created).toLocaleString() : 'N/A';
    document.getElementById('createdBy').textContent = data.createdBy || 'N/A';
    document.getElementById('comment').textContent = data.comment || 'N/A';
    document.getElementById('isPrivate').textContent = data.isPrivate ? 'Yes' : 'No';
    document.getElementById('pieceSize').textContent = data.pieceLength ? formatBytes(data.pieceLength) : 'N/A';
}

/**
 * Renders the file list table.
 * @param {TorrentFile[]} files - The list of files to render.
 */
function renderFileList(files) {
    const tbody = document.getElementById('fileListBody');
    tbody.innerHTML = '';

    if (!files || files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No file information available</td></tr>';
        return;
    }

    files.forEach(file => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="fileNameText" title="${file.name}">${file.name}</div></td>
            <td class="text-end monospaceText">${formatBytes(file.length)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Copies the magnet link to the clipboard.
 */
export function copyMagnet() {
    const magnetInput = document.getElementById('magnetResult');
    magnetInput.select();
    magnetInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(magnetInput.value);
    
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = 'Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
}

/**
 * Displays an error message in the UI.
 * @param {string} message - The error message to show.
 */
export function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
    
    // Hide results if showing error
    document.getElementById('results').classList.add('d-none');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Resets the UI to its initial state.
 */
export function resetUI() {
    document.getElementById('errorAlert').classList.add('d-none');
    document.getElementById('results').classList.add('d-none');
    document.getElementById('magnetResult').value = '';
}
