# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run production server |
| `npm run dev` | Development with hot-reload (nodemon) |
| `npm run serve` | Production with PM2 |
| `docker-compose up -d` | Run via Docker |

**Testing**: No test suite is currently configured. Add tests using Jest or Mocha if needed.

**Linting**: No linting is configured. The project uses vanilla Node.js patterns.

## Code Style Guidelines

### Imports and Modules

- **CommonJS Required**: Always use `require()`, never ESM imports
- **Local imports**: Use relative paths from project root (e.g., `./src/utils/security`)
- **Third-party imports**: Place after Node.js built-ins, before local modules
- **Sort order**: Node.js built-ins → npm packages → local modules

```javascript
// Correct order
const express = require('express');
const axios = require('axios');
const { validateUrl } = require('./src/utils/security');
```

### Formatting

- **Indentation**: 4 spaces (no tabs)
- **Line length**: No hard limit, but keep lines reasonable (~100 chars max preferred)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes only for strings containing single quotes

### Naming Conventions

- **Variables/functions**: camelCase (e.g., `formatBytes`, `healthData`)
- **Constants**: SCREAMING_SNAKE_CASE for config constants (e.g., `PRIVATE_IP_PATTERNS`)
- **Files**: kebab-case (e.g., `mcpServer.js`, `security.js`)
- **Classes**: PascalCase if used (none currently in codebase)

### Error Handling

- **Generic messages**: Never expose internal details to clients
- **Console logging**: Use `console.error()` for API errors, `console.warn()` for recoverable issues
- **Try-catch**: Wrap async operations that can fail
- **Error responses**: Return JSON with `error` key, generic messages

```javascript
// Good error handling pattern
try {
    const result = await riskyOperation();
    res.status(200).json(result);
} catch (err) {
    console.error('[API Error]:', err.message);
    res.status(400).json({ error: 'User-friendly message' });
}
```

### Types

- No TypeScript is used. Use JSDoc comments for complex types if needed:
```javascript
/**
 * @param {string} url - URL to validate
 * @returns {Promise<void>} Throws if URL is not allowed
 */
async function validateUrl(url) { ... }
```

### Best Practices

- Use `const` and `let`, never `var`
- Prefer async/await over raw promises
- Use arrow functions for callbacks
- Keep functions focused and small
- Add JSDoc comments for exported functions

## Non-Obvious Project Requirements

- **parse-torrent Version Pin**: Must use exactly version `9.1.5` in package.json - newer versions may drop CommonJS support
- **In-Memory Processing**: All torrent parsing happens in RAM - never write torrent data to disk
- **Privacy User-Agent**: External fetches use hardcoded `Mozilla/5.0 ... Chrome/120.0.0.0` (see server.js line 137)

## Server Configuration (Non-Standard)

- **5MB File Limit**: Upload limit is enforced via `express-fileupload` (server.js line 39)
- **30s Server Timeout**: Long-running health checks require extended timeout (server.js line 222)
- **15s Health Check Timeout**: Uses `Promise.race` pattern with 15s timeout (server.js lines 159-162)
- **Trust Proxy**: Enabled for reverse proxy support (server.js line 21)

## Security Implementation

- **Helmet CSP**: Strict `connect-src: 'self'` blocks all external API calls (server.js line 32)
- **No Referrer**: `referrerPolicy: { policy: 'no-referrer' }` prevents leaking URLs (server.js line 25)
- **Generic Error Messages**: Health check failures log generic warnings, not internal details (server.js line 169)
- **API Key Authentication**: Required for `/api/torrent` endpoint via `X-API-Key` header
- **Rate Limiting**: 100 requests per 15 minutes on API routes (server.js lines 45-51)
- **SSRF Protection**: Blocks access to private/internal IP addresses (src/utils/security.js)

## API Authentication

All API requests require the `X-API-Key` header:
```bash
curl -X POST http://localhost:3000/api/torrent \
  -H "X-API-Key: your_api_key_here" \
  -F "file=@test.torrent"
```

## Proxy Support

| Variable | Description |
|----------|-------------|
| `HTTP_PROXY` | HTTP proxy URL (e.g., `http://proxy:8080`) |
| `HTTPS_PROXY` | HTTPS proxy URL |
| `NO_PROXY` | Comma-separated hosts to bypass proxy |
| `PROXY_USERNAME` | Proxy authentication username |
| `PROXY_PASSWORD` | Proxy authentication password |

## MCP Server

The Model Context Protocol server provides tools for LLMs to interact with torrent metadata.

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mcp` | GET | X-API-Key | SSE connection for MCP |
| `/mcp/messages` | POST | X-API-Key | JSON-RPC message handling |

### Tools

- `inspect_torrent`: Full metadata with health check (seeds/peers)
- `convert_to_magnet`: Fast conversion to magnet URI (skips health check)

## File Structure

```
magnetize/
├── server.js           # Express API, security middleware, torrent parsing
├── src/
│   ├── mcpServer.js     # MCP server implementation
│   └── utils/
│       ├── security.js # SSRF protection, API auth, rate limiting
│       └── proxy.js    # Proxy configuration
├── public/
│   ├── magnetize.js    # Client-side UI logic
│   ├── chart.js        # Self-hosted chart library
│   └── index.html      # Main UI
├── package.json
└── .env                # Environment variables (not committed)
```

## Environment Variables

Create a `.env` file with:
```
PORT=3000
API_KEY=your-secret-api-key
# Optional proxy configuration
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
```
