# Event Management System (EventHub)

A full-stack PoC for creating, joining, and managing events with calendar views, tag-based discovery, and an AI assistant.

**Stack**: TypeScript · React 19 (Vite) · NestJS · PostgreSQL · Groq AI · Docker

---

## Prerequisites

- Docker 24+ with Docker Compose v2 (`docker compose`)
- Ports **80** (frontend), **3000** (backend), **5432** (database) free on localhost
- **Groq API key** (free tier at [console.groq.com](https://console.groq.com)) — required for the AI Assistant feature

---

## Quick Start
```bash
git clone https://github.com/stas5047/Application
cd Application
cp .env.example .env
cp docker/.env.example docker/.env
cp backend/.env.example backend/.env

```

**Set your Groq API key** in the **project root `.env`** (the first file you just copied). The `docker/.env` and `backend/.env` files do not need to be changed for Docker:
```bash
# In .env, find and replace the placeholder with your actual key:
# GROQ_API_KEY=your_groq_api_key_here  →  GROQ_API_KEY=gsk_your_actual_key
```

```bash
docker compose up --build -d
```

The first launch automatically runs database migrations and seeds the database.

**Access points after startup:**

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |

**Clean restart (wipe DB and reseed):**
```bash
docker compose down -v
docker compose up --build -d
```

---

## Project Structure

| Directory | Description |
|-----------|-------------|
| `backend/` | NestJS REST API (auth, events CRUD, tags, AI assistant, user endpoints) |
| `frontend/` | React SPA (Vite, Tailwind, Shadcn UI, react-big-calendar, Storybook) |
| `docker/` | Environment files and Docker configurations |
| `docs/` | SRS, supplement, roadmap |

---

## Environment Variables

Copy `.env.example` to `.env` and `docker/.env.example` to `docker/.env` (both are required).

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_HOST` | DB hostname (Docker service name — do not change for Docker) | `db` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | Database name | `event_management` |
| `JWT_SECRET` | Access token signing secret | _(set a strong secret)_ |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | _(set a strong secret)_ |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `GROQ_API_KEY` | Groq API key for AI Assistant | _(required — get free key at [console.groq.com](https://console.groq.com))_ |
| `BACKEND_PORT` | NestJS listen port | `3000` |
| `VITE_API_URL` | Backend API base URL (baked into frontend at build time) | `http://localhost:3000/api` |
| `FRONTEND_PORT` | nginx listen port | `80` |
| `FRONTEND_ORIGIN` | Allowed CORS origin for backend | `http://localhost` |
| `COOKIE_SECURE` | Controls `Secure` flag on refresh-token cookie | `false` |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Login with email + password |
| POST | `/auth/refresh` | — | Refresh access token (rotates refresh token) |
| POST | `/auth/logout` | JWT | Invalidate refresh token |
| GET | `/events` | Optional JWT | List all public events (with tags) |
| GET | `/events/:id` | Optional JWT | Event details (with tags + participants) |
| POST | `/events` | JWT | Create event (accepts `tagNames[]`) |
| PATCH | `/events/:id` | JWT (organizer) | Update event |
| DELETE | `/events/:id` | JWT (organizer) | Delete event |
| POST | `/events/:id/join` | JWT | Join event |
| POST | `/events/:id/leave` | JWT | Leave event |
| GET | `/users/me/events` | JWT | Fetch current user's events (with tags) |
| GET | `/tags` | — | List all available tags |
| POST | `/assistant/ask` | JWT | Ask AI assistant a question (rate limited: 4 req/min) |

Full interactive documentation available at **http://localhost:3000/api/docs** (Swagger UI).

---

## Seeded Test Data

The database is pre-seeded with realistic data for immediate testing:

- **5 users** (see credentials below)
- **20 events** (19 public + 1 private) spanning past, current, and future dates with realistic participation data
- **10 tags**: tech, art, business, music, sports, health, education, networking, design, devops — each event assigned 1–3 relevant tags

| Username | Email | Password |
|----------|-------|----------|
| alice_dev | alice@example.com | password1 |
| bob_builds | bob@example.com | password2 |
| carol_ux | carol@example.com | password3 |
| dan_ops | dan@example.com | password4 |
| eve_startup | eve@example.com | password5 |

> The private event ("Private Team Retrospective") is organised by `dan_ops` and is not visible in the public events list.

---

## Functionality Guide

This section describes every page and intentional behavior to help reviewers understand what was implemented and why.

### Authentication

- **Sign Up** (`/signup`): Requires username (3–30 chars, alphanumeric + underscore, unique), email (unique), and password (min 6 chars) with confirmation. On success, automatically logs in and redirects to `/events`.
- **Login** (`/login`): Email + password. Access token stored in memory (Zustand store); refresh token persisted in localStorage for session survival across page reloads.
- **Token Rotation**: On 401 responses, the Axios interceptor automatically attempts a single token refresh. If the refresh succeeds, the original request is retried transparently. The refresh token is rotated (old one invalidated) on every refresh call.
- **Logout**: Invalidates the refresh token server-side, clears all client-side state, and redirects to `/login`.
- **Auth Guard**: Authenticated users visiting `/login` or `/signup` are automatically redirected to `/events`. Unauthenticated users visiting protected routes are redirected to `/login`.

### Events Page (`/events`)

- Displays all **public events** as a responsive card grid (1 column mobile, 2 tablet, 3 desktop).
- **Search**: Real-time text filter across event titles (client-side).
- **Tag Filter**: Horizontal scrollable chip bar below search. Multi-select with OR logic — events matching **any** selected tag are shown. Combinable with search. "Clear" button resets all tag selections.
- **Event Cards** show: title, description (2-line clamp), date/time, location, participant count (`X/Y` with capacity or `X joined` without), capacity progress bar (green), and up to 3 colored tag chips (with `+N` overflow indicator).
- **Join/Leave**: Authenticated users see "Join Event" (green button) or "Leave" (outline). Unauthenticated users see "Sign in to join". Events at capacity show a disabled "Full" label.
- **Past Events**: Past events appear dimmed (`opacity-60`) with a "Past" badge. Past event cards are unclickable for non-organizers (organizers can still access to view/delete).
- **"Mine" Badge**: Events organized by the current user display a "Mine" badge on the card.
- Clicking an event card navigates to its detail page.

### Event Details Page (`/events/:id`)

- Full event information: title, description, date/time, location, capacity bar, visibility badge, and all tags as colored chips.
- **Participants List**: Avatar initials grid (first 2 characters of username, deterministic color). Shows up to 12 participants with `+N` overflow pill.
- **Organizer Controls**: Only the event creator sees "Edit" and "Delete" buttons.
- **Delete Confirmation**: A modal dialog ("Are you sure? This action cannot be undone.") prevents accidental deletion.
- **Private Event Access**: Any authenticated user can view and join a private event via its direct link — the link acts as the invitation (per SRS: "Only those invited via link can view this event"). Unauthenticated users cannot access private events.
- **Past Events**: Non-organizers are redirected away from past event details with a toast notification. Organizers can still view past events but only see the "Delete" button (no "Edit" — past events cannot be modified).
- **Back Navigation**: The back button uses browser history (`navigate(-1)`) when available, falling back to `/events` for direct URL access. If the user came from `/my-events`, they return there instead of always going to `/events`.

### Create / Edit Event (`/events/create`, `/events/:id/edit`)

- **Form Fields**: Title (required), Description (optional textarea), Tags (optional multi-select, max 5), Date & Time (calendar picker — cannot select past dates), Location (required), Capacity (optional number — omitting means unlimited), Visibility (Public/Private radio).
- **Visibility Helper Text**: Below the radio buttons — Public: "Anyone can see and join this event." / Private: "Only those invited (via link) can view this event."
- **Tag Multi-Select**: Combobox dropdown with search. Shows existing tags from the database. Displays selected tags as removable badges with an `X / 5` counter. Items disabled when max reached.
- **Validation**: Yup schemas on the frontend mirror backend DTOs. Required fields marked with red asterisks. Date must be in the future.
- **Edit Mode**: Pre-populates all fields from the existing event. Only the organizer can access the edit page (non-organizers are redirected with a toast). Past events cannot be edited (redirect + toast).
- **Clearing Fields**: When a user clears an optional field (description, capacity, or tags) during editing, the form explicitly sends `null` or `[]` to the backend — not `undefined` — so the field is actually cleared in the database.

### My Events Page (`/my-events`) — Requires Authentication

- **Calendar Views**: Month, Week, and Agenda views powered by react-big-calendar. Week starts on Monday.
- **Tag-Based Coloring**: Calendar event pills are colored by their first tag using a deterministic 10-color palette. Events without tags fall back to role-based coloring: solid indigo for organizer events, 40% opacity indigo for participant events.
- **Filters** (all combinable):
  - **Role**: All / Organizer / Participant — filter by the user's relationship to the event.
  - **Visibility**: All / Public / Private — filter by event visibility.
  - **Tags**: Same tag chip filter component as the Events page.
  - **Show Past Events**: Toggle button to include/exclude historical events from the calendar. When off (default), only current and future events are shown. Enabling it also unlocks backward navigation in the calendar.
- **Dynamic Date Range Label**: The "Today" button in the Agenda view shows the actual date range (e.g., "Mar 15 – Apr 13") instead of a static label.
- **Empty State**: When active filters exclude all events, a message "No events match your filters" is shown. When the user has no events at all, a different message encourages exploring public events.
- **Navigation**: Clicking a calendar event opens its detail page. Past participant events (where the user is not the organizer) are not clickable.

### AI Assistant (`/assistant`) — Requires Authentication

- Chat-style interface for asking natural-language questions about the user's events and public events.
- **How It Works**: The backend injects a compact JSON snapshot of the user's events (past + upcoming) and up to 50 public events (ordered by date) into the LLM prompt. The model never accesses the database directly — it answers based solely on the provided context.
- **Capabilities**:
  - Count events ("How many events do I have?")
  - List upcoming or past events ("What events am I attending this week?")
  - Filter by date range ("Show my events for next weekend")
  - Filter by tag ("List all tech events")
  - Show participants ("Who's attending the Marketing Meetup?")
  - Identify organizer's events ("List all events I organize")
  - Answer questions about public events ("Show public tech events this weekend")
- **"My" Scope**: Questions about "my events" or "I/me" are answered using only the user's own events (organized + joined), never public events the user hasn't joined.
- **Rate Limit**: 4 requests per minute per user, enforced server-side via `@nestjs/throttler`. A toast notification appears when the limit is reached.
- **Markdown Rendering**: Assistant responses support full GitHub-Flavored Markdown (tables, lists, bold, code) via ReactMarkdown + remark-gfm.
- **Fallback**: If the question is unclear or unsupported, the assistant responds: "Sorry, I didn't understand that. Please try rephrasing your question."
- **Model**: Groq API with `openai/gpt-oss-20b` (temperature 0.3, max 1500 tokens).

### Responsive Design

- Mobile-first approach. All pages tested at 375px (mobile), 768px (tablet), and 1280px+ (desktop).
- **Navigation**: Desktop shows horizontal nav bar with links. Mobile shows a hamburger menu that toggles a dropdown with all navigation items.
- **Calendar**: Collapses to Agenda-only view on mobile (screen width <= 640px).
- **Event Cards**: Single column on mobile, expanding to 2–3 columns on larger screens.

---

## Storybook

Component library documentation with interactive examples.

```bash
cd frontend
npm install
npm run storybook
```

Opens at **http://localhost:6006**. Includes stories for:

| Component | Variants |
|-----------|----------|
| Button | 6 variants (default, destructive, outline, secondary, ghost, link) + sizes |
| Input | Default, disabled, error states |
| Badge | 6 variants |
| Card | Composed example with header, content, footer |
| Dialog | Controlled open/close |
| Spinner | sm / md / lg sizes |
| EmptyState | With and without CTA button |
| EventCard | Default, organizer, past, with tags, at capacity, no capacity |
| TagMultiSelect | Empty, pre-selected, max reached, disabled |
| ConfirmModal | Default and loading states |

---

## Development (Local without Docker)

### Backend
```bash
cd backend
npm install
npm run start:dev
```
Requires PostgreSQL running on `localhost:5432` and a `.env` file in `backend/`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run test` (backend/) | Run backend tests |
| `npx tsc --noEmit` (either dir) | Type-check without emitting |
| `npm run lint -- --fix` (backend/) | Lint + auto-fix backend |
| `npx eslint . --fix` (frontend/) | Lint + auto-fix frontend |
| `npm run build` (either dir) | Production build |
| `npm run seed` (backend/) | Re-seed database |

---

## Security Limitations (PoC)

1. **Access token non-revocable**: After logout, the access token remains valid for its 15-minute lifetime. No token blacklist is implemented. _Production fix_: add Redis token blacklist.
2. **AI prompt injection surface**: User input (max 500 characters) is passed directly to the LLM alongside event data context. No additional sanitization is applied beyond the length limit. _Production fix_: add input sanitization and output filtering.
3. **No email verification**: Registration does not verify email ownership. _Production fix_: add email confirmation flow.
