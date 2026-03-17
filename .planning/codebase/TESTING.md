# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Runner:**
- Jest 30.3.0
- Config: `jest.config.js` in project root.

**Assertion Library:**
- Jest built-in `expect`.
- Matchers used: `toBe`, `toEqual`, `toHaveBeenCalled`, `toThrow`.

**Run Commands:**
```bash
npm test                              # Run all tests using Jest
```

## Test File Organization

**Location:**
- All tests are located in the `tests/` directory at the project root.

**Naming:**
- `*.test.js` suffix for all test files.

**Structure:**
```
tests/
  api.test.js          # API endpoint integration tests
  torrentService.test.js # Service layer unit tests
  ui.test.js           # Frontend logic tests (using jsdom)
  utils.test.js        # Utility function tests
```

## Test Structure

**Suite Organization:**
```javascript
const torrentService = require('../lib/torrentService');

describe('torrentService', () => {
  describe('handleTorrentSource', () => {
    test('should parse magnet link correctly', async () => {
      // arrange
      const magnet = 'magnet:?xt=urn:btih:...';
      
      // act
      const result = await torrentService.handleTorrentSource(magnet);
      
      // assert
      expect(result.infoHash).toBe('...');
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group tests by module and function.
- `beforeEach` is used for clearing mocks (`jest.clearAllMocks()`).
- Follow the Arrange-Act-Assert pattern.

## Mocking

**Framework:**
- Jest built-in mocking (`jest.mock()`).

**Patterns:**
```javascript
jest.mock('../lib/torrentService');

// In test
torrentService.handleTorrentSource.mockResolvedValue(mockData);
```

**What to Mock:**
- Service layer when testing API routes (`server.js`).
- External network calls (DNS, axios) when testing the service layer.
- Torrent parsing library (`parse-torrent`) if necessary (though often used with real data in unit tests).

## Fixtures and Factories

**Test Data:**
- Inline mock objects are commonly used for torrent metadata results.
- `Buffer.from()` is used to create fake torrent file content for upload tests.

## Coverage

**Requirements:**
- No formal coverage requirements detected in configuration.

## Test Types

**Unit Tests:**
- Target `lib/torrentService.js` and `lib/utils.js`.
- Focus on logic isolation.

**Integration Tests:**
- Target `server.js` using `supertest`.
- Verify the full request/response cycle and route handling.

**Frontend Tests:**
- `tests/ui.test.js` suggests some testing of client-side logic, likely using `jest-environment-jsdom`.

## Common Patterns

**Async Testing:**
- Use `async`/`await` in test functions.
- `expect(promise).resolves` or `expect(promise).rejects` for promise state assertions.

**Error Testing:**
- `expect(res.statusCode).toBe(400)` for API error routes.
- `expect(torrentService.handleTorrentSource).mockRejectedValue(...)`.

---

*Testing analysis: 2026-03-15*
*Update when test patterns change*
