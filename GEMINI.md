# Matrix Project & Developer Instructions

Welcome, developer! This is the source-of-truth document for the **Matrix (Eisenhower Task Manager)** project. It details the project's technical specifications, UI design guidelines, file layout, codebase deep-dive, database structures, and strict programming rules to ensure absolute consistency and robust development.

---

## 🚀 1. Project Context & Vision
The **Matrix** is a distraction-free, ultra-minimalist Eisenhower Matrix Task Manager designed for deep work.
*   **Core Concept**: Organizes tasks into a 2x2 grid based on **Urgency** and **Importance**.
*   **Brutalist / Technical Monospace Aesthetic**: Raw, technical, high-contrast, black-and-white, zero border-radius, monospace typography, and thick borders.
*   **Key Features**: Secure multi-user login, responsive layout, drag-and-drop organization, and database-level real-time state synchronization via Supabase.

---

## 🛠️ 2. Technology Stack & CDN Resources
*   **Frontend**: Vanilla HTML5, Vanilla JavaScript (ES6+).
*   **Styling**: Pure Vanilla CSS3 (Strictly *no* frameworks or TailwindCSS).
*   **Backend/Database**: Supabase.
*   **Realtime**: Postgres CDC via WebSockets (Supabase JS SDK).
*   **CDN Imports**:
    *   Supabase JS SDK: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
    *   Fonts: Standard monospace stacks (`Courier New`, `Courier`, `Monaco`, monospace).

---

## 💾 3. Database Schema (`tasks` table)
| Column Name | Data Type | Default Value | Constraints / Details |
| :--- | :--- | :--- | :--- |
| `id` | `int8` (bigint) | *Generated Identity* | Primary Key |
| `created_at` | `timestamptz` | `now()` | Audit timestamp |
| `title` | `text` | *None* | Must be uppercase in the database / UI |
| `quadrant` | `text` | *None* | Allowed values: `urgent_important`, `not_urgent_important`, `urgent_not_important`, `not_urgent_not_important` |
| `completed` | `boolean` | `false` | Status of task completion |
| `user_id` | `uuid` | `auth.uid()` | Foreign key to `auth.users.id` with CASCADE delete |

---

## 🏛️ 4. Core Architecture & Life Cycle
```
[Page Load] ──> [onAuthStateChange Listener]
                      │
           ┌──────────┴──────────┐
      [No Session]          [Active Session]
           │                     │
      Show Login/Signup     1. Show Main App
                            2. Fetch Tasks (fetchTasks())
                            3. Bind drag-and-drop events (setupDragAndDrop())
                            4. Subscribe to Real-time (setupRealtimeSubscription())
```

### ⚡ State & Event Loop Synchronization:
1.  **Optimistic Updates**: When completing or dragging/dropping a task, immediately update the DOM and state locally. Then fire the Supabase asynchronous query. Revert the local changes *only* if the network request fails.
2.  **Real-time Event De-duplication**: When an insert or update occurs locally, we append/modify the local state first. The real-time listener will receive the broadcast. Use `tasks.some(t => t.id === newRecord.id)` checks to prevent duplicating elements in the DOM.
3.  **Supabase Client Safety**: During hot reloads or multiple script evaluations, safeguard the Supabase instance using `var` and checking `typeof window.supabaseClient === 'undefined'`.

---

## 🎨 5. Design System & CSS Mandates (Strict Brutalist Monospace)
*   **Zero Border Radius**: Never use `border-radius`. Force reset using `border-radius: 0 !important;`.
*   **Typography**: Monospace exclusively: `font-family: 'Courier New', Courier, monospace;`.
*   **Color Palette**: Raw high contrast:
    *   Background: `#ffffff`
    *   Text: `#000000`
    *   Borders: Solid `2px` black.
    *   Selection highlights or hovering should invert colors (background black, text white) or use light/dark accents.
*   **Drag States**: Apply `.drag-over` to the receiving quadrant to give a dashed border style `outline: 2px dashed black;` and a light grey background `#f0f0f0`.

---

## 📂 6. Repository Map
*   [index.html](file:///Users/sc/code/matrix/index.html): Document structure containing `#auth-container` and `#main-app`.
*   [style.css](file:///Users/sc/code/matrix/style.css): Main styling sheet housing the brutalist, monospace layout and grid rules.
*   [app.js](file:///Users/sc/code/matrix/app.js): App lifecycle, authentication flow, drag-and-drop execution, and real-time database interface.
*   [README.md](file:///Users/sc/code/matrix/README.md): Practical installation guide and database SQL commands.

---

## 📋 7. Roadmap & Future Improvements
When implementing future items, check them off below:
*   [ ] **Task Editing**: Clicking on a task title switches it to an inline textbox. Pressing Enter or clicking outside saves it to Supabase (and forces UPPERCASE conversion).
*   [ ] **Sorting & Reordering**: Dragging a task *within* a quadrant allows reordering. Introduce a sorting index column or update position based on list insertion.
*   [ ] **Mobile Touch Support**: Add touch events (`touchstart`, `touchmove`, `touchend`) to polyfill HTML5 drag-and-drop on mobile.
*   [ ] **Theme Toggle (Dark/Light)**: Let users toggle high-contrast light mode to high-contrast dark mode (e.g. background `#000000`, text `#ffffff`, border `#ffffff`).
*   [ ] **Multiple Boards/Lists**: Allow creating named matrices (e.g., "Personal", "Work") from a dropdown or sidebar.
