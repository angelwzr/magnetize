const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const { app } = require("../server");
const torrentService = require("../lib/torrentService");

jest.mock("../lib/torrentService");

describe("MCP SSE Server", () => {
    let server;
    let baseUrl;
    const apiKey = "test-mcp-api-key-1234567890123456";
    let originalApiKey;

    beforeAll((done) => {
        originalApiKey = process.env.API_KEY;
        process.env.API_KEY = apiKey;
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}`;
            done();
        });
    });

    afterAll((done) => {
        process.env.API_KEY = originalApiKey;
        server.close(done);
    }, 10000);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Full MCP Lifecycle", async () => {
        const transport = new SSEClientTransport(new URL(`${baseUrl}/mcp?apiKey=${apiKey}`));
        const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

        await client.connect(transport);

        // 1. List Tools
        const tools = await client.listTools();
        expect(tools.tools.length).toBeGreaterThan(0);
        expect(tools.tools.map(t => t.name)).toContain("inspect_torrent");

        // 2. Call inspect_torrent
        const mockInspectResult = {
            name: "Test",
            infoHash: "abc",
            magnetUri: "magnet:?xt=urn:btih:abc",
            files: []
        };
        torrentService.handleTorrentSource.mockResolvedValue(mockInspectResult);

        const inspectRes = await client.callTool({
            name: "inspect_torrent",
            arguments: { url: "http://example.com/test.torrent" }
        });

        expect(inspectRes.content[0].text).toContain("magnet:?xt=urn:btih:abc");

        // 3. Call convert_to_magnet
        const mockConvertResult = {
            name: "Def",
            infoHash: "def",
            magnetUri: "magnet:?xt=urn:btih:def"
        };
        torrentService.handleTorrentSource.mockResolvedValue(mockConvertResult);

        const convertRes = await client.callTool({
            name: "convert_to_magnet",
            arguments: { url: "magnet:?xt=urn:btih:def" }
        });

        const convertContent = JSON.parse(convertRes.content[0].text);
        expect(convertContent.magnet).toBe("magnet:?xt=urn:btih:def");
        expect(convertContent.infoHash).toBe("def");

        await client.close();
    }, 20000);
});
