const crypto = require('crypto');

/**
 * Extracts the API key from the request headers.
 * Supports X-API-KEY and Authorization: Bearer <token>.
 * @param {import('express').Request} req - Express request object.
 * @returns {string|null} The extracted API key or null.
 */
function getApiKey(req) {
  return req.headers['x-api-key'] || 
         (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null);
}

/**
 * Middleware to authenticate requests using X-API-KEY or Bearer token headers.
 * Query parameter authentication is explicitly disabled for security.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
function apiKeyAuth(req, res, next) {
  const apiKey = getApiKey(req);
  const expectedKey = process.env.API_KEY ? process.env.API_KEY.trim() : null;

  if (!expectedKey) {
    console.warn('⚠️  Auth Configuration Error: API_KEY missing');
    return res.status(401).json({ error: 'Unauthorized: Security configuration missing' });
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: API Key missing' });
  }

  try {
    const sanitizedApiKey = apiKey.trim();
    const apiKeyBuffer = Buffer.from(sanitizedApiKey);
    const expectedKeyBuffer = Buffer.from(expectedKey);

    // Generic response for any mismatch to prevent side-channel leaks
    if (apiKeyBuffer.length !== expectedKeyBuffer.length) {
      console.warn('⚠️  Auth Denied: Invalid key provided');
      return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    if (crypto.timingSafeEqual(apiKeyBuffer, expectedKeyBuffer)) {
      next();
    } else {
      console.warn('⚠️  Auth Denied: Invalid key provided');
      res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
  } catch (err) {
    console.error('Authentication processing error');
    res.status(401).json({ error: 'Unauthorized: Authentication error' });
  }
}

module.exports = { apiKeyAuth, getApiKey };
