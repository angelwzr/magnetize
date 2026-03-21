'use strict';

const {
    getProxyConfig,
    shouldBypassProxy,
    getAxiosConfig,
    isProxyConfigured,
} = require('./proxy');

describe('proxy.js', () => {
    describe('getProxyConfig', () => {
        test('returns null when no proxy configured', () => {
            delete process.env.HTTP_PROXY;
            delete process.env.HTTPS_PROXY;
            delete process.env.http_proxy;
            delete process.env.https_proxy;
            expect(getProxyConfig()).toBeNull();
        });

        test('parses HTTP_PROXY correctly', () => {
            process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
            const config = getProxyConfig();
            expect(config).not.toBeNull();
            expect(config.host).toBe('proxy.example.com');
            expect(config.port).toBe(8080);
            expect(config.protocol).toBe('http');
            delete process.env.HTTP_PROXY;
        });

        test('parses HTTPS_PROXY with default port', () => {
            process.env.HTTPS_PROXY = 'https://proxy.example.com';
            const config = getProxyConfig();
            expect(config).not.toBeNull();
            expect(config.host).toBe('proxy.example.com');
            expect(config.port).toBe(443);
            expect(config.protocol).toBe('https');
            delete process.env.HTTPS_PROXY;
        });

        test('includes authentication when provided', () => {
            process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
            process.env.PROXY_USERNAME = 'user';
            process.env.PROXY_PASSWORD = 'pass';
            const config = getProxyConfig();
            expect(config.auth).toBe('user:pass');
            delete process.env.HTTP_PROXY;
            delete process.env.PROXY_USERNAME;
            delete process.env.PROXY_PASSWORD;
        });
    });

    describe('shouldBypassProxy', () => {
        test('returns false when NO_PROXY is not set', () => {
            delete process.env.NO_PROXY;
            delete process.env.no_proxy;
            expect(shouldBypassProxy('https://example.com')).toBe(false);
        });

        test('returns true for exact hostname match', () => {
            process.env.NO_PROXY = 'example.com';
            expect(shouldBypassProxy('https://example.com')).toBe(true);
            delete process.env.NO_PROXY;
        });

        test('returns true for wildcard matches', () => {
            process.env.NO_PROXY = '*.local';
            expect(shouldBypassProxy('https://host.local')).toBe(true);
            expect(shouldBypassProxy('https://api.example.com')).toBe(false);
            delete process.env.NO_PROXY;
        });

        test('returns true for domain suffix matches', () => {
            process.env.NO_PROXY = '.example.com';
            expect(shouldBypassProxy('https://api.example.com')).toBe(true);
            delete process.env.NO_PROXY;
        });
    });

    describe('getAxiosConfig', () => {
        test('returns basic config without proxy', () => {
            delete process.env.HTTP_PROXY;
            delete process.env.HTTPS_PROXY;
            const config = getAxiosConfig('https://example.com');
            expect(config.timeout).toBe(10000);
            expect(config.proxy).toBeUndefined();
        });

        test('includes proxy when configured', () => {
            process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
            const config = getAxiosConfig('https://example.com');
            expect(config.proxy).toBeDefined();
            expect(config.proxy.host).toBe('proxy.example.com');
            delete process.env.HTTP_PROXY;
        });
    });

    describe('isProxyConfigured', () => {
        test('returns false when no proxy configured', () => {
            delete process.env.HTTP_PROXY;
            delete process.env.HTTPS_PROXY;
            expect(isProxyConfigured()).toBe(false);
        });

        test('returns true when HTTP_PROXY is set', () => {
            process.env.HTTP_PROXY = 'http://proxy.example.com:8080';
            expect(isProxyConfigured()).toBe(true);
            delete process.env.HTTP_PROXY;
        });

        test('returns true when HTTPS_PROXY is set', () => {
            process.env.HTTPS_PROXY = 'https://proxy.example.com:8080';
            expect(isProxyConfigured()).toBe(true);
            delete process.env.HTTPS_PROXY;
        });
    });
});
