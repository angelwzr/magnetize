---
wave: 1
depends_on: []
files_modified: [.env.example, lib/auth.js, tests/auth.test.js]
autonomous: true
---

# Plan: API Key Authentication Infrastructure

## Goal
Implement a robust API Key authentication middleware using `X-API-KEY` header and timing-safe comparison.

## Tasks

<task id="1" name="Update environment configuration">
Add `API_KEY` placeholder to `.env.example`.

<verify>
`.env.example` contains `API_KEY=your_api_key_here`.
</verify>
</task>

<task id="2" name="Implement API Key middleware">
Create `lib/auth.js` with `apiKeyAuth` middleware.
- Extract `X-API-KEY` from headers.
- Compare with `process.env.API_KEY` using `crypto.timingSafeEqual`.
- Return 401 if missing or invalid.
- Handle cases where `process.env.API_KEY` is not set by failing secure.

<verify>
`lib/auth.js` exists and exports the middleware.
Comparison uses `crypto.timingSafeEqual`.
</verify>
</task>

<task id="3" name="Add unit tests for auth middleware">
Create `tests/auth.test.js` using `supertest` and a mock express app.
- Test 200 with valid key.
- Test 401 with invalid key.
- Test 401 with missing key.

<verify>
`npm test tests/auth.test.js` passes all cases.
</verify>
</task>

## must_haves

Goal: Secure endpoints with API Key authentication.

- [ ] Middleware extracts `X-API-KEY` header.
- [ ] Comparison is timing-safe to prevent side-channel attacks.
- [ ] Returns 401 Unauthorized for invalid keys.
- [ ] Returns 401 Unauthorized for missing keys.
- [ ] Successfully validates correct keys.
