---
wave: 2
depends_on: [02-01-service-fastpath]
files_modified: [server.js]
autonomous: true
---

# Plan: Machine API Endpoints

## Goal
Implement GET /api/convert and GET /api/inspect endpoints in server.js for machine-friendly access to torrent data.

## Tasks

<task id="1" name="Implement GET /api/convert">
Register a GET route for /api/convert in server.js.

Logic:
- Extract url from query parameters.
- If url is missing, return 400 Bad Request.
- Call 	orrentService.handleTorrentSource(url, url.startsWith('magnet:'), { skipHealth: true }).
- Return 200 OK with:
  `json
  {
    "magnet": result.magnetUri,
    "infoHash": result.infoHash,
    "name": result.name
  }
  `
- Handle errors with 400 status and error message.

<verify>
GET /api/convert?url=... returns the simplified magnet object and is faster than standard parsing.
</verify>
</task>

<task id="2" name="Implement GET /api/inspect">
Register a GET route for /api/inspect in server.js.

Logic:
- Extract url from query parameters.
- If url is missing, return 400 Bad Request.
- Call 	orrentService.handleTorrentSource(url, url.startsWith('magnet:'), { skipHealth: false }).
- Return 200 OK with the full esult object from 	orrentService.
- Handle errors with 400 status and error message.

<verify>
GET /api/inspect?url=... returns the full metadata object including file list and health data.
</verify>
</task>

## must_haves

Goal: Provide /api/convert and /api/inspect endpoints.

- [ ] GET /api/convert returns only magnet link, infoHash, and name.
- [ ] GET /api/convert skips health check for speed.
- [ ] GET /api/inspect returns full metadata including health and files.
- [ ] Both endpoints require X-API-KEY (handled by existing middleware).
- [ ] Both endpoints are rate-limited (handled by existing middleware).
- [ ] Missing url parameter returns 400.
