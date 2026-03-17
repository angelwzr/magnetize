const request = require('supertest');
const { app } = require('../server');
const torrentService = require('../lib/torrentService');

jest.mock('../lib/torrentService');

describe('API Endpoints (Public)', () => {
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

  test('POST /api/torrent/url parses URL successfully without API Key', async () => {
    const mockResult = {
      magnetUri: 'magnet:?xt=urn:btih:456',
      name: 'URL Torrent',
      infoHash: '456',
      length: 2048,
      numFiles: 2,
      files: [{ name: 'a.mp4', length: 1024 }, { name: 'b.mp4', length: 1024 }]
    };
    
    torrentService.handleTorrentSource.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/torrent/url')
      .send({ url: 'http://example.com/test.torrent' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
  });
});
