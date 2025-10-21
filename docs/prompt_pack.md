# Prompt Pack — Unknown CRUD Library (v1)

## P1 — Backend Scaffold (FastAPI)

Read `docs/schema_reference.md` and `docs/api_contracts.md`.
Create a **FastAPI app** in `/backend_py` with identical routes and JSON‑on‑disk persistence under `/data/library`.
Use Pydantic models mirroring schemas.
Implement works / verses / commentary CRUD, review transitions, and build/export (merge, clean, train).
Provide `settings.py` with `DATA_ROOT`.
Add pytest E2E: register → login → create verse → approve → export.

## P2 — Backend Enhancements

Add pagination for `/works/:id/verses`, duplicate‑manual‑number checks, soft‑delete to `trash/` with tombstones, and append‑only review ledger `logs/review/YYYY-MM-DD.jsonl`.

## P3 — Frontend Scaffold (React + Vite + Tailwind)

In `/frontend`, implement the **one‑modal multi‑tab UI** per `docs/ui_flows.md`.
Add `HeaderBar` (work selector, verse jump, status, actions).
Configure Axios client to backend base URL.
Implement Verse tab (bn/en fields), Save & 30s autosave.

## P4 — Frontend Features

Implement Translations, Segments (basic), Origin (edition/page/para), Commentary (list/create/duplicate), Review (Approve/Reject/Flag/Lock with Issues[] editor), History (timeline), Preview (language fallback), Attachments (refs only).

## P5 — Build & Export UI

Add Build / Export Clean / Export Train buttons; call backend and show produced file paths.

## P6 — Testing

Backend: pytest suites for CRUD, review transitions, export redaction.
Frontend: tests for login, load work, edit+autosave, approve with validation, exports.

## P7 — Polishing

Keyboard shortcuts (⌘S, ⌘→, A, R, V), unsaved guard, verse search/pagination, multi‑book switching, empty states.

---

**Patch Notes**

* **v1.0:** Complete prompt pack for Codex/assistant builds.
* **Next planned:** Auth hardening, 2FA hooks, visual diff viewer.
