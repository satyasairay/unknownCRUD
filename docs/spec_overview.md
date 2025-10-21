# Unknown CRUD Library — Specification Overview (v1)

## 0. Mission

Create a **modular, multi-book editorial CRUD platform** designed for structured texts such as scriptures, literature, or research compilations. The platform must allow multiple books, each divided into granular editable units (verses, paragraphs, commentary, etc.), to be collaboratively authored, reviewed, and exported in clean JSON.

Goal: Enable accurate, human-supervised digital preservation of complex works while maintaining clear versioning and modularity.

---

## 1. Scope

* **Multi-book support** — each book stored independently under `/data/library/<book_id>/`.
* **Fine-grained CRUD** — each verse, commentary, or source exists as a discrete JSON file.
* **Role-based workflows** — authors, reviewers, and admins collaborate via clear states (draft → review → approved → locked).
* **UI design** — one unified modal interface with multi-tab navigation.
* **Export** — automated merge and redaction for downstream datasets.
* **Extensible** — new books or schemas can be added without altering core logic.

---

## 2. Architecture

* **Frontend:** React + TailwindCSS (TypeScript) — interactive multi-tab editor.
* **Backend:** FastAPI (Python) — RESTful endpoints managing file-based JSON persistence.
* **Storage:** File system (no DB), organized by book → verses → commentary → logs.
* **Data Format:** Strict JSON schemas validated on read/write.
* **Deployment:** Dockerized, stateless API; persistent volume for data.

---

## 3. Core Concepts

| Concept            | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| **Work**           | Represents a single book or corpus (e.g., *Satyanusaran*).    |
| **Verse**          | Base text unit; one paragraph or statement with translations. |
| **Commentary**     | Notes or explanations linked to one or more verses.           |
| **Person**         | Identified contributor or source author.                      |
| **Source**         | Origin or reference for a verse or commentary.                |
| **Review**         | Workflow state and history for collaborative validation.      |
| **Build / Export** | Automated combination and cleaning of modular files.          |

---

## 4. High-Level Flow

1. **Select Book** — Choose a work from the library.
2. **Load / Create Verse** — Start new verse or open existing one.
3. **Edit Content** — Enter canonical text, translations, origins, commentary.
4. **Submit for Review** — Reviewer validates, flags issues, or approves.
5. **Final Lock** — Admin/final user locks verse to prevent further edits.
6. **Build & Export** — Merge JSONs, redact sensitive fields, and output training data.

---

## 5. Data Folder Layout

```
data/library/
  <book_id>/
    work.json
    verses/
      V0001.json
      V0002.json
    commentary/
      V0001/
        C-0001.json
    people/
      P-XXXX.json
    sources/
      S-XXXX.json
    logs/
      review/YYYY-MM-DD.jsonl
    build/
      <book_id>.all.json
    export/
      <book_id>.clean.json
      <book_id>.train.jsonl
```

---

## 6. Output Artifacts

* **Merged JSON:** Unified version for internal builds.
* **Clean JSON:** Export-ready, redacted of reviewer data.
* **Training JSONL:** Flattened text-only dataset for machine training.

---

## 7. Patch Notes (for future updates)

* **v1.0:** Initial structure covering mission, architecture, and flow.
* **Next planned patch:** Define schemas and field-level metadata rules (`schema_reference.md`).