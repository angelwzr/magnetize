# Phase 2: Programmatic API - Research

**Researched:** 2026-03-15
**Domain:** REST API, Torrent Metadata Extraction, Machine Interfaces
**Confidence:** HIGH

## Summary

Phase 2 focuses on providing standardized GET endpoints for machine consumption. These endpoints will leverage the existing 	orrentService.js but will offer more focused responses (e.g., just the magnet link for /api/convert) and improved performance by allowing optional skipping of health checks.

**Primary recommendation:** Extend handleTorrentSource in 	orrentService.js to accept an options object for skipping health checks, and implement the new GET routes in server.js using the existing authentication and rate-limiting middleware.

## Standard Stack

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^4.18.2 | Web Framework | Industry standard for Node.js APIs. |
| parse-torrent | ^9.1.5 | Torrent Parsing | Robust and widely used library for parsing .torrent and magnet URIs. |
| webtorrent-health | ^1.2.1 | Health Checks | Standard way to fetch seeder/leecher counts for torrents. |
| axios | ^1.6.2 | HTTP Client | Reliable client for fetching remote .torrent files. |

## Architecture Patterns

### Recommended Route Structure
The new endpoints should be registered under the /api prefix to automatically benefit from the piKeyAuth and machineLimiter middleware defined in Phase 1.

- GET /api/convert?url=... -> Fast conversion to Magnet URI.
- GET /api/inspect?url=... -> Full metadata and file listing.

### Pattern 1: Service-Oriented Logic
Keep all torrent-specific logic in lib/torrentService.js. The route handlers in server.js should remain thin, primarily handling request validation and response formatting.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Torrent Parsing | Custom Bencode parser | parse-torrent | Handles complex edge cases and multiple source formats (Buffer, URL, Magnet). |
| Health Checks | Custom Tracker client | webtorrent-health | Handles multiple trackers and protocol details automatically. |
| SSRF Protection | Custom IP blacklist | ip + dns | Already implemented in 	orrentService.js using standard libraries. |

## Common Pitfalls

### Pitfall 1: Blocking Health Checks
**What goes wrong:** webtorrent-health can take a long time to respond or timeout, especially for older or niche torrents.
**How to avoid:** Implement a "fast-path" option that skips health checks. For /api/convert, health is often irrelevant.

### Pitfall 2: Memory Usage with Large Files
**What goes wrong:** Large .torrent files can consume significant memory if not limited.
**How to avoid:** The existing ileUpload and xios configurations already limit file sizes to 5MB, which is sufficient for almost all torrent files.

## Code Examples

### Optional Health Check in Service
`javascript
async function handleTorrentSource(source, options = {}) {
    const { skipHealth = false } = options;
    // ... fetch and parse ...
    let healthData = { seeds: 0, peers: 0 };
    if (!skipHealth) {
        try {
            healthData = await health(parsed);
        } catch (err) {
            // handle error
        }
    }
    // ... return metadata ...
}
`

## Sources

### Primary (HIGH confidence)
- [Express Documentation](https://expressjs.com/)
- [parse-torrent GitHub](https://github.com/webtorrent/parse-torrent)
- [webtorrent-health GitHub](https://github.com/webtorrent/webtorrent-health)
