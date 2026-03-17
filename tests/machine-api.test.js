const request = require('supertest');
const { app } = require('../server');
const torrentService = require('../lib/torrentService');

jest.mock('../lib/torrentService');

describe('Machine API Endpoints', () => {
  const originalApiKey = process.env.API_KEY;
  const testApiKey = 'test-api-key-12345678901234567890';

  beforeAll(() => {
    process.env.API_KEY = testApiKey;
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/convert', () => {
    test('should return simplified magnet object and skip health check', async () => {
      const mockResult = {
        magnetUri: 'magnet:?xt=urn:btih:abc',
        infoHash: 'abc',
        name: 'Test'
      };
      torrentService.handleTorrentSource.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/convert?url=http://example.com/test.torrent')
        .set('X-API-KEY', testApiKey);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        magnet: mockResult.magnetUri,
        infoHash: mockResult.infoHash,
        name: mockResult.name
      });
      expect(torrentService.handleTorrentSource).toHaveBeenCalledWith(
        'http://example.com/test.torrent',
        false
      );
    });

    test('should handle magnet URIs', async () => {
      const magnet = 'magnet:?xt=urn:btih:123';
      const mockResult = {
        magnetUri: magnet,
        infoHash: '123',
        name: 'Magnet'
      };
      torrentService.handleTorrentSource.mockResolvedValue(mockResult);

      const res = await request(app)
        .get(`/api/convert?url=${encodeURIComponent(magnet)}`)
        .set('X-API-KEY', testApiKey);

      expect(res.statusCode).toBe(200);
      expect(torrentService.handleTorrentSource).toHaveBeenCalledWith(
        magnet,
        true
      );
    });
  });

  describe('GET /api/inspect', () => {
    test('should return full metadata and perform health check', async () => {
      const mockResult = {
        magnetUri: 'magnet:?xt=urn:btih:full',
        infoHash: 'full',
        name: 'Full Metadata'
      };
      torrentService.handleTorrentSource.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/inspect?url=http://example.com/full.torrent')
        .set('X-API-KEY', testApiKey);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockResult);
      expect(torrentService.handleTorrentSource).toHaveBeenCalledWith(
        'http://example.com/full.torrent',
        false
      );
    });
  });
});
