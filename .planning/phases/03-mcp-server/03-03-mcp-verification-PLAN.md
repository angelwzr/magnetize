---
wave: 3
depends_on: [03-02-mcp-tools-PLAN.md]
files_modified: [tests/mcp.test.js]
autonomous: true
---

# Plan: MCP Verification and E2E Tests

## Goal
Establish verification criteria and implement automated tests for the MCP server and its tools over SSE transport.

## Tasks

<task id="1" name="Create MCP E2E test file">
Create `tests/mcp.test.js` to house E2E tests for the MCP server.
The tests will use an MCP client to connect to the running Express server and call tools.

```javascript
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
// ... setup test ...
```

<verify>
tests/mcp.test.js is created.
</verify>
</task>

<task id="2" name="Test SSE Connection" depends_on="1">
Implement a test case that establishes an SSE connection to `/mcp`.
Ensure it handles the `API_KEY` authentication correctly (e.g., via query parameter if headers are not supported by the SSE client, or via headers if they are).

<verify>
Test Case: SSE connection is successfully established.
</verify>
</task>

<task id="3" name="Test inspect_torrent Tool" depends_on="2">
Implement a test case that calls the `inspect_torrent` tool with a sample magnet link or torrent URL.
Verify that the output contains the expected metadata (e.g., infoHash, seeds, peers).

<verify>
Test Case: inspect_torrent returns correct metadata for a valid source.
</verify>
</task>

<task id="4" name="Test convert_to_magnet Tool" depends_on="3">
Implement a test case that calls the `convert_to_magnet` tool.
Verify that the output contains the simplified magnet object.

<verify>
Test Case: convert_to_magnet returns simplified magnet data.
</verify>
</task>

<task id="5" name="Test MCP Security" depends_on="4">
Implement a test case that attempts to connect to `/mcp` without a valid API key.
Ensure it receives a 401 Unauthorized response.

<verify>
Test Case: MCP endpoints are secured by authentication.
</verify>
</task>

## must_haves

Goal: MCP functionality is fully verified and documented.

- [ ] SSE transport connectivity is verified.
- [ ] Tool list is correctly returned by the server.
- [ ] `inspect_torrent` tool returns correct data for various sources.
- [ ] `convert_to_magnet` tool returns correct data.
- [ ] Authentication is enforced for MCP endpoints.
- [ ] Rate limiting is verified for MCP endpoints.
