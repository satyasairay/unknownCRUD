# QA Log — Unknown CRUD Library (v1)

| Date       | Build | Area                 | Steps to Reproduce                                               | Expected                                                                   | Actual                                                    | Artifacts / Paths                    | Decision / Patch             | Status  |
| ---------- | ----- | -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------ | ---------------------------- | ------- |
| 2025-10-22 | P0    | Docs / Repo Scaffold | Ran Codex P0 prompt to create project scaffold and starter files | All base folders, .gitignore, README, env examples, and docs index created | Structure generated exactly as defined; verified manually | E:/SATYASAI_RAY/unknown-crud-library | Accepted, baseline confirmed | ✅ Fixed |
| 2025-10-21 | P1    | Backend / FastAPI Scaffold | Run `uvicorn backend_py.app:app --reload`; execute pytest E2E (`register → login → create verse → approve → export`). | All routes respond per `api_contracts.md`; export artifacts generated under `data/library/.../export/`. | All CRUD and export routes operational; E2E green; minor Pydantic warnings only. | `/backend_py/app.py`, `/data/library/satyanusaran/export/` | Accepted, backend baseline complete | ✅ Fixed |
| 2025-10-21 | P1a   | Seed & Sample Data | Run `python -m scripts.seed_data`; start API; GET `/works`, `/works/:id`, `/works/:id/verses`; approve `V0001`; run exports. | Seed creates `work.json`, `V0001`, `V0002`, and one commentary; re-runs skip existing files; exports succeed. | Seed idempotent; routes return seeded data; approve OK; build/clean/train artifacts present. | `data/library/satyanusaran/**`, `export/*.json(l)`, `build/*.json`; `scripts/seed_data.py` | Accepted; baseline sample set confirmed. | ✅ Fixed |
| 2025-10-21 | P1b   | Backend / CORS & Cookies | Run backend; test preflight and session cookie via curl or browser; rerun pytest E2E. | CORS headers allow `http://localhost:5173` with credentials; cookies persist; all tests pass. | Verified headers and cookie persistence; pytest suite green; ready for React integration. | `backend_py/app.py` (CORS + session setup) | Accepted; backend ready for frontend bridge. | ✅ Fixed |
| 2025-10-21 | P2    | Backend Enhancements (pagination/dupes/soft-delete/ledger) | Start API; `GET /works/:id/verses?offset=0&limit=1`; create verse with duplicate `"number_manual":"1"`; `DELETE /works/:id/verses/V0002`; re-list verses; `POST /review/verse/V0001/approve`; inspect `trash/` and `logs/review/*.jsonl`; run pytest E2E. | Paginated list returns limited items with `total/next`; duplicate create/update returns `409`; deletes move JSON to `trash/` with tombstone; review transitions append to daily JSONL log; tests pass. | All behaviors verified as designed; tombstones include actor/ts; ledger lines append per transition; E2E green. | `data/library/satyanusaran/trash/**`, `data/library/satyanusaran/logs/review/*.jsonl`, `backend_py/app.py`, `backend_py/storage.py` | Accepted; backend hardened for scale/auditability | ✅ Fixed |
| 2025-10-21 | P3    | Frontend / Scaffold | Run `npm install && npm run dev`; open `http://localhost:5173`; verify header, verse tab, autosave behavior, and API ping. | UI renders; autosave logs every 30 s; Axios client connects to backend; build passes. | Verified multi-tab shell, header, autosave, and backend connectivity; no console errors. | `/frontend/src/App.tsx`, `/frontend/src/components/*`, `/frontend/src/hooks/useAutosave.ts` | Accepted; base frontend scaffold complete. | ✅ Fixed |


---

### Usage Notes

* Record **each test or anomaly** encountered during backend/frontend development.
* Keep descriptions factual, short, and reproducible.
* Always link to relevant spec section or prompt (e.g., P1, P3) in *Decision / Patch*.
* Use chronological entries (newest on top).

---

### Example Entry

| Date       | Build | Area    | Steps to Reproduce                      | Expected     | Actual             | Artifacts / Paths       | Decision / Patch            | Status |
| ---------- | ----- | ------- | --------------------------------------- | ------------ | ------------------ | ----------------------- | --------------------------- | ------ |
| 2025-10-21 | v0.1  | Backend | POST /auth/register with short password | Reject (422) | 500 Internal Error | backend/logs/server.log | Added password length check | Fixed  |

---

**Patch Notes**

* **v1.1:** Added P0 QA verification log.
* **v1.0:** Base QA log structure.
* **Next planned:** Add severity/risk rating column if QA scale expands.
