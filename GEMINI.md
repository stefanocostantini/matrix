# Project Instructions: Matrix Web App

This file contains the foundational mandates and conventions for the Matrix project.

## Project Scope
- **App:** Eisenhower Matrix Task Manager.
- **Users:** Single-user (no auth system).
- **Persistence:** Required for tasks and matrix positions.

## Tech Stack
- **Frontend:** Vanilla HTML/JavaScript
- **Styling:** Vanilla CSS
- **Backend:** None (Serverless)
- **Persistence:** Local Storage

## Conventions
- Use standard HTML5/JS/CSS.
- No external libraries or frameworks.
- Persistence is handled via the browser's Local Storage API (Legacy) or Supabase (Current).

## Development Notes
- **Local Server:** Must serve via HTTP/HTTPS for Supabase Realtime (WebSockets) to function. Use `npx serve` or `python3 -m http.server`.
- **Supabase Configuration:** Use `var` and `window.supabaseClient` checks to prevent redeclaration errors during hot-reloading or multiple script loads.
