// Simple Express server for Magnetize - Torrent/Magnet Link Extractor
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const helmet = require('helmet');
const torrentService = require('./lib/torrentService');
const { formatBytes } = require('./lib/utils');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

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

app.use(express.static(path.join(__dirname, 'public')));

/**
 * @api {post} /api/torrent/file Parse uploaded .torrent file
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
 * @api {post} /api/torrent/url Parse torrent URL or Magnet URI
 */
app.post('/api/torrent/url', async (req, res) => {
    try {
        const url = req.body.url || req.query.url;
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Starts the Express server.
 */
function startServer() {
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

module.exports = { app, formatBytes };
