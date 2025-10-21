# Unknown CRUD Library — UI Flows (v1)

A single **one‑modal, multi‑tab** editor driving CRUD for any book. Flows are declarative; no code in this doc. All labels are stable for production copy.

---

## 0) Global Frame

**Header (sticky):** Work selector • Verse selector (search/jump) • Status pill • Actions: **Save**, **Save & Next**, **Validate**, **Approve**, **Reject**, **Preview**, **Diff**.

**Behaviors:**

* Autosave every 30 s; unsaved guard on close/nav.
* Keyboard: `⌘S` Save, `⌘→` Save&Next, `A` Approve, `R` Reject, `V` Preview.
* Role gating: show/enable actions by highest role (author < reviewer < final < admin).

---

## 1) Home

1. **Select Book** from library list.
2. Choose **Last Saved**, **Submitted (review_pending)**, or **Create New**.
3. On **Create New**: prompt **Manual Verse Number** → system assigns next `verse_id` and opens editor.

---

## 2) Verse Tab

**Fields:** Manual Verse Number (string, required, unique) • System Verse ID (readonly) • Canonical text (`bn`, required) • Tags • Quick checks (char count, punctuation class).

**Actions:** Save / Save&Next; run basic field validation; update status pill.

**Rules:**

* `number_manual` must be unique; block on duplicate.
* Canonical language (from `work.json.canonical_lang`) must be non‑empty to pass Validate.

---

## 3) Translations Tab

**Layout:** Sub‑tabs per language in `langs`.

**Fields:** Free‑text areas per lang; **Machine draft** toggle writes `meta.translation_source[lang] = "machine"`.

**Flow:** Edit → Save; language tabs can be independently empty.

---

## 4) Segments Tab

**Purpose:** Sentence splitting and optional alignment.

**Fields:** Lists of sentences per language; reorder, split/merge.

**Rules:** If provided, segment totals should be consistent with base texts on Validate.

---

## 5) Origin Tab

**Fields:** Edition (dropdown from `work.source_editions`) • Page • Paragraph index • Add/Remove lines.

**Extras:** Page snapshot viewer (reference only).

**Rules:** At least one origin required before Approve.

---

## 6) Commentary Tab

**View:** Cards list for verse commentary; Work‑level notes under `commentary/work/` appear with a badge.

**Actions:** **Add Note** (creates `C-####`), **Duplicate to other verse**.

**Card Fields:** Speaker • Source • Date • Genre • Tags • Tone • Audience • Texts (5 langs).

---

## 7) Review Tab

**State control:** Dropdown (role‑gated) → `draft | review_pending | approved | locked | rejected | flagged`.

**Buttons:** **Approve**, **Reject**, **Flag**, **Lock** (final only).

**Issues[] editor:**

* Fields: `path` (JSON Pointer), `lang`, `problem`, `found`, `expected`, `suggestion`, `severity`.
* **Apply Suggestion**: writes edit, appends history, resets state to `review_pending`.

**Validation on Approve:** canonical text present; ≥1 origin; no unresolved critical issues; segments (if present) consistent.

---

## 8) History Tab

**Timeline:** `review.history` entries with `ts`, `actor`, `action`, `from→to`, `issues[]`, `hash_before/after`.

**Controls:** Filter by action; expand to view diffs; copy entry JSON.

---

## 9) Preview Tab

**Reader:** Language toggle with fallback bn→en→or→hi→as.

**Commentary rendering:** Display descendant voices first; optional collapse/expand.

**Output check:** Mirrors what clean export will show (without reviewer data).

---

## 10) Attachments Tab (optional)

**Fields:** Reference links for audio/scans; no binary upload.

---

## 11) Save & Next Flow

1. Save current verse.
2. Pre‑fill next `number_manual` and computed next `verse_id`.
3. Open new verse stub in **Verse** tab.

---

## 12) Build & Export Flow

**Build** → merges to `build/<work_id>.all.json`.

**Export Clean** → redacts reviewer/identity fields to `export/<work_id>.clean.json`.

**Export Train** → flattens to `export/<work_id>.train.jsonl`.

**UI Actions:** Trigger via header menu; show path of produced file.

---

## 13) Multi‑Book Behavior

* Work switch preserves current session/context; reloads verse list and languages.
* Verse search scoped to selected work.
* Empty states: friendly prompts to create first verse or import.

---

## 14) Error States & Messages

* Duplicate manual number → inline error near field.
* Missing canonical text/origin on Approve → blocking banner with jump‑to links.
* File I/O failure → toast with retry and path hint.

---

## 15) Patch Notes

* **v1.0:** Defines tab behaviors, validations, and global actions.
* **Planned:** Diff viewer with punctuation class highlight; alignment visualization; bulk verse import wizard.
