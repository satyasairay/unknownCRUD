# QA Log — Unknown CRUD Library (v1)

| Date       | Build | Area                 | Steps to Reproduce                                               | Expected                                                                   | Actual                                                    | Artifacts / Paths                    | Decision / Patch             | Status  |
| ---------- | ----- | -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------ | ---------------------------- | ------- |
| 2025-10-22 | P0    | Docs / Repo Scaffold | Ran Codex P0 prompt to create project scaffold and starter files | All base folders, .gitignore, README, env examples, and docs index created | Structure generated exactly as defined; verified manually | E:/SATYASAI_RAY/unknown-crud-library | Accepted, baseline confirmed | ✅ Fixed |
| 2025-10-21 | P1    | Backend / FastAPI Scaffold | Run `uvicorn backend_py.app:app --reload`; execute pytest E2E (`register → login → create verse → approve → export`). | All routes respond per `api_contracts.md`; export artifacts generated under `data/library/.../export/`. | All CRUD and export routes operational; E2E green; minor Pydantic warnings only. | `/backend_py/app.py`, `/data/library/satyanusaran/export/` | Accepted, backend baseline complete | ✅ Fixed |


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
