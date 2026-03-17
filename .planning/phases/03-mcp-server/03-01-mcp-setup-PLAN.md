---
wave: 1
depends_on: []
files_modified: [package.json, server.js]
autonomous: true
---

# Plan: MCP SDK Setup and SSE Endpoints

## Goal
Install the Model Context Protocol SDK and set up the base SSE server with the required endpoints in `server.js`.

## Tasks

<task id="1" name="Install MCP SDK">
Install the official Model Context Protocol SDK.

```bash
npm install @modelcontextprotocol/sdk
```

<verify>
package.json contains @modelcontextprotocol/sdk in dependencies.
</verify>
</task>

<task id="2" name="Initialize MCP Server in server.js" depends_on="1">
Import the necessary classes from the SDK and initialize a new MCP Server instance.

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
```

<verify>
server.js has the MCP Server initialized.
</verify>
</task>

<task id="3" name="Implement SSE Endpoints" depends_on="2">
Implement the `/mcp` (GET) and `/mcp/messages` (POST) endpoints in `server.js`.
Ensure they use the `apiKeyAuth` middleware and `machineLimiter`.

```javascript
let mcpTransport;

app.get('/mcp', machineLimiter, apiKeyAuth, async (req, res) => {
    mcpTransport = new SSEServerTransport("/mcp/messages", res);
    await mcpServer.connect(mcpTransport);
});

app.post('/mcp/messages', machineLimiter, apiKeyAuth, async (req, res) => {
    if (!mcpTransport) {
        return res.status(400).json({ error: "No active MCP transport" });
    }
    await mcpTransport.handlePostMessage(req, res);
});
```

<verify>
The /mcp and /mcp/messages routes are implemented and protected by authentication.
</verify>
</task>

## must_haves

Goal: MCP Server with SSE transport is active and accessible.

- [ ] @modelcontextprotocol/sdk is installed.
- [ ] MCP Server is initialized with correct metadata.
- [ ] GET /mcp establishes SSE connection.
- [ ] POST /mcp/messages handles MCP client messages.
- [ ] Both endpoints are protected by API key authentication.
