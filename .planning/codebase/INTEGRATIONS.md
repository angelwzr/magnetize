# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**Torrent Metadata Fetching:**
- External Torrent URLs - Fetched via `axios` in `lib/torrentService.js`.
  - SDK/Client: `axios` 1.6.0.
  - Integration method: HTTP GET with SSRF protection.
  - Constraints: Max content length 5MB.

**Tracker/DHT Health Checks:**
- Torrent Trackers - Communicates with trackers listed in torrent metadata via `webtorrent-health`.
  - SDK/Client: `webtorrent-health` 1.2.0.
  - Integration method: Bittorrent protocol / Tracker protocol (UDP/HTTP).
  - Timeout: 15 seconds (hardcoded in `lib/torrentService.js`).

## Data Storage

**Databases:**
- None - This application is stateless and does not store torrent metadata permanently.

**File Storage:**
- Memory/Buffer - Torrents are processed in memory and not saved to disk.
- Client-side - Results are displayed on the frontend and not persisted.

## Authentication & Identity

**Auth Provider:**
- None - The application is public and does not have user accounts or authentication.

## Monitoring & Observability

**Error Tracking:**
- Console Logging - Uses `console.log` and `console.error` in `server.js` and `lib/torrentService.js`.

**Health Check:**
- `/health` endpoint - Returns 'OK' for Docker/monitoring service health probes.

## CI/CD & Deployment

**Hosting:**
- Self-hosted / Docker - Can be deployed via Docker or PM2 (`ecosystem.config.js`).

**CI Pipeline:**
- Not explicitly detected in the codebase (no `.github/workflows` or similar).

## Environment Configuration

**Required env vars:**
- `PORT` - Port to listen on (default 3000).
- `NODE_ENV` - Set to `production` or `development`.

**Secrets management:**
- No secrets currently required.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-03-15*
*Update when adding/removing external services*
