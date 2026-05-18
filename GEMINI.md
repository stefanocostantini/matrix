# Project Instructions: Matrix Web App

This file contains the foundational mandates and conventions for the Matrix project.

## Project Scope
- **App:** Eisenhower Matrix Task Manager.
- **Users:** Multi-user support with secure authentication.
- **Persistence:** Supabase (Remote Database + Real-time Sync).

## Tech Stack
- **Frontend:** Vanilla HTML/JavaScript
- **Styling:** Vanilla CSS (Monospace/Technical Aesthetic)
- **Backend:** Supabase (Auth, Database, Real-time)
- **Libraries:** Supabase JS SDK (CDN)

## Database Schema (Supabase)
Table: `tasks`
- `id`: int8 (Primary Key, Identity)
- `created_at`: timestamptz (Default: now())
- `title`: text (Uppercase convention in UI)
- `quadrant`: text (Values: `urgent_important`, etc.)
- `completed`: bool (Default: false)
- `user_id`: uuid (References `auth.users.id`, Default: `auth.uid()`)

## Architectural Patterns
- **Authentication:** Supabase Auth (Email/Password). UI toggles between `#auth-container` and `#main-app`.
- **State Management:** Local `tasks` array kept in sync with Supabase via Real-time subscriptions, initialized per-user.
- **Security:** Row Level Security (RLS) ensures users only access their own data.
- **Optimistic Updates:** UI updates immediately on drag-and-drop and completion toggles.
- **Initialization:** `onAuthStateChange` -> `fetchTasks` -> `setupDragAndDrop` -> `setupRealtimeSubscription`.

## Conventions
- **Naming:** CamelCase for JS variables, kebab-case for CSS classes.
- **Styling:** Brutalist/Technical aesthetic. Monospace fonts (`Courier New`). No border-radius. Thick borders (2px).
- **Data Integrity:** Task titles are converted to UPPERCASE on submission.
- **Supabase Configuration:** Use `var` and `window.supabaseClient` checks to prevent redeclaration errors during hot-reloading.

## Development Notes
- **Local Server:** Must serve via HTTP/HTTPS for Supabase Realtime (WebSockets) to function. Use `npx serve`, `python3 -m http.server`, or a similar tool.
- **Sync Status:** UI includes a sync status indicator (`ONLINE`, `SYNCING`, `OFFLINE`).

## Current Implementation State
- [x] Basic Eisenhower Grid layout.
- [x] Task creation with quadrant selection.
- [x] Task completion toggle.
- [x] Task deletion.
- [x] Drag-and-drop between quadrants.
- [x] Supabase integration (Fetch & Real-time).
- [x] Supabase Auth integration (Multi-user support).

## Roadmap / Next Steps
- [ ] **Task Editing:** Allow clicking on a task text to rename it.
- [ ] **Sorting:** Allow reordering tasks within a quadrant.
- [ ] **Mobile Optimization:** Improve the drag-and-drop experience on touch devices.
- [ ] **Dark Mode:** Add a toggle for dark/light themes.
- [ ] **Multiple Lists:** Support different matrices (e.g., "Work", "Personal").
