// Simple Express server for Magnetize - Torrent/Magnet Link Extractor
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const parseTorrent = require('parse-torrent');
const axios = require('axios');
const path = require('path');
const health = require('webtorrent-health');
const helmet = require('helmet');
const { getAxiosConfig, isProxyConfigured } = require('./src/utils/proxy');
const { validateUrl, createApiKeyAuth, getApiKey } = require('./src/utils/security');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Feature flags - enable/disable via .env
const ENABLE_API = process.env.ENABLE_API !== 'false'; // Default: true

// Generate random API key if not set but API is enabled
if (!process.env.API_KEY && ENABLE_API) {
    const crypto = require('crypto');
    process.env.API_KEY = crypto.randomBytes(32).toString('hex');
}

// Reverse Proxy Support
app.set('trust proxy', 1);

// Privacy & Security Middleware
app.use(helmet({
    referrerPolicy: { policy: 'no-referrer' }, // Do not send referrer to trackers/remote hosts
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow our own scripts
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"], // Block all external API/source map calls
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size too large. Torrent files should be under 5MB."
}));

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes (only if API is enabled)
if (ENABLE_API) {
    app.use('/api', globalLimiter);
}

// Health Check Endpoint
app.get('/health', (req, res) => {
    const proxyStatus = isProxyConfigured();
    res.status(200).json({ 
        status: 'OK',
        proxy: proxyStatus ? 'configured' : 'not configured'
    });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Format size function
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// API endpoint for torrent parsing (public for web UI) - only if enabled
if (ENABLE_API) {
    app.post('/api/torrent', async (req, res) => {
    try {
        let buffer;
        
        if (req.body && req.body.data) {
            // Data was sent in the request body (from file upload as base64)
            buffer = Buffer.from(req.body.data, 'base64');
        } else if (req.files && req.files.file) {
            // File uploaded via multipart form data (the client uses 'file' name)
            buffer = req.files.file.data;
        } else if (req.query.url) {
            const url = req.query.url;
            if (url.startsWith('magnet:')) {
                // Parse magnet link directly
                buffer = url;
            } else {
                // SSRF protection: validate URL before fetching
                await validateUrl(url);
                // Fetch from URL with proxy support and generic User-Agent
                const response = await axios.get(url, {  
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    ...getAxiosConfig(url)
                });
                buffer = Buffer.from(response.data);
            }
        }

        if (!buffer || buffer.length === 0) {
            return res.status(400).json({ error: 'No torrent data provided' });
        }

        // Parse the torrent file using parse-torrent
        const parsed = parseTorrent(buffer);
        
        // Generate magnet URI
        const magnetUri = parseTorrent.toMagnetURI(parsed);

        // Fetch health info (seeds/peers) with a timeout
        let healthData = { seeds: 0, peers: 0 };
        try {
            // Wrap health check in a promise that catches all errors including WebRTC
            const healthResult = await new Promise((resolve) => {
                const timeout = setTimeout(() => resolve({ seeds: 0, peers: 0 }), 15000);
                
                health(parsed).then((results) => {
                    clearTimeout(timeout);
                    resolve({ seeds: results.seeds || 0, peers: results.peers || 0 });
                }).catch(() => {
                    clearTimeout(timeout);
                    resolve({ seeds: 0, peers: 0 });
                });
            });
            
            healthData = healthResult;
        } catch (hErr) {
            // Log generic error, not user data
            console.warn('Health check unavailable');
        }

        // Return result as JSON (matching frontend expectations)
        res.status(200).json({
            magnetUri,
            isMagnet: typeof buffer === 'string' && buffer.startsWith('magnet:'),
            name: parsed.name || 'Unnamed Torrent',
            info_hash: parsed.infoHash, 
            size: formatBytes(parsed.length),
            num_files: parsed.files ? parsed.files.length : 0,
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
                size: formatBytes(f.length),
                length: f.length // Raw bytes for charts
            }))
        });

    } catch (err) {
        // Generic error message - don't expose internal details
        console.error('[API Error]:', err.message);
        res.status(400).json({ error: 'Failed to parse torrent' });
    }
});
} // End of ENABLE_API

// Fallback for API when disabled - return proper error instead of 404
if (!ENABLE_API) {
    app.post('/api/torrent', (req, res) => {
        res.status(503).json({ error: 'API is disabled. Set ENABLE_API=true to enable.' });
    });
}

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
    const apiKeyWasGenerated = !process.env.API_KEY && ENABLE_API;
    const protocol = 'http';
    const baseUrl = `${protocol}://localhost:${PORT}`;
    
    console.log('--------------------------------------------------');
    console.log(`🧲 Magnetize Server running on ${baseUrl}`);
    console.log('--------------------------------------------------');
    
    // Show enabled features
    if (ENABLE_API) {
        console.log(`📡  API: ${baseUrl}/api/torrent`);
    } else {
        console.log('📡  API: disabled (set ENABLE_API=true to enable)');
    }
    
    // Show API key info
    if (ENABLE_API) {
        console.log('--------------------------------------------------');
        console.log('🔑  API Key:');
        console.log(`    ${process.env.API_KEY}`);
        if (apiKeyWasGenerated) {
            console.log('💡  Add to .env to persist: API_KEY=your_key_here');
        }
        console.log('--------------------------------------------------');
    }
});

// Increase timeout for long-running health checks
server.timeout = 30000;

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
    // Ignore WebRTC errors from webtorrent-health (environment limitation)
    if (reason && reason.code === 'ERR_WEBRTC_SUPPORT') {
        console.warn('WebRTC not available in this environment - health checks disabled');
        return;
    }
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    // Ignore WebRTC errors from webtorrent-health (environment limitation)
    if (err && err.code === 'ERR_WEBRTC_SUPPORT') {
        console.warn('WebRTC not available in this environment - health checks disabled');
        return;
    }
    console.error('Uncaught Exception thrown:', err);
});

module.exports = app;
