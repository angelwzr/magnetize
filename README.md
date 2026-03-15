# 🧲 Magnetize

Magnetize is a minimalistic, modern, and privacy-focused torrent metadata extractor. It allows users to upload `.torrent` files or provide URLs/Magnet links to fetch metadata, view file contents, and check for real-time seeds/peers.

Designed for self-hosting, it performs all metadata fetching and health checks on the server side, keeping the user's IP hidden from trackers and remote hosts.

## ✨ Features

- **Modern & Minimal UI**: A clean, system-adaptive interface that respects your OS theme.
- **Theme Support**: Built-in Light, Dark, and System theme switching (stored locally).
- **Auto-Preview**: Extracts metadata immediately upon file selection or URL entry.
- **Health Check**: Real-time seeds and peers count via server-side scraping.
- **Visual Analytics**: File type distribution chart powered by a self-hosted Chart.js.
- **Technical Details**: Detailed metadata report including Piece Size, Private Flags, Web Seeds, and a full Trackers list.
- **Privacy First**: 
    - **Zero Tracking**: No external fonts, analytics, or scripts.
    - **No Cookies**: UI preferences are stored in `localStorage` only.
    - **In-Memory**: Uploaded files are processed in RAM and never written to disk.
    - **Strict CSP**: A locked-down Content Security Policy to prevent data leaks.
    - **SSRF Protection**: Hardened egress filtering for server-side fetches.
- **Privacy Trade-off (Server Visibility)**: To protect the end-user's IP, all fetching and scraping are performed by the server. This means the **server's IP** is visible to trackers and remote hosts. Self-hosters who want complete anonymity should run Magnetize behind a VPN.
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

## 🧪 Development & Testing

### Installation
```bash
npm install
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

## 🔄 Updating Dependencies

### Backend
Most backend libraries use caret ranges (`^`) and can be updated using:
```bash
npm update
```
**Note:** `parse-torrent` is pinned to `9.1.5` to maintain CommonJS compatibility. Do not upgrade this to `10.x+` without migrating the server to ES Modules.

### Frontend
To maintain privacy, frontend libraries are self-hosted. To update **Chart.js**, download the latest version directly:
```bash
curl -o public/js/chart.js https://cdn.jsdelivr.net/npm/chart.js
```

### Docker
After updating `package.json`, ensure you rebuild your containers to apply changes:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## 🛠️ Built With

### Backend
- **[Express](https://expressjs.com/)**: Fast, minimalist web framework.
- **[Parse-Torrent](https://github.com/webtorrent/parse-torrent)**: Robust metadata extraction.
- **[WebTorrent Health](https://github.com/webtorrent/webtorrent-health)**: Real-time peer tracking.
- **[Helmet](https://helmetjs.github.io/)**: Secure Express apps with essential HTTP headers.
- **[ip](https://github.com/indutny/node-ip)**: IP address utilities for SSRF protection.

### Frontend
- **[Chart.js](https://www.chartjs.org/)**: Visual data distribution (Localized/Self-hosted).
- **Vanilla JavaScript**: Modern, modular ES6 client logic.

## 📜 License & Author

Built with ❤️ by **Roman Linev**.  
Licensed under the **MIT License**. &copy; 2026.
