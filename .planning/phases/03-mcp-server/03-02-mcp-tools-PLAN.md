---
wave: 2
depends_on: [03-01-mcp-setup-PLAN.md]
files_modified: [server.js]
autonomous: true
---

# Plan: MCP Tool Registration and Logic

## Goal
Implement and register the `inspect_torrent` and `convert_to_magnet` MCP tools, leveraging the existing `torrentService.js`.

## Tasks

<task id="1" name="Register inspect_torrent tool">
Define and register the `inspect_torrent` tool in the MCP server.
It should take a `url` parameter and return full metadata by calling `torrentService.handleTorrentSource(url, isMagnet, { skipHealth: false })`.

```javascript
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "inspect_torrent",
      description: "Inspect a torrent URL or Magnet URI for full metadata (seeds, peers, files).",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "The torrent URL or Magnet URI." },
        },
        required: ["url"],
      },
    },
    // ...
  ],
}));
```

<verify>
inspect_torrent is registered as an MCP tool.
</verify>
</task>

<task id="2" name="Register convert_to_magnet tool" depends_on="1">
Define and register the `convert_to_magnet` tool.
It should take a `url` and return the magnet URI by calling `torrentService.handleTorrentSource(url, isMagnet, { skipHealth: true })`.

<verify>
convert_to_magnet is registered as an MCP tool.
</verify>
</task>

<task id="3" name="Implement Tool Request Handler" depends_on="2">
Implement the `CallToolRequestSchema` handler in `server.js` to route tool calls to the appropriate service calls.

```javascript
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const isMagnet = args.url.startsWith('magnet:');
  
  if (name === "inspect_torrent") {
    const result = await torrentService.handleTorrentSource(args.url, isMagnet, { skipHealth: false });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
  
  if (name === "convert_to_magnet") {
    const result = await torrentService.handleTorrentSource(args.url, isMagnet, { skipHealth: true });
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
            magnet: result.magnetUri,
            infoHash: result.infoHash,
            name: result.name
        }, null, 2) 
      }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

<verify>
Tool calls are correctly handled and return the expected output format.
</verify>
</task>

## must_haves

Goal: MCP tools are functional and integrated with `torrentService.js`.

- [ ] inspect_torrent tool is registered and returns full metadata.
- [ ] convert_to_magnet tool is registered and returns simplified magnet data.
- [ ] Tools correctly handle both Torrent URLs and Magnet URIs.
- [ ] Tools leverage torrentService.js for all processing.
- [ ] Tool output is formatted as valid CallToolResult (text content).
