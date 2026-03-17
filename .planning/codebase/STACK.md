# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- JavaScript (Node.js) - All backend logic and frontend app logic.

**Secondary:**
- HTML/CSS - Minimalistic frontend UI.

## Runtime

**Environment:**
- Node.js - Backend execution environment.
- Web Browser - Frontend execution.

**Package Manager:**
- npm - Dependency management.
- Lockfile: `package-lock.json` is present in the filesystem but gitignored (unusual pattern).

## Frameworks

**Core:**
- Express 4.18.2 - Web server and API routing.

**Testing:**
- Jest 30.3.0 - Test runner and assertion library.
- Supertest 7.2.2 - API integration testing.

**Build/Dev:**
- Babel 7.29.x - JavaScript transpilation for Jest.
- nodemon 3.0.x - Development server with auto-reload.
- PM2 (via `ecosystem.config.js`) - Production process manager.

## Key Dependencies

**Critical:**
- `parse-torrent` 9.1.5 - Main library for parsing .torrent files and Magnet links.
- `webtorrent-health` 1.2.0 - Used for fetching seeds and peers information.
- `axios` 1.6.0 - HTTP client for fetching torrent data from URLs.

**Infrastructure:**
- `helmet` 8.0.0 - Security headers for Express.
- `cors` 2.8.5 - Cross-Origin Resource Sharing.
- `express-fileupload` 1.5.0 - Middleware for handling file uploads.
- `ip` 2.0.1 - Used for IP validation in SSRF protection.

## Configuration

**Environment:**
- `.env` files (via `dotenv` not explicitly in dependencies, but `process.env` is used). `.env.example` provided.
- `PORT` and `NODE_ENV` are the main environment variables.

**Build:**
- `babel.config.js` - Configures Babel for Jest.
- `jest.config.js` - Configures the Jest test runner.
- `Dockerfile` & `docker-compose.yml` - Containerization configuration.

## Platform Requirements

**Development:**
- Node.js installation (LTS recommended).
- Docker (optional, for containerized development).

**Production:**
- Any platform capable of running Node.js or Docker.
- Port 3000 (default) exposed for traffic.

---

*Stack analysis: 2026-03-15*
*Update after major dependency changes*
