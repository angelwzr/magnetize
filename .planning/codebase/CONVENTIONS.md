# Coding Conventions

**Analysis Date:** 2026-03-15

## General Principles

- **Privacy First:** Ensure no torrent metadata is stored server-side.
- **Simplicity:** Keep the codebase minimalistic and easy to deploy.
- **Security:** Rigorous validation of external inputs (SSRF protection, file size limits).

## JavaScript Style

**Module System:**
- Backend: CommonJS (`require`/`module.exports`).
- Frontend: Standard script loading (global scope or modularized via `app.js`).

**Naming:**
- Files: `camelCase.js`.
- Variables/Functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` (e.g., `PORT`).
- Classes/Constructors: `PascalCase`.

**Formatting:**
- Indentation: 4 spaces.
- Quotes: Single quotes for strings (`'string'`).
- Semicolons: Required.

**Async/Await:**
- Prefer `async`/`await` over raw Promises or callbacks for readability.

## Documentation

- Use JSDoc for function headers, especially in `lib/` and `public/js/`.
- Include `@param` and `@returns` tags for all public service functions.
- Comments should explain "why", not "what" (unless the code is complex).

## Error Handling

**Backend:**
- Use `try/catch` blocks in async route handlers and service methods.
- Log errors to `console.error` with descriptive messages.
- Return user-friendly error messages in JSON responses.

**Frontend:**
- Use `try/catch` for API calls.
- Display errors to the user using UI alerts or dedicated status areas.

## API Design

- Endpoints should return JSON.
- Use appropriate HTTP status codes (200, 400, 500).
- Standard error response format: `{ error: "Description" }`.

## CSS Styling

- Prefer Vanilla CSS (no frameworks detected).
- Use CSS variables for theme-able properties (colors, fonts).
- Follow a simple BEM-like or semantic naming convention for classes.

---

*Conventions analysis: 2026-03-15*
*Update when standards evolve*
