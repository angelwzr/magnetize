# 🧲 Magnetize

**[Live Demo](https://magnetize.onrender.com/)**

Magnetize is a minimalistic, modern, and privacy-focused torrent metadata extractor. It allows users to upload `.torrent` files or provide URLs/Magnet links to fetch metadata, view file contents, and check for real-time seeds/peers.

Designed for self-hosting, it performs all metadata fetching and health checks on the server side, keeping the user's IP hidden from trackers and remote hosts.

## ✨ Features

- **Modern & Minimal UI**: A clean, system-adaptive interface with built-in Light, Dark, and System theme switching (stored locally).
- **Health Check**: Real-time seeds and peers count via server-side scraping.
- **Visual Analytics**: File type distribution chart powered by a self-hosted Chart.js.
- **Technical Details**: Detailed metadata report including Piece Size, Private Flags, Web Seeds, and a full Trackers list.
- **Programmatic API**: Specialized endpoints for machine-friendly metadata extraction and magnet conversion.
- **MCP Server**: Built-in Model Context Protocol server for AI agent integration (Claude, Gemini, etc.).
- **Privacy First**: 
    - **Zero Tracking**: No external fonts, analytics, or scripts.
    - **No Cookies**: UI preferences are stored in `localStorage` only.
    - **In-Memory**: Uploaded files are processed in RAM and never written to disk.
    - **Strict CSP**: A locked-down Content Security Policy to prevent data leaks.
    - **SSRF Protection**: Hardened egress filtering for server-side fetches.

> **Privacy Note (Server Visibility)**: To protect the end-user's IP, all fetching and scraping are performed by the server. This means the **server's IP** is visible to trackers and remote hosts. Self-hosters who want complete anonymity should run Magnetize behind a VPN.

- **Mobile Optimized**: Fully responsive design with touch-friendly targets.

---

## 🚀 Self-Hosting Guide

Magnetize is designed to be exceptionally easy to self-host.

### Option 1: Using Docker (Recommended)

The easiest way to get started is with Docker Compose. The image runs as a non-privileged user and includes a built-in health check.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/angelwzr/magnetize.git
   cd magnetize
   ```

2. **Start the container**:
   ```bash
   docker-compose up -d
   ```

3. **Access the app**:
   Open `http://localhost:3000`.

### Option 2: Always Running Mode (PM2)

For native Node.js hosting, use [PM2](https://pm2.keymetrics.io/) to ensure the app stays alive and restarts on crashes.

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start with PM2**:
   ```bash
   npm run serve
   ```

---

## 🛠️ Programmatic Access

Magnetize provides a secured API and MCP server for automation and AI integration.

### Authentication
Set the `API_KEY` environment variable in your `.env`. All programmatic requests must include the `X-API-KEY` header.

### REST API
- **Convert to Magnet**: `GET /api/convert?url=<link>`
- **Inspect Metadata**: `GET /api/inspect?url=<link>`

Example:
```bash
curl -H "X-API-KEY: your_key" "http://localhost:3000/api/convert?url=https://site.com/file.torrent"
```

### MCP Server (Model Context Protocol)
Connect your AI agent to Magnetize via SSE:
- **Endpoint**: `http://localhost:3000/mcp`
- **Tools**: `inspect_torrent`, `convert_to_magnet`

---

## 🧪 Development & Testing

### Rapid Setup
Get your local environment ready with a single command (Windows/PowerShell):
```powershell
./scripts/setup.ps1
```

### Running in Development
```bash
npm run dev
```

### Running Tests
The project includes a comprehensive suite of unit and integration tests using Jest and JSDOM.
```bash
npm test
```

### Continuous Integration
This project uses GitHub Actions for **Continuous Validation**. Every push and pull request triggers:
- **Multi-Version Testing**: Verified against Node.js 18, 20, and 22.
- **Docker Integrity**: Verified by an automated container build.

---

## 🚦 Which mode to choose?

| Mode | Command | Best For | Behavior |
| :--- | :--- | :--- | :--- |
| **Development** | `npm run dev` | Active coding | **Hot-reloads** on every file save |
| **Direct Run** | `npm start` | Quick testing | No auto-restart if the app crashes |
| **Always On** | `npm run serve` | Direct hosting | **Auto-restarts** via PM2 supervisor |
| **Docker** | `docker-compose up` | Isolated hosting | **Auto-restarts** via Docker daemon |

---

## 🔧 Advanced Configuration

### Port Configuration
Set the `PORT` environment variable to change the default port (3000).

### Reverse Proxy (Nginx)
The app is built with `trust proxy` enabled for seamless integration with Nginx, Traefik, or Caddy.

---

## 🔄 Updating Dependencies

Refer to the documentation for instructions on maintaining backend packages and self-hosted frontend assets.

---

## 🛠️ Built With

### Backend
- **[Express](https://expressjs.com/)**: Fast, minimalist web framework.
- **[Parse-Torrent](https://github.com/webtorrent/parse-torrent)**: Robust metadata extraction.
- **[WebTorrent Health](https://github.com/webtorrent/webtorrent-health)**: Real-time peer tracking.
- **[Helmet](https://helmetjs.github.io/)**: Secure Express apps with essential HTTP headers.
- **[Model Context Protocol](https://modelcontextprotocol.io/)**: Open standard for AI tool integration.

### Frontend
- **[Chart.js](https://www.chartjs.org/)**: Visual data distribution (Localized/Self-hosted).
- **Vanilla JavaScript**: Modern, modular ES6 client logic.

## 📜 License & Author

Built with ❤️ by **Roman Linev**.  
Licensed under the **MIT License**. &copy; 2026.
