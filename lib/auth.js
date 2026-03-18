const crypto = require('crypto');

/**
 * Middleware to authenticate requests using X-API-KEY header, 
 * Bearer token, or query parameters.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
function apiKeyAuth(req, res, next) {
  // Check for key in: 1. Header, 2. Bearer Token, 3. Query Param
  const apiKey = req.headers['x-api-key'] || 
                 (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
                 req.query.apiKey || 
                 req.query.api_key;

  const expectedKey = process.env.API_KEY ? process.env.API_KEY.trim() : null;

  if (!expectedKey) {
    console.warn('⚠️  Auth Denied: API_KEY is not set in environment.');
    return res.status(401).json({ error: 'Unauthorized: Security configuration missing' });
  }

  if (!apiKey) {
    console.warn(`⚠️  Auth Denied: Missing key for ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized: API Key missing' });
  }

  try {
    const sanitizedApiKey = apiKey.trim();
    const apiKeyBuffer = Buffer.from(sanitizedApiKey);
    const expectedKeyBuffer = Buffer.from(expectedKey);

    if (apiKeyBuffer.length !== expectedKeyBuffer.length) {
      console.warn(`⚠️  Auth Denied: Key length mismatch (Got: ${apiKeyBuffer.length}, Expected: ${expectedKeyBuffer.length})`);
      return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    if (crypto.timingSafeEqual(apiKeyBuffer, expectedKeyBuffer)) {
      next();
    } else {
      console.warn('⚠️  Auth Denied: Content mismatch');
      res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Unauthorized: Authentication error' });
  }
}

module.exports = { apiKeyAuth };
