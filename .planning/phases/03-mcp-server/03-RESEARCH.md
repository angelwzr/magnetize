# Phase 3: Model Context Protocol (MCP) Server - Research

**Researched:** 2026-03-15
**Domain:** Model Context Protocol, SSE Transport, AI Tools, Magnetize Integration
**Confidence:** HIGH

## Summary

Phase 3 focuses on enabling AI agents to interact with Magnetize through standardized MCP tools. This involves setting up an MCP server within the existing Express application using Server-Sent Events (SSE) transport. Two primary tools will be exposed: `inspect_torrent` and `convert_to_magnet`, both leveraging the logic in `lib/torrentService.js`.

**Primary recommendation:** Use the `@modelcontextprotocol/sdk` to implement an MCP server. Use the `SSEServerTransport` for communication, which requires two endpoints in `server.js`: one for the SSE connection (GET `/mcp`) and one for receiving client messages (POST `/mcp/messages`).

## Standard Stack

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.0.1 | MCP Implementation | Official SDK for building MCP servers and clients. |
| express | ^4.18.2 | Web Framework | Existing framework for Magnetize. |

## Architecture Patterns

### SSE Transport with Express
MCP over SSE requires a persistent connection for sending events to the client and a separate POST endpoint for the client to send messages to the server.

- **GET /mcp**: Establishes the SSE connection.
- **POST /mcp/messages**: Receives JSON-RPC messages from the MCP client.

### Tool Registration
The MCP server will register two tools:
1. `inspect_torrent`: Takes a `url` (torrent or magnet) and returns full metadata (including health).
2. `convert_to_magnet`: Takes a `url` and returns the magnet URI, infoHash, and name (skipping health check).

### Integration with torrentService.js
Both tools will call `torrentService.handleTorrentSource` with appropriate options.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MCP Protocol | Custom JSON-RPC | @modelcontextprotocol/sdk | Handles protocol versioning, tool registration, and transport details. |
| SSE Management | Custom headers/streams | SSEServerTransport (SDK) | Specifically designed to work with MCP messages over SSE. |

## Common Pitfalls

### Pitfall 1: Authentication for MCP
**What goes wrong:** Exposing MCP tools without authentication.
**How to avoid:** Apply the existing `apiKeyAuth` middleware to the MCP endpoints. Note that SSE connections may require passing the API key as a query parameter if headers are not supported by the client.

### Pitfall 2: Response Formatting
**What goes wrong:** Returning raw JSON instead of the MCP-compliant `CallToolResult`.
**How to avoid:** Use the SDK's response structures to ensure LLMs can correctly parse the tool output.

### Pitfall 3: SSE Connection Timeouts
**What goes wrong:** Express or reverse proxies might close long-lived SSE connections.
**How to avoid:** Ensure `server.timeout` is sufficient and potentially implement keep-alive if the SDK doesn't handle it automatically.

## Code Examples

### SSE Server Setup
```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");

const mcpServer = new Server({
  name: "magnetize",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

let mcpTransport;

app.get("/mcp", async (req, res) => {
  mcpTransport = new SSEServerTransport("/mcp/messages", res);
  await mcpServer.connect(mcpTransport);
});

app.post("/mcp/messages", async (req, res) => {
  await mcpTransport.handlePostMessage(req, res);
});
```

## Sources

### Primary (HIGH confidence)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [@modelcontextprotocol/sdk GitHub](https://github.com/modelcontextprotocol/sdk)
