# 🧲 Magnetize

Magnetize is a minimalistic, modern, and privacy-focused torrent metadata extractor. It allows users to upload `.torrent` files or provide URLs/Magnet links to fetch metadata, view file contents, and check for real-time seeds/peers.

Designed for self-hosting, it performs all metadata fetching and health checks on the server side, keeping the user's IP hidden from trackers and remote hosts.

## ✨ Features

- **Modern & Minimal UI**: A clean, system-adaptive interface that respects your OS theme. Fully responsive with touch-friendly targets.
- **Health Check**: Real-time seeds and peers count via server-side scraping.
- **Visual Analytics**: File type distribution chart powered by a self-hosted Chart.js.
- **Technical Details**: Detailed metadata report including Piece Size, Private Flags, Web Seeds, and a full Trackers list.
- **Proxy Support**: Configure HTTP/HTTPS proxy for server-side requests.
- **Privacy First**: 
    - **Zero Tracking**: No external fonts, analytics, or scripts.
    - **No Cookies**: UI preferences are stored in `localStorage` only.
    - **In-Memory**: Uploaded files are processed in RAM and never written to disk.
    - **Strict CSP**: A locked-down Content Security Policy to prevent data leaks.

---

## 🚀 Self-Hosting Guide

Magnetize is designed to be exceptionally easy to self-host.

### Option 1: Using Docker (Recommended)

The easiest way to get started is with Docker Compose. The image includes a built-in health check.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/magnetize.git
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
Set the `PORT` environment variable to change the default port (3000):
```bash
PORT=8080 npm start
```

### Proxy Configuration
Configure an HTTP/HTTPS proxy for server-side requests (useful for privacy or bypassing restrictions):
```bash
# .env file
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1
# Optional authentication
PROXY_USERNAME=user
PROXY_PASSWORD=pass
```

### Reverse Proxy (Nginx)
The app is built with `trust proxy` enabled for seamless integration with Nginx, Traefik, or Caddy.

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 🔌 Programmatic Access (REST API)

Magnetize provides a secured REST API for automation. Enable it in your `.env` file.

### Feature Flags

```bash
# .env file
ENABLE_API=true    # Enable REST API (default: true)
API_KEY=your_key  # Your API key (auto-generated if not set)
```

### Authentication
All API requests must include the `X-API-KEY` header. If not set, a random key is auto-generated on startup and shown in the console.

### REST API
- **Endpoint**: `POST /api/torrent`
- **Upload file**: `curl -X POST http://localhost:3000/api/torrent -H "X-API-Key: your_key" -F "file=@file.torrent"`
- **From URL**: `curl -X POST "http://localhost:3000/api/torrent?url=https://example.com/file.torrent" -H "X-API-Key: your_key"`
- **Magnet link**: `curl -X POST "http://localhost:3000/api/torrent?url=magnet:?xt=urn:btih:..." -H "X-API-Key: your_key"`

---

## 🛠️ Built With

Magnetize is built with high-quality open-source software:

### Backend
- **[Express](https://expressjs.com/)**: Fast, minimalist web framework.
- **[Parse-Torrent](https://github.com/webtorrent/parse-torrent)**: Robust metadata extraction.
- **[WebTorrent Health](https://github.com/webtorrent/webtorrent-health)**: Real-time peer tracking.
- **[Helmet](https://helmetjs.github.io/)**: Secure Express apps with essential HTTP headers.

### Frontend
- **[Chart.js](https://www.chartjs.org/)**: Visual data distribution (Localized/Self-hosted).
- **Vanilla JavaScript**: Modern, zero-dependency client logic.

## 📜 License & Author

Built with ❤️ by **Roman Linev**.  
Licensed under the **MIT License**. &copy; 2026.
