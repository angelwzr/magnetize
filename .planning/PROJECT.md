# Magnetize - Milestone 2: Machine Interface (API & MCP)

## Project Overview
Expand Magnetize beyond a human-facing web application into a robust machine-to-machine service. This milestone adds a formal API for programmatic conversion/inspection and a Model Context Protocol (MCP) server to allow LLMs to directly interact with torrent metadata.

## Core Objectives
- Implement dedicated API endpoints for automated conversion and inspection.
- Integrate Model Context Protocol (MCP) using SSE transport.
- Secure the machine interface with API Key authentication.
- Protect the service with rate limiting to prevent abuse.

## Tech Stack (Milestone 2)
- **Runtime:** Node.js (Existing)
- **Web Framework:** Express (Existing)
- **MCP SDK:** `@modelcontextprotocol/sdk` (New)
- **Rate Limiting:** `express-rate-limit` (New)
- **Authentication:** Custom API Key Middleware (New)
- **Transport:** Server-Sent Events (SSE) for MCP.

## Success Criteria
1. Programmatic access to Magnet URI conversion via `GET /api/convert`.
2. Full metadata inspection via `GET /api/inspect`.
3. Working MCP server accessible via `/mcp` (SSE).
4. All machine endpoints require a valid `X-API-KEY`.
5. Rate limits applied to prevent service degradation.
