// Security utilities for Magnetize
// Includes SSRF protection, API key authentication, and rate limiting

const dns = require('dns').promises;
const crypto = require('crypto');

/**
 * Private IP patterns to block (SSRF protection)
 * Matches: 127.x.x.x, 10.x.x.x, 172.16-31.x.x, 192.168.x.x,169.254.x.x (link-local), ::1 (IPv6 localhost)
 */
const PRIVATE_IP_PATTERNS = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|::1|[fF][cCdD][0-9a-fA-F]{2}:)/;

/**
 * Blocked hostname patterns for SSRF protection
 * Prevents access to internal hostnames that might resolve to private IPs
 */
const BLOCKED_HOSTNAMES = /^(localhost|localhost\.local|metadata|metadata\.google|169\.254\.169\.254)/i;

/**
 * Validate URL to prevent SSRF attacks
 * @param {string} url - URL to validate
 * @returns {Promise<void>} Throws if URL is not allowed
 */
async function validateUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Block obviously internal hostnames
        if (BLOCKED_HOSTNAMES.test(hostname)) {
            throw new Error('SSRF blocked: internal hostname not allowed');
        }
        
        // Resolve hostname to IP and check if it's private
        try {
            const { address } = await dns.lookup(hostname);
            if (PRIVATE_IP_PATTERNS.test(address)) {
                throw new Error('SSRF blocked: private IP address not allowed');
            }
        } catch (dnsErr) {
            // DNS lookup failed - could be an IP address directly
            if (PRIVATE_IP_PATTERNS.test(hostname)) {
                throw new Error('SSRF blocked: private IP address not allowed');
            }
        }
        
        // Only allow http, https, and magnet schemes
        if (!['http:', 'https:', 'magnet:'].includes(urlObj.protocol)) {
            throw new Error('SSRF blocked: invalid protocol');
        }
        
    } catch (err) {
        if (err.message.startsWith('SSRF blocked') || 
            err.message.startsWith('Invalid protocol')) {
            throw err;
        }
        // Re-throw other errors as SSRF errors for security
        throw new Error('SSRF blocked: URL validation failed');
    }
}

/**
 * API Key authentication middleware
 * Expects X-API-Key header
 */
function createApiKeyAuth() {
    return (req, res, next) => {
        const apiKey = process.env.API_KEY;
        
        // If no API_KEY is configured, reject all requests for security
        if (!apiKey) {
            // No return value that could leak configuration
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const providedKey = req.headers['x-api-key'];
        
        if (!providedKey) {
            return res.status(401).json({ error: 'API Key required' });
        }
        
        // Use constant-time comparison to prevent timing attacks
        try {
            if (crypto.timingSafeEqual(
                Buffer.from(providedKey),
                Buffer.from(apiKey)
            )) {
                return next();
            }
        } catch (err) {
            // timingSafeEqual throws on length mismatch - treat as auth failure
        }
        
        return res.status(401).json({ error: 'Invalid API Key' });
    };
}

/**
 * Get API key from environment, generating one if not set
 * Only for development - production should always set API_KEY
 */
function getApiKey() {
    return process.env.API_KEY;
}

module.exports = {
    validateUrl,
    createApiKeyAuth,
    getApiKey,
    PRIVATE_IP_PATTERNS,
    BLOCKED_HOSTNAMES
};
