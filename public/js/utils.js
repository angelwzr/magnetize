/**
 * Formats a byte value into a human-readable string.
 * Source of Truth: lib/utils.js (backend) and public/js/utils.js (frontend) are identical.
 * @param {number} bytes - The number of bytes.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} Formatted size string.
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Mapping of file extensions to their respective categories.
 */
export const FILE_CATEGORIES = {
  'Video': ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'ts', 'm2ts'],
  'Audio': ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a'],
  'Images': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  'Documents': ['pdf', 'epub', 'txt', 'doc', 'docx', 'mobi'],
  'Archives': ['zip', 'rar', '7z', 'tar', 'gz'],
  'Software': ['exe', 'msi', 'dmg', 'iso', 'bin'],
};
