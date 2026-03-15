const request = require('supertest');
const { app } = require('../server');
const torrentService = require('../lib/torrentService');

jest.mock('../lib/torrentService');

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  test('POST /api/torrent/file parses file successfully', async () => {
    const mockResult = {
      magnetUri: 'magnet:?xt=urn:btih:123',
      name: 'Test Torrent',
      infoHash: '123',
      size: '1.5 MB',
      numFiles: 1,
      files: [{ name: 'file1.txt', size: '1.5 MB' }]
    };
    
    torrentService.handleTorrentSource.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/torrent/file')
      .attach('file', Buffer.from('fake-torrent-content'), 'test.torrent');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(torrentService.handleTorrentSource).toHaveBeenCalled();
  });

  test('POST /api/torrent/url parses URL successfully', async () => {
    const mockResult = {
      magnetUri: 'magnet:?xt=urn:btih:456',
      name: 'URL Torrent',
      infoHash: '456',
      size: '2 MB',
      numFiles: 2,
      files: [{ name: 'a.mp4', size: '1 MB' }, { name: 'b.mp4', size: '1 MB' }]
    };
    
    torrentService.handleTorrentSource.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/torrent/url')
      .send({ url: 'http://example.com/test.torrent' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(torrentService.handleTorrentSource).toHaveBeenCalledWith(
      'http://example.com/test.torrent',
      false
    );
  });

  test('POST /api/torrent/url returns 400 on error', async () => {
    torrentService.handleTorrentSource.mockRejectedValue(new Error('SSRF Blocked'));

    const res = await request(app)
      .post('/api/torrent/url')
      .send({ url: 'http://127.0.0.1/evil.torrent' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('SSRF Blocked');
  });
});

// No need for afterAll if we don't start the listener in the test
// But since server.js might start it depending on how it's imported, 
// let's ensure we are safe if a server was indeed started.
// Actually, our require.main check in server.js prevents it.

