const request = require('supertest');
const { app } = require('../server');
const torrentService = require('../lib/torrentService');

jest.mock('../lib/torrentService');

describe('API Endpoints (Mixed Auth)', () => {
  const testApiKey = 'test-api-key-12345';
  let originalApiKey;

  beforeAll(() => {
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = testApiKey;
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  test('POST /api/torrent/file parses file successfully without API Key', async () => {
    const mockResult = {
      magnetUri: 'magnet:?xt=urn:btih:123',
      name: 'Test Torrent',
      infoHash: '123',
      length: 1024,
      numFiles: 1,
      files: [{ name: 'file1.txt', length: 1024 }]
    };
    
    torrentService.handleTorrentSource.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/torrent/file')
      .attach('file', Buffer.from('fake-torrent-content'), 'test.torrent');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  test('GET /api/torrent/url requires API Key', async () => {
    const mockResult = {
      magnetUri: 'magnet:?xt=urn:btih:456',
      name: 'URL Torrent',
      infoHash: '456'
    };
    
    torrentService.handleTorrentSource.mockResolvedValue(mockResult);

    // 1. Without Key -> Fail
    const resNoKey = await request(app)
      .get('/api/torrent/url?url=http://example.com/test.torrent');
    expect(resNoKey.statusCode).toBe(401);

    // 2. With Key -> Success
    const resWithKey = await request(app)
      .get('/api/torrent/url?url=http://example.com/test.torrent')
      .set('X-API-KEY', testApiKey);

    expect(resWithKey.statusCode).toBe(200);
    expect(resWithKey.body).toEqual(mockResult);
  });
});
