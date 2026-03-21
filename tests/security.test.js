'use strict';

const {
    validateUrl,
    createApiKeyAuth,
    getApiKey,
    PRIVATE_IP_PATTERNS,
    BLOCKED_HOSTNAMES
} = require('../src/utils/security');

describe('security.js', () => {
    describe('PRIVATE_IP_PATTERNS', () => {
        test('matches localhost patterns', () => {
            expect(PRIVATE_IP_PATTERNS.test('127.0.0.1')).toBe(true);
            expect(PRIVATE_IP_PATTERNS.test('127.0.0.2')).toBe(true);
        });

        test('matches 10.x.x.x patterns', () => {
            expect(PRIVATE_IP_PATTERNS.test('10.0.0.1')).toBe(true);
            expect(PRIVATE_IP_PATTERNS.test('10.255.255.255')).toBe(true);
        });

        test('matches 172.16-31.x.x patterns', () => {
            expect(PRIVATE_IP_PATTERNS.test('172.16.0.1')).toBe(true);
            expect(PRIVATE_IP_PATTERNS.test('172.31.255.255')).toBe(true);
        });

        test('matches 192.168.x.x patterns', () => {
            expect(PRIVATE_IP_PATTERNS.test('192.168.0.1')).toBe(true);
            expect(PRIVATE_IP_PATTERNS.test('192.168.255.255')).toBe(true);
        });

        test('does not match public IPs', () => {
            expect(PRIVATE_IP_PATTERNS.test('8.8.8.8')).toBe(false);
            expect(PRIVATE_IP_PATTERNS.test('1.1.1.1')).toBe(false);
            expect(PRIVATE_IP_PATTERNS.test('93.184.216.34')).toBe(false);
        });
    });

    describe('BLOCKED_HOSTNAMES', () => {
        test('matches blocked hostnames', () => {
            expect(BLOCKED_HOSTNAMES.test('localhost')).toBe(true);
            expect(BLOCKED_HOSTNAMES.test('localhost.local')).toBe(true);
            expect(BLOCKED_HOSTNAMES.test('metadata')).toBe(true);
            expect(BLOCKED_HOSTNAMES.test('metadata.google')).toBe(true);
            expect(BLOCKED_HOSTNAMES.test('169.254.169.254')).toBe(true);
        });

        test('does not match allowed hostnames', () => {
            expect(BLOCKED_HOSTNAMES.test('example.com')).toBe(false);
            expect(BLOCKED_HOSTNAMES.test('api.example.com')).toBe(false);
        });
    });

    describe('validateUrl', () => {
        test('allows valid https URLs', async () => {
            await expect(validateUrl('https://example.com/torrent.torrent')).resolves.not.toThrow();
        });

        test('allows valid http URLs', async () => {
            await expect(validateUrl('http://example.com/torrent.torrent')).resolves.not.toThrow();
        });

        test('allows magnet URLs', async () => {
            await expect(validateUrl('magnet:?xt=urn:btih:123')).resolves.not.toThrow();
        });

        test('blocks localhost URLs', async () => {
            await expect(validateUrl('http://localhost:8080/torrent.torrent')).rejects.toThrow();
        });

        test('blocks private IP URLs', async () => {
            await expect(validateUrl('http://192.168.1.1/torrent.torrent')).rejects.toThrow();
        });

        test('blocks invalid protocols', async () => {
            await expect(validateUrl('ftp://example.com/torrent.torrent')).rejects.toThrow();
            await expect(validateUrl('file:///etc/passwd')).rejects.toThrow();
        });
    });

    describe('getApiKey', () => {
        test('returns API_KEY from environment', () => {
            const original = process.env.API_KEY;
            process.env.API_KEY = 'test-key-123';
            expect(getApiKey()).toBe('test-key-123');
            process.env.API_KEY = original;
        });
    });
});
