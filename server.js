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

// Helper to wrap async routes for centralized error handling
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

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
app.get('/mcp', machineLimiter, apiKeyAuth, asyncHandler(async (req, res) => {
    const messagesEndpoint = `/mcp/messages`;
    await mcpManager.handleSseConnection(messagesEndpoint, res);
}));

app.post('/mcp/messages', machineLimiter, apiKeyAuth, asyncHandler(async (req, res) => {
    await mcpManager.handlePostMessage(req, res);
}));

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
app.post('/api/torrent/file', asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await torrentService.handleTorrentSource(req.files.file.data);
    res.status(200).json(result);
}));

/**
 * @api {get} /api/torrent/url Parse torrent URL or Magnet URI.
 * Secured - requires API Key.
 */
app.get('/api/torrent/url', apiKeyAuth, asyncHandler(async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }
    const result = await torrentService.handleTorrentSource(url, url.startsWith('magnet:'));
    res.status(200).json(result);
}));

/**
 * @api {get} /api/convert Convert torrent URL or Magnet URI to simplified magnet object.
 * Secured - requires API Key. Skips health check.
 */
app.get('/api/convert', apiKeyAuth, asyncHandler(async (req, res) => {
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
}));

/**
 * @api {get} /api/inspect Inspect torrent URL or Magnet URI for full metadata.
 * Secured - requires API Key. Performs health check.
 */
app.get('/api/inspect', apiKeyAuth, asyncHandler(async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }
    const result = await torrentService.handleTorrentSource(url, url.startsWith('magnet:'), { skipHealth: false });
    res.status(200).json(result);
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 400;
    const message = err.message || 'An unexpected error occurred';
    
    // Domain-specific error classification (internal only, for logging)
    console.error(`[API Error] ${req.method} ${req.path}:`, message);
    
    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString()
    });
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
