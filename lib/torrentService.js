const axios = require('axios');
const parseTorrent = require('parse-torrent');
const health = require('webtorrent-health');
const dns = require('dns').promises;
const ip = require('ip');

/**
 * Validates that a hostname does not resolve to a local or private IP address.
 * @param {string} hostname - The hostname to validate.
 * @throws {Error} If the hostname is invalid or points to a private address.
 */
async function validateEgress(hostname) {
    try {
        const result = await dns.lookup(hostname);
        const address = result.address;
        if (ip.isPrivate(address) || ip.isLoopback(address)) {
            throw new Error(`SSRF Blocked: Private IP detected (${address})`);
        }
    } catch (err) {
        if (err.message.startsWith('SSRF')) throw err;
        throw new Error(`Invalid URL or hostname: ${hostname}`);
    }
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
 * @property {TorrentFile[]} files - List of files.
 */

/**
 * Fetches torrent data from a URL with SSRF protection.
 * @private
 * @param {string} url - The torrent URL.
 * @returns {Promise<Buffer>} The torrent file buffer.
 */
async function _fetchFromUrl(url) {
    const urlObj = new URL(url);
    await validateEgress(urlObj.hostname);

    const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000,
        maxContentLength: 5 * 1024 * 1024,
        maxBodyLength: 5 * 1024 * 1024
    });
    return Buffer.from(response.data);
}

/**
 * Scrapes seeds and peers from trackers.
 * @private
 * @param {Object} parsed - The parsed torrent object.
 * @returns {Promise<{seeds: number, peers: number}>} Health data.
 */
async function _getTorrentHealth(parsed) {
    let timeoutId;
    try {
        const healthPromise = health(parsed);
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Health check timeout')), 15000);
        });
        
        const results = await Promise.race([healthPromise, timeoutPromise]);
        return {
            seeds: results.seeds || 0,
            peers: results.peers || 0
        };
    } catch (err) {
        console.warn('Health check unavailable:', err.message);
        return { seeds: 0, peers: 0 };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Shared logic to process a torrent source (Buffer, URL, or Magnet link).
 * @param {Buffer|string} source - The torrent data source.
 * @param {boolean} [isMagnet=false] - Whether the source is a magnet URI.
 * @param {Object} [options={}] - Optional processing flags.
 * @param {boolean} [options.skipHealth=false] - Skip seeds/peers scraping.
 * @returns {Promise<TorrentMetadata>} The parsed torrent metadata and health data.
 */
async function handleTorrentSource(source, isMagnet = false, options = {}) {
    const sourceIsMagnet = isMagnet || (typeof source === 'string' && source.startsWith('magnet:'));
    let input;

    if (sourceIsMagnet || Buffer.isBuffer(source)) {
        input = source;
    } else {
        input = await _fetchFromUrl(source);
    }

    if (!input || input.length === 0) {
        throw new Error('No torrent data provided');
    }

    const parsed = parseTorrent(input);
    const magnetUri = parseTorrent.toMagnetURI(parsed);

    const healthData = options.skipHealth 
        ? { seeds: 0, peers: 0 } 
        : await _getTorrentHealth(parsed);

    return {
        magnetUri,
        isMagnet: sourceIsMagnet,
        name: parsed.name || 'Unnamed Torrent',
        infoHash: parsed.infoHash, 
        length: parsed.length || 0,
        numFiles: parsed.files ? parsed.files.length : 0,
        seeds: healthData.seeds,
        peers: healthData.peers,
        created: parsed.created ? parsed.created.toISOString() : null,
        createdBy: parsed.createdBy || null,
        comment: parsed.comment || null,
        pieceLength: parsed.pieceLength || null,
        isPrivate: !!parsed.private,
        urlList: parsed.urlList || [],
        source: parsed.source || null,
        trackers: parsed.announce || [],
        files: (parsed.files || []).map(f => ({
            name: f.name || f.path,
            length: f.length
        }))
    };
}

module.exports = {
    handleTorrentSource
};
