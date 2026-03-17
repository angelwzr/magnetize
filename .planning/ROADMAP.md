# Milestone 2: Machine Interface Roadmap

## Phase 1: Security & Protection (The Shield)
**Goal:** Implement the security infrastructure for the machine interface.

- [ ] Task 1.1: Install dependencies (`express-rate-limit`, `@modelcontextprotocol/sdk`).
- [ ] Task 1.2: Implement `API_KEY` authentication middleware.
- [ ] Task 1.3: Configure and apply `express-rate-limit` middleware.
- [ ] Task 1.4: Add unit tests for security middleware.
- [ ] Task 1.5: Verify security block for unauthorized requests.

## Phase 2: Programmatic API (The Hub)
**Goal:** Implement the new GET endpoints for machine consumption.

- [ ] Task 2.1: Implement `GET /api/convert` endpoint using `torrentService`.
- [ ] Task 2.2: Implement `GET /api/inspect` endpoint using `torrentService`.
- [ ] Task 2.3: Update `torrentService` to support fast-path for conversion (skipping health check if possible).
- [ ] Task 2.4: Add unit tests for API endpoints.
- [ ] Task 2.5: Verify API responses against requirements.

## Phase 3: Model Context Protocol (The Bridge)
**Goal:** Implement the MCP server with SSE transport.

- [ ] Task 3.1: Set up MCP Server instance with SSE transport endpoints (`/mcp`, `/mcp/messages`).
- [ ] Task 3.2: Implement `inspect_torrent` MCP tool.
- [ ] Task 3.3: Implement `convert_to_magnet` MCP tool.
- [ ] Task 3.4: Add E2E tests for MCP tool calls over SSE.
- [ ] Task 3.5: Document MCP usage for LLMs (MCP client configuration).

## Phase 4: Integration & Documentation (The Polish)
**Goal:** Finalize the milestone and provide usage guides.

- [ ] Task 4.1: Update `README.md` with API documentation and MCP setup guide.
- [ ] Task 4.2: Add `.env.example` entry for `API_KEY`.
- [ ] Task 4.3: Perform final E2E verification of all machine interface features.
- [ ] Task 4.4: Complete Milestone 2 archive.
