# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
magnetize/
├── .planning/           # GSD planning and documentation
├── lib/                 # Backend business logic and utilities
│   ├── torrentService.js # Core torrent parsing and health checking
│   └── utils.js          # Shared backend utilities (e.g., formatBytes)
├── public/              # Static frontend assets
│   ├── favicon.svg      # App icon
│   ├── index.html       # Single-page application template
│   ├── styles.css       # App styling
│   └── js/              # Client-side JavaScript
│       ├── api.js       # Client API interaction logic
│       ├── app.js       # Main frontend entry point
│       ├── chart.js     # Health data visualization (placeholder?)
│       ├── theme.js     # Theme switching logic
│       ├── ui.js        # DOM manipulation and results display
│       └── utils.js     # Client-side utilities (identical to lib/utils.js)
├── tests/               # Test suite
│   ├── api.test.js      # API endpoint integration tests
│   ├── torrentService.test.js # Core service unit tests
│   ├── ui.test.js       # Basic UI logic tests
│   └── utils.test.js    # Utility function unit tests
├── .env.example         # Environment variable template
├── Dockerfile           # Container definition
├── ecosystem.config.js  # PM2 process configuration
├── package.json         # Project manifest and dependencies
├── README.md            # Documentation
└── server.js            # Express server entry point and routes
```

## Directory Purposes

**.planning/codebase/**
- Purpose: Detailed technical documentation about the codebase.
- Contains: Markdown files documenting stack, architecture, conventions, etc.

**lib/**
- Purpose: Backend service logic.
- Contains: Business logic independent of the Express transport layer.
- Key files: `torrentService.js`.

**public/**
- Purpose: Frontend single-page application.
- Contains: Static files served by Express.
- Key files: `index.html`, `js/app.js`.

**tests/**
- Purpose: Quality assurance.
- Contains: Jest test files.
- Key files: `api.test.js`.

## Key File Locations

**Entry Points:**
- `server.js`: Node.js server entry point.
- `public/js/app.js`: Frontend application entry point.

**Configuration:**
- `package.json`: Project dependencies and scripts.
- `babel.config.js`: Babel configuration for test transpilation.
- `jest.config.js`: Test runner configuration.
- `.env.example`: Environment configuration template.

**Core Logic:**
- `lib/torrentService.js`: Main logic for torrent metadata extraction.
- `server.js`: API route definitions.

## Naming Conventions

**Files:**
- `camelCase.js` for both backend and frontend JavaScript files.
- `kebab-case.yml` / `kebab-case.js` for some configuration files.
- `UPPERCASE.md` for project-level documentation.

**Directories:**
- `camelCase` or `kebab-case` (e.g., `node_modules`, `public/js`).

## Where to Add New Code

**New API Endpoint:**
- Definition and Handler: `server.js`.
- Core Logic: `lib/torrentService.js` (if torrent-related).
- Tests: `tests/api.test.js`.

**New Frontend Feature:**
- DOM interaction: `public/js/ui.js`.
- Logic/Event handling: `public/js/app.js`.
- Styles: `public/styles.css`.

**New Utility:**
- Shared: Add to both `lib/utils.js` and `public/js/utils.js` (keep in sync).
- Backend only: `lib/utils.js`.
- Frontend only: `public/js/utils.js`.

## Special Directories

**.desloppify/**
- Purpose: Internal tooling for codebase quality/management?
- Committed: Yes.

**node_modules/**
- Purpose: Installed npm dependencies.
- Committed: No (gitignored).

---

*Structure analysis: 2026-03-15*
*Update when directory structure changes*
