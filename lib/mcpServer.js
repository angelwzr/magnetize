const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const torrentService = require("./torrentService");

/**
 * Encapsulates MCP Server logic and tool registrations.
 */
class McpServerManager {
    constructor() {
        this.server = new Server({
            name: "magnetize",
            version: "1.1.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }

    /**
     * Registers MCP request handlers for tools.
     */
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
                {
                    name: "convert_to_magnet",
                    description: "Convert a torrent URL or Magnet URI to a magnet link and info hash.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            url: { type: "string", description: "The torrent URL or Magnet URI." },
                        },
                        required: ["url"],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            if (!args || !args.url) {
                throw new Error("Missing 'url' argument");
            }

            const isMagnet = args.url.startsWith('magnet:');

            if (name === "inspect_torrent") {
                const result = await torrentService.handleTorrentSource(args.url, isMagnet);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            if (name === "convert_to_magnet") {
                const result = await torrentService.handleTorrentSource(args.url, isMagnet);
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
    }

    /**
     * Connects the server to a transport.
     * @param {import("@modelcontextprotocol/sdk/server/sse.js").SSEServerTransport} transport 
     */
    async connect(transport) {
        await this.server.connect(transport);
    }

    /**
     * Closes the MCP server connection.
     */
    async close() {
        await this.server.close();
    }
}

module.exports = new McpServerManager();
