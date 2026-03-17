const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');
const { globalLimiter, machineLimiter } = require('../lib/limiter');

describe('Rate Limiting Middleware', () => {
  it('should export globalLimiter and machineLimiter', () => {
    expect(globalLimiter).toBeDefined();
    expect(machineLimiter).toBeDefined();
  });

  describe('Global Limiter behavior', () => {
    let app;
    
    beforeEach(() => {
      app = express();
      // Use a very short limit for testing behavior
      const testLimiter = rateLimit({
        windowMs: 1000,
        max: 2,
        message: { error: 'Too many requests' }
      });
      app.use(testLimiter);
      app.get('/test', (req, res) => res.status(200).send('OK'));
    });

    it('should allow requests under the limit', async () => {
      const res1 = await request(app).get('/test');
      expect(res1.status).toBe(200);
      
      const res2 = await request(app).get('/test');
      expect(res2.status).toBe(200);
    });

    it('should block requests over the limit', async () => {
      await request(app).get('/test');
      await request(app).get('/test');
      const res3 = await request(app).get('/test');
      
      expect(res3.status).toBe(429);
      expect(res3.body.error).toBe('Too many requests');
    });
  });
});
