# Balance

## Scope and boundaries

- Monorepo with FastAPI backend in `backend/`, Vite + React frontend in `frontend/`, and local PostgreSQL in `docker-compose.yml`.
- Treat `docs/checklist-expense-tracker.md` as planning scope/order, not proof that modules are implemented.
- Implement one numbered ticket at a time; avoid cross-ticket changes unless required by the current ticket.

## Ticket workflow (required)

- Source of truth for progress is `docs/checklist-expense-tracker.md`.
- At the start of each session, identify the first ticket with `[ ]`; that is the only active ticket.
- Work sequence is mandatory: (1) plan the ticket, (2) implement it, (3) evaluate for failures/regressions.
- Planning must define scope, touched files, and acceptance checks before coding.
- Do not implement future tickets in advance; if out-of-scope work is unavoidable, document why.
- After implementation, run focused verification for the touched area:
  - Backend changes: `ruff check .` and `ruff format --check .` from `backend/`.
  - Frontend changes: `npm run lint`, `npm run format:check`, and `npm run build` from `frontend/`.
- Mark the ticket as done in the checklist only after implementation + evaluation pass.

## Setup and run (local)

- Backend uses its own virtualenv at `backend/.venv` and dependencies from `backend/requirements.txt`.
- Frontend uses npm in `frontend/` (`package-lock.json` is present; use npm, not pnpm/yarn).
- Start DB from repo root: `docker compose up -d` (Postgres 17, db/user/password are all `balance`).
- Run migrations from `backend/`: `alembic upgrade head`.
- Run backend from `backend/`: `uvicorn app.main:app --reload`.
- Run frontend from `frontend/`: `npm run dev`.

## Environment gotchas

- Copy env templates before running:
  - `cp backend/.env.example backend/.env`
  - `cp frontend/.env.example frontend/.env`
- Alembic reads `settings.database_url` from `backend/.env` via `backend/alembic/env.py`; migrations fail if env is missing/misconfigured.
- `backend/app/db/config.py` requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (no defaults), so backend startup fails if they are absent.
- Frontend API base URL is `VITE_API_URL` (defaults to `http://localhost:8000` in service files).

## Verification commands

- Backend (from `backend/`):
  - `ruff check .`
  - `ruff format --check .`
- Frontend (from `frontend/`):
  - `npm run lint`
  - `npm run format:check`
  - `npm run build`
- No test suite/CI workflow is configured yet in this repo; use the commands above as the baseline gate.

## Architecture facts that affect changes

- Backend app entrypoint: `backend/app/main.py`; routers mounted for `/auth`, `/categories`, `/expenses`, `/budgets`, plus `/health`.
- Auth model is app-managed JWT (`HS256`), not hosted auth; protected endpoints use Bearer token dependency in `backend/app/auth/dependencies.py`.
- CORS allows exactly one origin (`FRONTEND_URL`) and specific headers/methods in `backend/app/main.py`; cross-origin issues usually mean env mismatch.
- Default categories are seeded by migration `backend/alembic/versions/0002_create_application_tables.py` with fixed UUIDs; treat them as system categories.
- Product constraints to preserve in implementation: expense tracking only, MXN-only amounts, manual budgets, explicit recurring flag, strict per-user data isolation.

## Working conventions in this repo

- Keep diffs small and reviewable per ticket.
- Prefer executable truth (scripts/config/code) over prose when docs drift.
