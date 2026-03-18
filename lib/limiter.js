const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter: 100 requests per 15 minutes.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Machine interface limiter: 20 requests per 1 minute.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const machineLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  machineLimiter
};
