# Milestone 2: Machine Interface Requirements

## 1. API Endpoints

### 1.1 GET /api/convert
- **Purpose:** Fast conversion of torrent source (file URL or Magnet URI) into a Magnet URI.
- **Parameters:** `url` (query parameter, required).
- **Response (200 OK):**
  ```json
  {
    "magnet": "magnet:?xt=urn:btih:...",
    "infoHash": "...",
    "name": "..."
  }
  ```
- **Error (400 Bad Request):** If URL is missing or invalid.
- **Error (401 Unauthorized):** If API Key is missing or invalid.

### 1.2 GET /api/inspect
- **Purpose:** Full metadata inspection of torrent source, including file listing and health.
- **Parameters:** `url` (query parameter, required).
- **Response (200 OK):**
  ```json
  {
    "name": "...",
    "infoHash": "...",
    "magnet": "...",
    "files": [...],
    "health": { "seeds": 10, "peers": 5 },
    "size": 123456
  }
  ```
- **Error (400 Bad Request):** If URL is missing or invalid.
- **Error (401 Unauthorized):** If API Key is missing or invalid.

## 2. Model Context Protocol (MCP)

### 2.1 Endpoint: /mcp (SSE)
- **Transport:** Server-Sent Events (SSE).
- **Implementation:**
  - `GET /mcp`: Establish SSE connection.
  - `POST /mcp/messages`: Standard JSON-RPC message handling for the SSE transport.
- **Features:**
  - `inspect_torrent` tool: Calls the internal inspection logic.
  - `convert_to_magnet` tool: Calls the internal conversion logic.
- **Security:** Requires `X-API-KEY` for connection establishment.

## 3. Middleware

### 3.1 API_KEY Authentication
- **Header:** `X-API-KEY`.
- **Validation:** Compare against `process.env.API_KEY`.
- **Scope:** Applied to all `/api/convert`, `/api/inspect`, and `/mcp` endpoints.
- **Security:** Use `crypto.timingSafeEqual` for comparison.

### 3.2 Rate Limiting
- **Implementation:** Use `express-rate-limit`.
- **Global API Limit:** 100 requests per 15 minutes.
- **Machine Interface Limit:** 20 requests per minute for `/api/*` and `/mcp`.
- **Configuration:** Trust proxy enabled (standard for Node.js behind Nginx/Heroku).

## 4. Environment Variables
- `API_KEY`: Required for authentication.
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting (optional, default 15min).
- `RATE_LIMIT_MAX`: Max requests per window (optional, default 100).

## 5. Non-Functional Requirements
- **Documentation:** README update for new API and MCP usage.
- **Tests:** Unit tests for new middleware and route handlers.
- **Performance:** Keep inspection latency low (< 5s for health check timeout).
