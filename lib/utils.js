/**
 * Formats a byte value into a human-readable string.
 * Source of Truth: lib/utils.js (backend) and public/js/utils.js (frontend) are identical.
 * @param {number} bytes - The number of bytes.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted size string (e.g., "1.5 MB").
 */
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
    formatBytes
};
