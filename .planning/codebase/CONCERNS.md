# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Shared Utilities:**
- Issue: `formatBytes` logic is duplicated between `lib/utils.js` (backend) and `public/js/utils.js` (frontend).
- Why: Simple duplication was likely chosen over setting up a shared module system that works for both environments.
- Impact: Inconsistencies could arise if one version is updated but not the other.
- Fix approach: Create a unified approach for shared code, possibly through a build step or simply a single file served to the client and required by the server.

**Package Lock Management:**
- Issue: `package-lock.json` is in `.gitignore`.
- Why: Possibly to avoid merge conflicts or due to developer preference.
- Impact: Inconsistent dependency versions across different environments (dev, CI, prod).
- Fix approach: Remove `package-lock.json` from `.gitignore` and commit it to ensure deterministic builds.

**Logging:**
- Issue: Uses `console.log` and `console.error` directly.
- Why: Standard for small prototypes or simple CLI/Server apps.
- Impact: Difficult to manage log levels, formatting, or redirection in production.
- Fix approach: Integrate a logging library like `winston` or `pino`.

## Performance & Scalability

**Health Check Timeout:**
- Issue: `webtorrent-health` call has a hardcoded 15s timeout.
- Why: To prevent the request from hanging indefinitely.
- Impact: Some slow trackers/DHT lookups might fail to return health data within this window.
- Fix approach: Consider making the timeout configurable or using a more robust health checking strategy (e.g., background polling).

**File Size Limit:**
- Issue: Hardcoded 5MB limit for torrent files.
- Why: To prevent DOS attacks and memory exhaustion.
- Impact: Large torrents (with thousands of files) might exceed this limit.
- Fix approach: Validate if 5MB is sufficient for most use cases, otherwise move to a streaming parser.

## Security

**SSRF Protection:**
- Issue: `validateEgress` uses `dns.lookup` to check for private IPs.
- Why: To prevent attackers from using the server to probe internal network services.
- Impact: Vulnerable to DNS Rebinding if not carefully implemented (though `dns.lookup` results are checked).
- Fix approach: Use a dedicated SSRF protection library or a proxy with egress filtering.

**Content Security Policy (CSP):**
- Issue: `unsafe-inline` is allowed for scripts and styles in `helmet` config.
- Why: Likely required by the current frontend implementation (inline styles or script blocks).
- Impact: Increases the risk of Cross-Site Scripting (XSS).
- Fix approach: Move inline scripts/styles to external files and use nonces or hashes.

## Reliability

**Error Messaging:**
- Issue: Some errors returned to the user might be too technical (e.g., from `parse-torrent`).
- Why: Direct passthrough of library errors.
- Impact: Poor user experience or information disclosure.
- Fix approach: Map library-specific errors to user-friendly messages.

**Async Race Conditions:**
- Issue: `Promise.race` is used for the health check timeout, but the original promise isn't canceled.
- Why: `webtorrent-health` doesn't seem to support abort signals.
- Impact: Resource leakage if many health checks hang in the background.
- Fix approach: Investigate if `webtorrent-health` can be aborted or use a different library.

---

*Concerns audit: 2026-03-15*
*Update as issues are resolved or discovered*
