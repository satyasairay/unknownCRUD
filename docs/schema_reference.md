# Unknown CRUD Library — Schema Reference (v1)

This document defines the canonical JSON shapes used by the platform. Fields are explicit; unknown fields are disallowed unless noted. All IDs are case-sensitive.

---

## 1) Common Conventions

* **IDs**: `work_id` (kebab/snake acceptable), `verse_id` format `V\d{4}[a-z]?`, commentary IDs `C-<WORK>-V\d{4}-\d{4}`.
* **Language codes**: ISO-like short codes: `bn`, `en`, `or`, `hi`, `as`.
* **Dates**: `YYYY-MM-DD` unless time included as ISO 8601.
* **Nullability**: Omit fields instead of `null` unless schema marks `null` as valid.
* **Review states**: `draft | review_pending | approved | locked | rejected | flagged`.
* **Files at rest**: UTF-8, newline `\n`.

---

## 2) work.json (per book)

**Path**: `data/library/<work_id>/work.json`

**Shape**:

```json
{
  "work_id": "satyanusaran",
  "title": { "bn": "সত্যানুসরণ", "en": "Satyanusaran" },
  "author": "Sree Sree Thakur",
  "canonical_lang": "bn",
  "langs": ["bn", "en", "or", "hi", "as"],
  "structure": { "unit": "verse", "numbering": "sequential" },
  "source_editions": [
    { "id": "ED-PDF-BN-01", "lang": "bn", "type": "pdf", "provenance": "personal_copy" },
    { "id": "ED-PDF-EN-01", "lang": "en", "type": "pdf", "provenance": "personal_copy" }
  ],
  "policy": {
    "sacred": true,
    "monetization": "forbidden",
    "truthfulness": "never attribute words to Thakur without source"
  }
}
```

**Notes**:

* `langs` controls which translation tabs render.
* `structure.unit` remains `verse` for v1; future units permitted via patch.

---

## 3) verses/V0001.json (per verse)

**Path**: `data/library/<work_id>/verses/<verse_id>.json`

**Shape**:

```json
{
  "type": "verse",
  "work_id": "satyanusaran",
  "verse_id": "V0001",
  "number_manual": "1",
  "order": 1,
  "texts": {
    "bn": "<bn paragraph>",
    "en": "<en paragraph>",
    "or": null,
    "hi": null,
    "as": null
  },
  "segments": { "bn": [], "en": [], "or": [], "hi": [], "as": [] },
  "origin": [
    { "edition": "ED-PDF-BN-01", "page": 1, "para_index": 1 },
    { "edition": "ED-PDF-EN-01", "page": 1, "para_index": 1 }
  ],
  "tags": [],
  "hash": { "bn": null, "en": null, "or": null, "hi": null, "as": null },
  "meta": {
    "entered_by": null,
    "translation_source": { "en": "human", "or": null, "hi": null, "as": null }
  },
  "review": {
    "state": "draft",
    "required_reviewers": ["editor", "linguist", "final"],
    "history": []
  }
}
```

**Field rules**:

* `number_manual` unique per work; duplicates blocked by UI/validators.
* `segments[lang]` is an ordered list of sentence strings; alignment optional in v1.
* `origin` requires at least one entry before `approved`.

---

## 4) commentary/V####/C-####.json (per commentary)

**Path**: `data/library/<work_id>/commentary/<verse_id>/C-XXXX.json` or `commentary/work/C-XXXX.json` (work-level).

**Shape**:

```json
{
  "type": "commentary",
  "commentary_id": "C-SATYA-V0001-0001",
  "targets": [ { "kind": "verse", "ids": ["V0001"] } ],
  "speaker": "P-DESC-05",
  "source": "S-FOREWORD-2022",
  "date": { "iso": "2022-08-15" },
  "genre": "interpretation",
  "tags": [],
  "texts": { "bn": null, "en": null, "or": null, "hi": null, "as": null },
  "authenticity": { "status": "attested", "confidence": 0.9 },
  "priority": { "lineage_bias": 1.0 },
  "review": { "state": "review_pending", "history": [] }
}
```

**Field rules**:

* `targets` may include multiple verses; future patch may allow ranges.
* `authenticity` and `priority` are internal; dropped in clean/export.

---

## 5) people/P-XXXX.json (per person)

**Path**: `data/library/<work_id>/people/P-*.json`

**Shape**:

```json
{
  "person_id": "P-DESC-05",
  "name": { "bn": "<name_bn>", "en": "<name_en>" },
  "roles": ["speaker", "editor"],
  "bio": { "bn": null, "en": null },
  "links": [],
  "meta": { "notes": null }
}
```

---

## 6) sources/S-XXXX.json (per source)

**Path**: `data/library/<work_id>/sources/S-*.json`

**Shape**:

```json
{
  "source_id": "S-FOREWORD-2022",
  "title": { "bn": null, "en": "Foreword 2022" },
  "type": "pdf",
  "provenance": "personal_copy",
  "citation": null,
  "links": [],
  "meta": { "notes": null }
}
```

---

## 7) review.history entry (embedded)

**Context**: Array elements stored under `review.history` in verse/commentary JSON.

**Shape**:

```json
{
  "ts": "2025-10-16T10:23:45Z",
  "actor": "user_id_or_email",
  "action": "state_change | issue_add | issue_apply | edit | lock | unlock",
  "from": "draft",
  "to": "review_pending",
  "issues": [
    {
      "path": "/texts/en",
      "lang": "en",
      "problem": "mistranslation",
      "found": "...",
      "expected": "...",
      "suggestion": "...",
      "severity": "minor | major | critical"
    }
  ],
  "hash_before": "<sha>",
  "hash_after": "<sha>"
}
```

---

## 8) Build/Export Artifacts

**Paths**: `build/<work_id>.all.json`, `export/<work_id>.clean.json`, `export/<work_id>.train.jsonl`

**Merged all.json (excerpt)**:

```json
{
  "work": { /* from work.json */ },
  "verses": [ { /* verse objects */ } ],
  "commentary": [ { /* commentary objects */ } ]
}
```

**Clean export rules** (drop fields):

* Drop: `review`, `history`, `meta.reviewer`, `meta.date_reviewed`, `meta.entered_by`, `priority`, `authenticity`.

**Training JSONL (one line per item)**:

```json
{"type":"verse","work_id":"satyanusaran","verse_id":"V0001","lang":"bn","text":"...","tags":[]}
{"type":"verse","work_id":"satyanusaran","verse_id":"V0001","lang":"en","text":"...","tags":[]}
{"type":"commentary","work_id":"satyanusaran","commentary_id":"C-SATYA-V0001-0001","lang":"en","text":"...","genre":"interpretation"}
```

---

## 9) Validation Summary

* **Verse minimum** before approval: `texts[canonical_lang]` non-empty, `origin.length >= 1`, no unresolved critical issues, segments (if present) consistent with texts.
* **IDs** must be stable; `verse_id` never changes after creation.
* **Uniqueness**: `number_manual` unique per work.

---

## 10) Patch Notes

* **v1.0**: Establish core shapes for work, verse, commentary, person, source, history, and exports.
* **Planned**: Segment alignment maps, verse range targets, richer source citations.
