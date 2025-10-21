# QA Log — Unknown CRUD Library (v1)

| Date | Build | Area                               | Steps to Reproduce | Expected | Actual | Artifacts / Paths | Decision / Patch | Status                  |
| ---- | ----- | ---------------------------------- | ------------------ | -------- | ------ | ----------------- | ---------------- | ----------------------- |
|      |       | Backend / Frontend / Data / Export |                    |          |        |                   |                  | Open / Fixed / Deferred |

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

* **v1.0:** Base QA log structure.
* **Next planned:** Add severity/risk rating column if QA scale expands.
