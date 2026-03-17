---
wave: 3
depends_on: [02-02-api-routes]
files_modified: [tests/machine-api.test.js]
autonomous: true
---

# Plan: Verification & Integration Tests

## Goal
Establish automated integration tests for the new machine API endpoints to ensure correctness and security.

## Tasks

<task id="1" name="Create tests/machine-api.test.js">
Create a new test file 	ests/machine-api.test.js using jest and supertest.

Initial setup:
- Import pp from server.js.
- Define a valid API_KEY (use process.env.API_KEY or a mock if necessary).

<verify>
	ests/machine-api.test.js exists and can be run by jest.
</verify>
</task>

<task id="2" name="Add tests for /api/convert">
Implement test cases for GET /api/convert:
- Success case with valid .torrent URL (returns magnet).
- Success case with valid Magnet URI (returns same magnet).
- Error case: missing url parameter (returns 400).
- Security case: missing/invalid X-API-KEY (returns 401).

<verify>
All /api/convert tests pass.
</verify>
</task>

<task id="3" name="Add tests for /api/inspect">
Implement test cases for GET /api/inspect:
- Success case with valid .torrent URL (returns full metadata + health).
- Error case: missing url parameter (returns 400).
- Security case: missing/invalid X-API-KEY (returns 401).

<verify>
All /api/inspect tests pass.
</verify>
</task>

## must_haves

Goal: Verify machine API endpoints via integration tests.

- [ ] /api/convert success case verified.
- [ ] /api/inspect success case verified.
- [ ] Authentication (X-API-KEY) is enforced and verified for both endpoints.
- [ ] Input validation (missing URL) is verified for both endpoints.
- [ ] Test suite runs and passes with 
pm test.
