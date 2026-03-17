---
wave: 1
depends_on: []
files_modified: [package.json, lib/rateLimit.js, server.js, tests/ratelimit.test.js]
autonomous: true
---

# Plan: Rate Limiting Infrastructure

## Goal
Implement rate limiting to protect the infrastructure from abuse and ensure fair usage.

## Tasks

<task id="1" name="Install rate-limit dependencies">
Install `express-rate-limit`.

<verify>
`package.json` contains `express-rate-limit`.
`node_modules/express-rate-limit` exists.
</verify>
</task>

<task id="2" name="Configure and export rate-limiters">
Create `lib/rateLimit.js`.
- Create global limiter: 100 requests / 15 minutes.
- Create machine limiter: 20 requests / 1 minute.
- Standard behavior: Respond 429 Too Many Requests.

<verify>
`lib/rateLimit.js` exports `globalLimiter` and `machineLimiter`.
</verify>
</task>

<task id="3" name="Integrate into server.js">
- Import limiters into `server.js`.
- Apply `globalLimiter` as top-level middleware.
- Ensure `trust proxy` is correctly configured (already in `server.js`).

<verify>
`server.js` applies `globalLimiter`.
Check existing `app.set('trust proxy', 1)` in `server.js`.
</verify>
</task>

<task id="4" name="Add unit tests for rate-limiting">
Create `tests/ratelimit.test.js`.
- Use a mock app to verify it returns 429 when limits are exceeded (using short limits for tests).

<verify>
`npm test tests/ratelimit.test.js` passes.
</verify>
</task>

## must_haves

Goal: Implement rate limiting to protect the infrastructure.

- [ ] `express-rate-limit` installed and used.
- [ ] Global limit of 100/15min configured.
- [ ] Machine interface limit of 20/min configured (to be applied in future phases to specific routes).
- [ ] Responds with 429 for rate-limited requests.
- [ ] Respects proxies with `trust proxy`.
