# Definition of Done — Unknown CRUD Library (v1)

## Scope

Applies to all backend, frontend, data, and export features described in `docs/*.md`.

---

## 1. Specification Compliance

* All implemented features strictly follow **spec_overview.md**, **schema_reference.md**, **api_contracts.md**, and **ui_flows.md**.
* Deviations documented and approved in `change_log.md`.

---

## 2. Functional

* CRUD for Works, Verses, Commentary, Review transitions.
* Build / Export (merge, clean, train) functional with real output.
* Sample dataset loads and operates end‑to‑end.
* All visible UI actions (Save, Save&Next, Approve, Reject, etc.) perform expected backend calls.

---

## 3. Non‑Functional

* Consistent naming, readable structure, modular design.
* Passes linting, builds cleanly (npm / pytest).
* Autosave, unsaved‑guard, keyboard shortcuts operational.
* No console or server errors in normal operation.

---

## 4. Testing & QA

* Backend: pytest E2E suite green.
* Frontend: unit tests for UI actions and axios calls.
* Manual QA: critical workflows (edit → approve → export) verified.
* QA Log up to date and linked to fixes.

---

## 5. Documentation

* All prompts, decisions, and QAs recorded.
* Change Log and QA Log entries up to date.
* README and /docs index summarize architecture and usage.

---

## 6. Acceptance Gate

* Reviewed against this DoD by project owner (Satya).
* Approved entry recorded in Change Log with tag `release/<version>`.

---

**Patch Notes**

* **v1.0:** Baseline definition of done for Unknown CRUD Library.
* **Next planned:** Extend with security and deployment criteria after production prep.
