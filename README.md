# Event Management System

A full-stack PoC for creating, joining, and managing events with calendar views.

**Stack**: TypeScript · React 19 (Vite) · NestJS · PostgreSQL · Docker

---

## Prerequisites

- Docker 24+ with Docker Compose v2 (`docker compose`)
- Ports **80** (frontend), **3000** (backend), **5432** (database) free on localhost

---

## Quick Start

```bash
cp docker/.env.example docker/.env
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
docker compose down -v && docker compose up --build -d
```

---

## Project Structure

| Directory | Description |
|-----------|-------------|
| `backend/` | NestJS REST API (auth, events CRUD, user endpoints) |
| `frontend/` | React SPA (Vite, Tailwind, Shadcn UI, react-big-calendar) |
| `docker/` | Environment files and Docker configurations |
| `docs/` | SRS and roadmap |

---

## Environment Variables

Copy `docker/.env.example` to `docker/.env` and adjust as needed.

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
| `BACKEND_PORT` | NestJS listen port | `3000` |
| `VITE_API_URL` | Backend API base URL (baked into frontend at build time) | `http://localhost:3000/api` |
| `FRONTEND_PORT` | nginx listen port | `80` |
| `FRONTEND_ORIGIN` | Allowed CORS origin for backend | `http://localhost` |
| `COOKIE_SECURE` | Controls `Secure` flag on refresh-token cookie | `false` |

---

## Seeded Test Accounts

10 events are pre-seeded (9 public + 1 private) with realistic participation data.

| Username | Email | Password |
|----------|-------|----------|
| alice_dev | alice@example.com | password1 |
| bob_builds | bob@example.com | password2 |
| carol_ux | carol@example.com | password3 |
| dan_ops | dan@example.com | password4 |
| eve_startup | eve@example.com | password5 |

> The private event ("Private Team Retrospective") is organised by `dan_ops` and is not visible in the public events list.

---

## Security Limitations (PoC)

1. **Access token non-revocable**: After logout, the access token remains valid for its 15-minute lifetime. No token blacklist is implemented. _Production fix_: add Redis token blacklist.
