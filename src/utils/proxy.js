// Proxy configuration utility for Magnetize
// Handles HTTP/HTTPS proxy settings with optional authentication

/**
 * Get proxy configuration for axios requests
 * Reads from environment variables:
 *   - HTTP_PROXY / HTTPS_PROXY: Proxy URL
 *   - PROXY_USERNAME: Proxy auth username
 *   - PROXY_PASSWORD: Proxy auth password
 * 
 * @returns {Object|null} Axios proxy config or null if no proxy configured
 */
function getProxyConfig() {
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy;
    
    if (!proxyUrl) {
        return null;
    }

    try {
        const url = new URL(proxyUrl);
        const config = {
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            protocol: url.protocol.replace(':', ''),
        };

        // Add authentication if provided
        const username = process.env.PROXY_USERNAME;
        const password = process.env.PROXY_PASSWORD;
        
        if (username && password) {
            config.auth = `${username}:${password}`;
        }

        return config;
    } catch (err) {
        // Don't log URL as it may contain credentials
        console.warn('Invalid proxy URL configuration');
        return null;
    }
}

/**
 * Check if a URL should bypass the proxy
 * @param {string} url - URL to check
 * @returns {boolean} True if URL should bypass proxy
 */
function shouldBypassProxy(url) {
    const noProxy = process.env.NO_PROXY || process.env.no_proxy || '';
    
    if (!noProxy) {
        return false;
    }

    try {
        const urlObj = new URL(url);
        const noProxyList = noProxy.split(',').map(s => s.trim());
        
        return noProxyList.some(pattern => {
            // Check hostname
            if (pattern === urlObj.hostname) {
                return true;
            }
            // Check wildcard (e.g., *.local)
            if (pattern.startsWith('*.')) {
                const suffix = pattern.slice(2);
                return urlObj.hostname.endsWith(suffix);
            }
            // Check domain suffix
            if (urlObj.hostname.endsWith(pattern)) {
                return true;
            }
            return false;
        });
    } catch (err) {
        return false;
    }
}

/**
 * Get axios request config with proxy settings
 * @param {string} url - Target URL
 * @returns {Object} Axios config object with optional proxy
 */
function getAxiosConfig(url) {
    const config = {
        timeout: 10000, // 10s timeout for fetching
    };

    // Check if we should bypass proxy for this URL
    if (!shouldBypassProxy(url)) {
        const proxyConfig = getProxyConfig();
        if (proxyConfig) {
            config.proxy = proxyConfig;
        }
    }

    return config;
}

/**
 * Check if proxy is currently configured
 * @returns {boolean} True if proxy is configured
 */
function isProxyConfigured() {
    return !!(process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy);
}

module.exports = {
    getProxyConfig,
    shouldBypassProxy,
    getAxiosConfig,
    isProxyConfigured,
};
