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

### P3a - Frontend Env, Base URL **+ Auth UI (Login/Register/Logout)** Refined on 21-10-2025 as we wanted to patch in Home page, login , register and logout UIs in this stage.

**Do not duplicate existing files** created in P3; **modify in place** where noted.

## Goals

1. Wire frontend env for API base + connection chip (as already planned).
2. Add a minimal, production-ready **Auth flow**: **Login**, **Register**, **Logout** using backend endpoints from `docs/api_contracts.md`.
3. Respect cookie sessions (no tokens in localStorage).
4. Guard action buttons by auth state (basic).

## Env & Config (extend if missing)

* Create/ensure: `/frontend/.env.development`

  ```
  VITE_API_BASE=http://localhost:4000
  ```
* Update `/frontend/src/lib/apiClient.ts`:

  * `axios.create({ baseURL: import.meta.env.VITE_API_BASE, withCredentials: true })`
  * Add `getCsrf()` util → `GET /auth/csrf` (store token in memory) and **axios request interceptor** to set `x-csrf-token` for state-changing verbs.

## Auth State (new)

* **`/frontend/src/context/AuthContext.tsx`** (new):

  * `AuthProvider` with state `{ user, loading }`.
  * Effects:

    * on mount → `GET /me` → set `user` or `null`.
  * Actions:

    * `register({email,password,roles})` → `POST /auth/register`
    * `login({email,password,otp?})` → `POST /auth/login`
    * `logout()` → `POST /auth/logout` → `user=null`
  * Export `useAuth()` hook.
* Wrap `<App />` in `AuthProvider` (edit `/frontend/src/main.tsx`).

## UI Components (add, but reuse existing header)

* **`/frontend/src/components/AuthModal.tsx`** (new):

  * Modal with **tabs**: **Login** | **Register**.
  * Fields:

    * Login: `email`, `password`
    * Register: `email`, `password` (min 12 chars), `roles` (multi-select; default `["author"]`)
  * Buttons: **Login**, **Create Account**; show inline errors from API.
  * On success: close modal; `useAuth()` updates `user`.
* **Update `/frontend/src/components/HeaderBar.tsx`**:

  * Right side: if `user` → show email + **Logout** button.
  * If no `user` → show **Login** button (opens `AuthModal`).
  * Keep existing **Connection status** ping (don’t remove).

## Guarding Actions (small change)

* In `/frontend/src/components/HeaderBar.tsx` and/or `App.tsx`:

  * Disable **Validate / Approve / Reject** when `!user`.
  * Leave **Save** enabled for now (we’ll add roles later).

## Don’t duplicate existing P3 files

* Reuse existing `apiClient.ts`, `HeaderBar.tsx`, `App.tsx`.
* Keep autosave logic unchanged (`useAutosave.ts`).

## Minimal Styling

* Tailwind classes consistent with current layout; center modal; inputs with labels; error text small/red.

## Tests / Acceptance

* Build must pass: `cd frontend && npm install && npm run build`
* Manual acceptance:

  1. Run backend & frontend.
  2. Open app → click **Login** → create account → auto-login.
  3. Reload page → still authenticated (`/me` succeeds).
  4. Click **Logout** → `/me` shows unauthenticated; login button returns.
  5. Connection chip still pings `/health`.

## Files summary

* **New:**

  * `src/context/AuthContext.tsx`
  * `src/components/AuthModal.tsx`
* **Modified:**

  * `src/main.tsx` (wrap with `AuthProvider`)
  * `src/components/HeaderBar.tsx` (login/logout controls)
  * `src/lib/apiClient.ts` (CSRF + withCredentials)
  * `.env.development` (VITE_API_BASE)

## References

* Back-end endpoints already exist per `docs/api_contracts.md`: `/auth/register`, `/auth/login`, `/auth/logout`, `/me`, `/auth/csrf`.
* Ensure **no duplicate** components or contexts; update existing files instead.

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
