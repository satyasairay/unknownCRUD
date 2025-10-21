# Unknown CRUD Library — API Contracts (v1)

**Style:** REST over HTTP/JSON. All responses include `Content-Type: application/json`. Unknown fields ignored on input; never emitted on output. Status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`.

Base URL examples:

* Local dev: `http://localhost:4000` (or configured port)

Auth model: cookie session (HttpOnly). CSRF via header `x-csrf-token` for state-changing verbs.

---

## 0) Health

**GET /health** → `200 { "status": "ok", "version": "v1" }`

**GET /auth/csrf** → `200 { "csrfToken": "..." }`

---

## 1) Auth

### POST /auth/register

Create user. Public endpoint (may restrict to author role by policy).

**Request**

```json
{ "email": "user@site", "password": "12+ chars", "roles": ["author"] }
```

**Response 201**

```json
{ "id": "uuid", "email": "user@site", "roles": ["author"], "twoFactorEnabled": false }
```

### POST /auth/login

Start session. If 2FA enabled, include `otp`.

**Request**

```json
{ "email": "user@site", "password": "...", "otp": "123456" }
```

**Response 200**

```json
{ "id": "uuid", "email": "user@site", "roles": ["author"], "twoFactorEnabled": false }
```

### POST /auth/logout

Ends session. → `204`

### GET /me

Returns current user. → `200 { "id": "uuid", "email": "...", "roles": ["..."], "twoFactorEnabled": false }`

*(Optional, future)* `POST /auth/totp/enroll` → `{ otpauthUrl, secret }`; `POST /auth/totp/verify` → enable 2FA.

---

## 2) Works (Books)

### GET /works

List works found under `data/library/`.
**Response 200**

```json
[ { "work_id": "satyanusaran", "title": {"en": "Satyanusaran"}, "langs": ["bn","en"] } ]
```

### GET /works/:id

Return `work.json`.
**Response 200** — full `work.json` object.

### PUT /works/:id

Replace `work.json`. RBAC: admin.
**Request** — full `work.json`. **Response 200** — updated object.

---

## 3) Verses

### GET /works/:id/verses/:vid

Return a verse.
**Response 200** — full `verse` object.

### POST /works/:id/verses

Create a new verse (assigns `verse_id` and sets `order`). RBAC: author+.
**Request**

```json
{ "number_manual": "13", "texts": {"bn":"..."}, "origin": [{"edition":"ED-PDF-BN-01","page":1,"para_index":1}], "tags": [] }
```

**Response 201**

```json
{ "verse_id": "V0013", "location": "/works/:id/verses/V0013" }
```

### PUT /works/:id/verses/:vid

Update an existing verse. RBAC: author+.
**Request** — any mutable verse fields. **Response 200** — updated verse.

### DELETE /works/:id/verses/:vid

Soft-delete to `trash/` with tombstone. RBAC: admin. **Response 204**.

### GET /works/:id/verses

List/paginate verses; filters: `q`, `number_manual`, `status`, `offset`, `limit`.
**Response 200**

```json
{ "items": [ {"verse_id":"V0001","number_manual":"1","review":{"state":"draft"}} ], "next": null }
```

---

## 4) Commentary

### GET /works/:id/commentary/:cid

Return commentary JSON.

### POST /works/:id/verses/:vid/commentary

Create commentary for a verse. RBAC: author+.
**Request**

```json
{ "texts": {"en":"..."}, "speaker":"P-DESC-05", "source":"S-FOREWORD-2022", "genre":"interpretation", "tags":[] }
```

**Response 201** `{ "commentary_id": "C-..." }`

### PUT /works/:id/commentary/:cid

Update commentary. RBAC: author+.

### DELETE /works/:id/commentary/:cid

Soft-delete. RBAC: admin. **204**

---

## 5) Review (State & Issues)

### POST /review/verse/:vid/approve

Transition to `approved` (or `locked` by final in later step). RBAC: reviewer/final.
**Request** `{ "work_id": "satyanusaran" }`
**Response 200** — updated verse with `review.state` and appended `history`.

### POST /review/verse/:vid/reject

Set `rejected` with issues.
**Request**

```json
{ "work_id": "satyanusaran", "issues": [ { "path": "/texts/en", "lang": "en", "problem": "mistranslation", "found": "x", "expected": "y", "suggestion": "z", "severity": "major" } ] }
```

**Response 200** — updated verse.

### POST /review/verse/:vid/flag

Mark as `flagged`. RBAC: reviewer+.

### POST /review/verse/:vid/lock

Final lock. RBAC: final. **Response 200** — state `locked`.

*(Commentary mirrors the same routes with `/review/commentary/:cid/*`)*

---

## 6) Build & Export

### POST /build/merge

Produce `build/<work_id>.all.json` by merging work, verses, commentary.
**Request** `{ "work_id": "satyanusaran" }`
**Response 200** `{ "output": "data/library/satyanusaran/build/satyanusaran.all.json" }`

### POST /export/clean

Redact reviewer/identity fields, write `export/<work_id>.clean.json`.
**Request** `{ "work_id": "satyanusaran" }`
**Response 200** `{ "output": ".../export/satyanusaran.clean.json" }`

### POST /export/train

Flatten to JSONL at `export/<work_id>.train.jsonl`.
**Request** `{ "work_id": "satyanusaran" }`
**Response 200** `{ "output": ".../export/satyanusaran.train.jsonl" }`

---

## 7) Logging

Append-only review ledger: `logs/review/YYYY-MM-DD.jsonl` created automatically on transitions (approve/reject/flag/lock).

---

## 8) Errors (Examples)

* `409 Conflict` — duplicate `number_manual` within a work.
* `422 Unprocessable Entity` — missing required fields before approval (e.g., no `origin`).
* `403 Forbidden` — caller lacks required role for transition.

---

## 9) Patch Notes

* **v1.0**: Core routes for work, verse, commentary, review, and exports.
* **Planned**: Range targets for commentary, alignment APIs for segments, bulk import endpoints.
