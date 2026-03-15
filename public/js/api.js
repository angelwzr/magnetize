/**
 * Handles API interactions for torrent processing.
 */
const API_BASE = window.location.origin + '/api/torrent';
let currentAbortController = null;

/**
 * Fetches torrent metadata from a file.
 * @param {File} file - The torrent file.
 * @returns {Promise<Object>} The parsed metadata.
 */
export async function fetchTorrentFromFile(file) {
  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();
  
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/file`, { 
    method: 'POST', 
    body: formData,
    signal: currentAbortController.signal
  });
  
  if (!res.ok) {
    let errorMsg = `Server error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) { /* use default message */ }
    throw new Error(errorMsg);
  }
  return res.json();
}

/**
 * Fetches torrent metadata from a URL.
 * @param {string} url - The torrent URL or magnet link.
 * @returns {Promise<Object>} The parsed metadata.
 */
export async function fetchTorrentFromUrl(url) {
  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();
  
  const res = await fetch(`${API_BASE}/url`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal: currentAbortController.signal
  });
  
  if (!res.ok) {
    let errorMsg = `Server error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) { /* use default message */ }
    throw new Error(errorMsg);
  }
  return res.json();
}
