# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Monolithic Express API + Static Frontend SPA.

**Key Characteristics:**
- Stateless request handling (no database).
- Functional service layer for business logic.
- Modular client-side JavaScript architecture.
- Security-first (Helmet, SSRF protection).

## Layers

**API Layer:**
- Purpose: Handle incoming HTTP requests and file uploads.
- Contains: Express routes, file upload processing, SSRF validation.
- Location: `server.js` (entry point).
- Depends on: Service layer for torrent processing.
- Used by: Frontend application and potential API clients.

**Service Layer:**
- Purpose: Encapsulate torrent parsing and health checking logic.
- Contains: Torrent source handling, metadata extraction, health probing.
- Location: `lib/torrentService.js`.
- Depends on: External libraries (`parse-torrent`, `webtorrent-health`, `axios`).
- Used by: API layer.

**Utility Layer:**
- Purpose: Shared helpers and data formatting.
- Contains: `formatBytes` utility.
- Location: `lib/utils.js` (backend), `public/js/utils.js` (frontend - identical code).
- Depends on: None.
- Used by: API layer, Service layer, and Frontend application.

**Frontend Layer:**
- Purpose: User interface for uploading files and viewing results.
- Contains: HTML, CSS, client-side JS logic.
- Location: `public/`.
- Depends on: API layer for torrent data.
- Used by: End users.

## Data Flow

**Torrent Extraction Flow:**

1. User provides torrent source (file upload, URL, or Magnet URI) via `public/index.html`.
2. Client-side JS (`public/js/app.js`) sends POST request to `/api/torrent/file` or `/api/torrent/url`.
3. `server.js` parses the request. For URLs, it validates the hostname to prevent SSRF.
4. `server.js` calls `torrentService.handleTorrentSource`.
5. `torrentService.js` fetches data (if URL), parses metadata using `parse-torrent`, and initiates an asynchronous health check with `webtorrent-health`.
6. Results are returned as JSON to the client.
7. `public/js/ui.js` updates the page with the extracted metadata.

**State Management:**
- The application is entirely stateless. All data is processed in-flight and not stored server-side.

## Key Abstractions

**Torrent Service:**
- Purpose: Unified interface for handling any torrent source (Buffer, URL, Magnet).
- Examples: `lib/torrentService.js` -> `handleTorrentSource()`.
- Pattern: Service Module.

**API Communication:**
- Purpose: Standardized client-side interface for calling backend endpoints.
- Examples: `public/js/api.js`.
- Pattern: API Proxy.

## Entry Points

**Backend Server:**
- Location: `server.js`
- Triggers: Node process start (`node server.js`).
- Responsibilities: Server configuration, route registration, middleware setup.

**Frontend App:**
- Location: `public/js/app.js` (loaded by `index.html`).
- Triggers: Browser page load.
- Responsibilities: Initialization of UI, event listener setup for uploads.

## Error Handling

**Strategy:** 
- Backend: Exception bubbling caught at route handlers, returned as JSON errors with appropriate status codes (400 for bad input, 500 for server errors).
- Frontend: `try/catch` in API calls, displaying error messages to the user via UI alerts/notices.

**Patterns:**
- `torrentService.handleTorrentSource` throws errors for invalid data or blocked URLs.
- Route handlers log errors to console and send `{ error: "message" }` response.

## Cross-Cutting Concerns

**Logging:**
- Console-based logging for request status and errors.

**Validation:**
- Hostname validation in `validateEgress` to prevent SSRF.
- File size limits (5MB) in `express-fileupload` and `axios` config.

**Security:**
- `helmet` middleware for standard security headers.
- CSP configuration to limit script and connection sources.

---

*Architecture analysis: 2026-03-15*
*Update when major patterns change*
