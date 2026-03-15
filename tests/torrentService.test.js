const torrentService = require('../lib/torrentService');
const axios = require('axios');
const parseTorrent = require('parse-torrent');
const dns = require('dns').promises;

jest.mock('axios');
jest.mock('parse-torrent', () => {
  const pt = jest.fn();
  pt.toMagnetURI = jest.fn();
  return pt;
});
jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn()
  }
}));

describe('TorrentService', () => {
  const mockFormatBytes = (b) => `${b} bytes`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleTorrentSource handles Buffer source', async () => {
    const mockBuffer = Buffer.from('fake-torrent');
    const mockParsed = {
      name: 'Test',
      infoHash: '123',
      length: 100,
      announce: [],
      files: []
    };
    
    parseTorrent.mockReturnValue(mockParsed);
    parseTorrent.toMagnetURI.mockReturnValue('magnet:?xt=urn:btih:123');

    const result = await torrentService.handleTorrentSource(mockBuffer, false);

    expect(result.name).toBe('Test');
    expect(result.infoHash).toBe('123');
    expect(parseTorrent).toHaveBeenCalledWith(mockBuffer);
  });

  test('handleTorrentSource handles URL source with egress validation', async () => {
    const mockUrl = 'http://example.com/test.torrent';
    dns.lookup.mockResolvedValue({ address: '93.184.216.34' }); // Example.com IP
    axios.get.mockResolvedValue({ data: Buffer.from('fake-content') });
    
    const mockParsed = {
      name: 'URL Torrent',
      infoHash: '456',
      length: 200,
      announce: [],
      files: []
    };
    parseTorrent.mockReturnValue(mockParsed);
    parseTorrent.toMagnetURI.mockReturnValue('magnet:?xt=urn:btih:456');

    const result = await torrentService.handleTorrentSource(mockUrl, false);

    expect(result.name).toBe('URL Torrent');
    expect(dns.lookup).toHaveBeenCalledWith('example.com');
    expect(axios.get).toHaveBeenCalled();
  });

  test('handleTorrentSource blocks SSRF attempts', async () => {
    const mockUrl = 'http://127.0.0.1/evil.torrent';
    dns.lookup.mockResolvedValue({ address: '127.0.0.1' });

    await expect(torrentService.handleTorrentSource(mockUrl, false))
      .rejects.toThrow('SSRF Blocked');
  });
});
