// Simple Express server for Magnetize - Torrent/Magnet Link Extractor
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const helmet = require('helmet');
const torrentService = require('./lib/torrentService');
const { apiKeyAuth, getApiKey } = require('./lib/auth');
const { globalLimiter, machineLimiter } = require('./lib/limiter');
const McpServerManager = require('./lib/mcpServer');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize MCP Server Manager
const mcpManager = new McpServerManager();

app.set('trust proxy', 1);

app.use(globalLimiter);
app.use(helmet({
    referrerPolicy: { policy: 'no-referrer' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
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

/**
 * @api {get} /health Health check endpoint for Docker and monitoring.
 */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

/**
 * MCP SSE Endpoints (Secured)
 */
app.get('/mcp', machineLimiter, apiKeyAuth, async (req, res) => {
    const apiKey = getApiKey(req);
    // Standardize on header-based auth, but maintain SSE-compatible messages endpoint
    const messagesEndpoint = `/mcp/messages`;
    await mcpManager.handleSseConnection(messagesEndpoint, res);
});

app.post('/mcp/messages', machineLimiter, apiKeyAuth, async (req, res) => {
    await mcpManager.handlePostMessage(req, res);
});

app.use(express.static(path.join(__dirname, 'public')));

// Apply machine limiter to all API routes
app.use('/api', machineLimiter);

/**
 * API (For Web UI and Programmatic Access)
 */

/**
 * @api {post} /api/torrent/file Parse uploaded .torrent file.
 * Publicly accessible via UI.
 */
app.post('/api/torrent/file', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const result = await torrentService.handleTorrentSource(req.files.file.data);
        res.status(200).json(result);
    } catch (err) {
        console.error('File API Error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * @api {get} /api/torrent/url Parse torrent URL or Magnet URI.
 * Secured - requires API Key.
 */
app.get('/api/torrent/url', apiKeyAuth, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }
        const result = await torrentService.handleTorrentSource(url, url.startsWith('magnet:'));
        res.status(200).json(result);
    } catch (err) {
        console.error('URL API Error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * @api {get} /api/convert Convert torrent URL or Magnet URI to simplified magnet object.
 * Secured - requires API Key. Skips health check.
 */
app.get('/api/convert', apiKeyAuth, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }
        const result = await torrentService.handleTorrentSource(url, url.startsWith('magnet:'), { skipHealth: true });
        res.status(200).json({
            magnet: result.magnetUri,
            infoHash: result.infoHash,
            name: result.name
        });
    } catch (err) {
        console.error('Convert API Error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * @api {get} /api/inspect Inspect torrent URL or Magnet URI for full metadata.
 * Secured - requires API Key. Performs health check.
 */
app.get('/api/inspect', apiKeyAuth, async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }
        const result = await torrentService.handleTorrentSource(url, url.startsWith('magnet:'), { skipHealth: false });
        res.status(200).json(result);
    } catch (err) {
        console.error('Inspect API Error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Starts the Express server.
 */
function startServer() {
    if (!process.env.API_KEY) {
        process.env.API_KEY = require('crypto').randomBytes(16).toString('hex');
        console.log('--------------------------------------------------');
        console.log('⚠️  SECURITY: No API_KEY set in environment.');
        console.log(`🔑  Generated Random API Key: ${process.env.API_KEY}`);
        console.log('--------------------------------------------------');
    }

    const server = app.listen(PORT, () => {
        console.log(`🧲 Magnetize Server running on http://localhost:${PORT}`);
    });
    server.timeout = 30000;
}

// Start the server if this script is run directly
if (require.main === module) {
    startServer();
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

module.exports = { app };
