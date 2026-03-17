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
 * Shared logic to process a torrent source (Buffer, URL, or Magnet link).
 * @param {Buffer|string} source - The torrent data source.
 * @param {boolean} [isMagnet=false] - Whether the source is a magnet URI.
 * @param {Object} [options={}] - Optional processing flags.
 * @returns {Promise<TorrentMetadata>} The parsed torrent metadata and health data.
 */
async function handleTorrentSource(source, isMagnet = false, options = {}) {
    const sourceIsMagnet = isMagnet || (typeof source === 'string' && source.startsWith('magnet:'));
    let buffer;
    if (sourceIsMagnet) {
        buffer = source;
    } else if (Buffer.isBuffer(source)) {
        buffer = source;
    } else {
        const urlObj = new URL(source);
        await validateEgress(urlObj.hostname);

        const response = await axios.get(source, { 
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000,
            maxContentLength: 5 * 1024 * 1024,
            maxBodyLength: 5 * 1024 * 1024
        });
        buffer = Buffer.from(response.data);
    }

    if (!buffer || buffer.length === 0) {
        throw new Error('No torrent data provided');
    }

    const parsed = parseTorrent(buffer);
    const magnetUri = parseTorrent.toMagnetURI(parsed);

    let healthData = { seeds: 0, peers: 0 };
    if (!options.skipHealth) {
        try {
            const healthPromise = health(parsed);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Health check timeout')), 15000)
            );
            
            const results = await Promise.race([healthPromise, timeoutPromise]);
            healthData.seeds = results.seeds || 0;
            healthData.peers = results.peers || 0;
        } catch (hErr) {
            console.warn('Health check unavailable:', hErr.message);
        }
    }

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
