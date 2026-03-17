const express = require('express');
const request = require('supertest');
const { apiKeyAuth } = require('../lib/auth');

describe('Auth Middleware', () => {
  let app;
  const originalApiKey = process.env.API_KEY;

  beforeEach(() => {
    app = express();
    app.use(apiKeyAuth);
    app.get('/test', (req, res) => {
      res.status(200).json({ success: true });
    });
    process.env.API_KEY = 'test-api-key';
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  it('should return 200 if valid API key is provided', async () => {
    const response = await request(app)
      .get('/test')
      .set('x-api-key', 'test-api-key');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 401 if API key is missing', async () => {
    const response = await request(app).get('/test');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('API Key missing');
  });

  it('should return 401 if API key is invalid', async () => {
    const response = await request(app)
      .get('/test')
      .set('x-api-key', 'wrong-api-key');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid API Key');
  });

  it('should return 401 if API key length is different', async () => {
    const response = await request(app)
      .get('/test')
      .set('x-api-key', 'short');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid API Key');
  });

  it('should return 401 if API_KEY is not set in environment', async () => {
    delete process.env.API_KEY;
    const response = await request(app)
      .get('/test')
      .set('x-api-key', 'test-api-key');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Security configuration missing');
  });
});
