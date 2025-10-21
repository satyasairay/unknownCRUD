# Prompt Pack — Unknown CRUD Library (v2)

## P0 — Bootstrap (repo + docs)

Create the project scaffold: `/backend_py`, `/frontend`, `/data/library`, `/docs`, `/scripts`.
Add `.gitignore`, `README.md`, and `docs/index.md` linking all core docs.
Add `env.example` for backend/frontend.

---

## P1 — Backend Scaffold (FastAPI)

Read `docs/schema_reference.md` and `docs/api_contracts.md`.
Create a **FastAPI app** in `/backend_py` with identical routes and JSON-on-disk persistence under `/data/library`.
Use Pydantic models mirroring schemas.
Implement works / verses / commentary CRUD, review transitions, build/export (merge, clean, train).
Provide `settings.py` with `DATA_ROOT`.
Add pytest E2E: register → login → create verse → approve → export.

### P1a — Seed & Sample Data (FastAPI)

Add `scripts/seed_data.py` to generate a sample library (`satyanusaran`: 2 verses + 1 commentary).
Add `make dev-seed` or `.ps1` to run the seeder.

### P1b — CORS & Cookies (FastAPI)

Enable CORS for `http://localhost:5173` with credentials.
Set cookie/session config so browser requests succeed from React dev server.

---

## P2 — Backend Enhancements

Add pagination for `/works/:id/verses`, duplicate-manual-number checks, soft-delete to `trash/` with tombstones, and append-only review ledger `logs/review/YYYY-MM-DD.jsonl`.

---

## P3 — Frontend Scaffold (React + Vite + Tailwind)

In `/frontend`, implement the **one-modal multi-tab UI** per `docs/ui_flows.md`.
Add `HeaderBar` (work selector, verse jump, status, actions).
Configure Axios client to backend base URL.
Implement Verse tab (bn/en fields), Save & 30s autosave.

### P3a — Frontend Env & Base URL

Add `/frontend/.env.development` with `VITE_API_BASE=http://localhost:4000`.
Axios client must read `import.meta.env.VITE_API_BASE`.
Add quick “Connection status” chip in the header that pings `/health`.

---

## P4 — Frontend Features

Implement Translations, Segments (basic), Origin (edition/page/para), Commentary (list/create/duplicate), Review (Approve/Reject/Flag/Lock with Issues[] editor), History (timeline), Preview (language fallback), Attachments (refs only).

### P4a — Verse List + Pagination

Add a left sidebar or command palette to list/search verses using `/works/:id/verses?offset/limit/q`.
Add “jump to verse” via keyboard (`Ctrl+K`).

---

## P5 — Build & Export UI

Add Build / Export Clean / Export Train buttons; call backend and show produced file paths.

### P5a — Golden Exports

Commit tiny golden outputs under `docs/golden/` (all.json, clean.json, train.jsonl) and add a test that diffs current exports against these (ignoring timestamps).

---

## P6 — Testing

Backend: pytest suites for CRUD, review transitions, export redaction.
Frontend: tests for login, load, edit+autosave, approve with validation, exports.

### P6a — E2E Playbook

Create `docs/e2e_script.md`: steps for Create → Translate → Commentary → Reviewer reject with issues → Fix → Approve → Export with expected file paths.

---

## P7 — Polishing

Keyboard shortcuts (⌘S, ⌘→, A, R, V), unsaved guard, verse search/pagination, multi-book switching, empty states.

### P7a — A11y & i18n Basics

Add focus rings, skip-to-content, semantic headings.
Prepare i18n scaffold: labels in a JSON dictionary.

---

## P8 — Docker & Run Scripts

Add `backend_py/Dockerfile` and `frontend/Dockerfile`, plus `docker-compose.yml` mapping a persistent volume to `/data/library`.
Provide `make up` / `make down` (or `.ps1` equivalents) to run both.

---

## P9 — UAT Checklist

Add `docs/uat_checklist.md` with one-liners to verify: load work, edit/save, autosave, review transitions, history entries, build/export artifacts.

---

## P10 — Release Package

Add `scripts/package_release.ps1` to bundle `/backend_py`, `/frontend/dist`, `/docs`, and a sanitized `/data/library` sample into `release/<version>.zip`.
Update `docs/change_log.md` with release tag.

---

**Patch Notes**

* **v2.0:** Expanded with bootstrap, seeding, testing, packaging, and ops prompts.
* **Next planned:** Add security and deployment phase prompts (P11+).
