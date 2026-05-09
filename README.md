# Eisenhower Matrix Task Manager

A minimalist, high-contrast task manager based on the Eisenhower Matrix, designed with a focus on deep work and priority management.

## Features

- **Typewriter Aesthetic**: A strict black & white design using monospace typography for a distraction-free experience.
- **Draggable Tasks**: Easily move tasks between the four quadrants:
  - **DO NOW**: Urgent & Important
  - **SCHEDULE**: Important, Not Urgent
  - **DELEGATE**: Urgent, Not Important
  - **ELIMINATE**: Neither Urgent nor Important
- **Cloud Sync (Supabase)**: Data is stored in a cloud database, allowing you to access your matrix across multiple devices.
- **Real-time Synchronization**: Changes made on one device are instantly reflected on all other devices without a page refresh.
- **Sync Indicator**: Visual feedback showing connection status and active synchronization.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript.
- **Backend/Database**: Supabase (PostgreSQL + Realtime).
- **SDK**: Supabase JS Client via CDN.

## Setup & Local Development

### Prerequisites

- A [Supabase](https://supabase.com/) account.
- A Supabase project created.

### Database Setup

1. Create a table named `tasks` in your Supabase project.
2. Add the following columns:
   - `id`: `int8` (Primary Key, Identity)
   - `title`: `text`
   - `quadrant`: `text`
   - `completed`: `boolean` (Default: `false`)
3. **Enable Realtime**: Go to **Database -> Replication** in the Supabase dashboard and ensure the `realtime` publication includes the `tasks` table.
4. **RLS (Policies)**: Ensure your table has appropriate Row Level Security policies or disable RLS for testing (Authentication -> Policies).

### Configuration

The app is pre-configured to use the provided Supabase project URL and anon key. To use your own, update the following constants in `app.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## How to Use

1. **Add a Task**: Enter a task description in the input field, select the initial quadrant, and click "ADD TASK".
2. **Prioritize**: Drag and drop tasks between quadrants as priorities shift.
3. **Complete**: Click the checkbox to mark a task as completed (it will become struck through).
4. **Delete**: Click the "×" button to permanently remove a task.
5. **Sync**: Watch the `[ ONLINE ]` indicator in the header; it will flash `SYNCING` when updates are received from other devices.

## Design Inspiration

The design is inspired by minimalist hand-drawn sketches on dot grid paper, utilizing thick borders and typewriter-style fonts to emphasize clarity and simplicity.
