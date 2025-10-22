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

### P3a — Frontend Env & Base URL (OLD)

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

## P4 — Frontend Features (OLD)

Implement Translations, Segments (basic), Origin (edition/page/para), Commentary (list/create/duplicate), Review (Approve/Reject/Flag/Lock with Issues[] editor), History (timeline), Preview (language fallback), Attachments (refs only).

# P4 — Frontend Features (Patched on 21-10-2025)

**Phase:** 2 (P4)
**Repo Areas:** `/frontend`
**Rule:** Do **not** duplicate existing files; modify in place where noted. Follow `docs/ui_flows.md` and `docs/api_contracts.md`.

---

## Goal

Implement the remaining editor tabs and interactions, with a responsive, ergonomic **Verse tab** that shows **user’s per‑book preferred language + English** as editors, and exposes other languages as expandable links.

---

## Scope

Implement/extend UI for these tabs and actions:

* **Translations, Segments, Origin, Commentary, Review, History, Preview, Attachments** (as per `docs/ui_flows.md`).
* **Header actions** wired (Save, Save & Next, Validate, Approve/Reject/Flag/Lock — guard non‑author actions if unauthenticated).
* **Verse List + Pagination (P4a)**: list/search verses via `/works/:id/verses?offset/limit/q`; add Jump‑to‑Verse.

Keep autosave and base wiring from P3 intact.

---

## Verse Tab — Preferred Language + Expand‑on‑Click (Per Work)

**Behavior**

* Preferred language **per work** (not global). Key: `localStorage["ucl.prefLang." + work.work_id]`.
* Initial visible editors: `[prefLang, "en"]` (deduped).
  Remaining languages from `work.langs` (e.g., `or`, `hi`, `as`) render as **underlined “+ lang” links**.
* Clicking a link reveals that language’s textarea editor beneath; non‑default editors show a small **✕ Remove** to collapse back to a link.
* A small **“Preferred language”** `<select>` sits above the editors and updates the stored value; switching works reloads the correct preference.

**Layout & A11y**

* Responsive grid: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`.
* Each editor: `<label for=…>` + `<textarea>` with `min-h-[6rem]`, char count right‑aligned.
* Links row: `text-sm underline underline-offset-4 cursor-pointer`, `flex flex-wrap gap-3`.
* Mobile‑first; no horizontal scroll; smooth expand/collapse.

**Implementation Hints (TSX)**

```tsx
// per-work preferred language
const storageKey = `ucl.prefLang.${work.work_id}`;
const [prefLang, setPrefLang] = useState(
  localStorage.getItem(storageKey) || work.canonical_lang || "bn"
);
useEffect(() => { localStorage.setItem(storageKey, prefLang); }, [prefLang, storageKey]);
useEffect(() => {
  const v = localStorage.getItem(`ucl.prefLang.${work.work_id}`) || work.canonical_lang || "bn";
  setPrefLang(v);
  setExtraVisible([]); // optional reset on work switch
}, [work.work_id]);

const baseVisible = Array.from(new Set([prefLang, "en"]));
const [extraVisible, setExtraVisible] = useState<string[]>([]);
const visibleLangs = [...baseVisible, ...extraVisible];
const remaining = work.langs.filter(l => !visibleLangs.includes(l));

// render header selector
<div className="mb-3 flex items-center gap-3">
  <label className="text-sm opacity-80">Preferred language</label>
  <select
    value={prefLang}
    onChange={(e) => setPrefLang(e.target.value)}
    className="rounded-md bg-gray-900/50 px-2 py-1"
  >
    {work.langs.map(l => <option key={l} value={l}>{l}</option>)}
  </select>
</div>

// render editors
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {visibleLangs.map(lang => (
    <div key={lang} className="flex flex-col gap-1 rounded-xl bg-gray-900/40 p-3">
      <div className="flex items-center justify-between">
        <label htmlFor={`txt-${lang}`} className="font-semibold uppercase tracking-wide">{lang}</label>
        {!baseVisible.includes(lang) && (
          <button
            type="button"
            onClick={() => setExtraVisible(v => v.filter(x => x !== lang))}
            className="text-xs text-red-400"
            aria-label={`Remove ${lang}`}
          >✕</button>
        )}
      </div>
      <textarea
        id={`txt-${lang}`}
        value={texts[lang] || ""}
        onChange={(e) => setTexts({ ...texts, [lang]: e.target.value })}
        className="min-h-[6rem] rounded-lg bg-black/30 p-2"
      />
      <div className="text-right text-xs opacity-60">{(texts[lang]||"").length} chars</div>
    </div>
  ))}
</div>

// render remaining language links
{remaining.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-3">
    {remaining.map(lang => (
      <button
        key={lang}
        type="button"
        onClick={() => setExtraVisible(v => [...v, lang])}
        className="text-sm underline underline-offset-4"
      >+ {lang}</button>
    ))}
  </div>
)}
```

**Notes**

* Keep state shape as `texts[lang]` (matches schema).
* No role gating changes here; Save remains enabled; Validate/Approve/Reject remain auth‑gated.

---

## Endpoints Used (reference only)

* `/works/:id/verses` (GET/POST/PUT)
* `/works/:id/verses?offset/limit/q` (list + pagination)
* Auth: `/me`, etc., from P3 (already wired).

---

## Acceptance

1. On first load for a work, editors show **preferred (per work) + English**; others appear as underlined `+ lang` links.
2. Clicking a `+ lang` link reveals its editor; **✕** collapses it back to a link.
3. Changing **Preferred language** persists under the work‑scoped key and reflows visible editors; switching works loads each work’s own preference.
4. Layout stays clean across phone/tablet/desktop; no horizontal overflow.
5. Verse list with pagination works via the backend list API.

---

## Files (Modify Only)

* `src/tabs/VerseTab.tsx` (or current Verse component)
* Reuse existing hooks/utilities: `useAutosave.ts`, `apiClient.ts`, context providers.

---

## Testing

* Build runs: `cd frontend && npm i && npm run build`.
* Manual checks:

  * Add/remove optional languages, change preferred language, reload, switch works.
  * Save & Save‑Next still operate; connection chip unaffected.

---

## Non‑Duplication Rule

Do **not** create new parallel components for Verse tab; modify existing implementation in place. Maintain naming, styling, and structure consistent with current codebase.


### P4a — Verse List + Pagination (OLD)

Add a left sidebar or command palette to list/search verses using `/works/:id/verses?offset/limit/q`.
Add “jump to verse” via keyboard (`Ctrl+K`).

# P4a — Verse List + Pagination + Full Language Compliance (Final. Decided on 21-10-2025 after finding issue with languages features)

**Phase:** 2 (P4a)
**Repo Areas:** `/frontend`, `/backend_py`
**Rule:** Do **not** duplicate files; modify in place where noted.

---

## ⚠️ Context — Review Fixes from P4

> The so‑called “show other languages” toggle never made it in. We’re missing the actual multi‑language compliance our schema demands. Stick the fuck to the spec.

Per `schema_reference.md §3`, each verse **must** include `texts` for all 5 languages: `bn`, `en`, `or`, `hi`, `as`. No shortcuts, no “pref only” saves. The backend and frontend must align here.

---

## 🎯 Goals

1. Fix Verse tab to **persist all 5 language fields** under `texts` and `segments`, even if blank.
2. Add the **Verse List + Pagination** sidebar and quick‑jump (Ctrl/⌘+K).
3. Maintain schema compliance and autosave behavior.

---

## 1️⃣ Full Language Compliance — Frontend & Backend

### Frontend — VerseTab.tsx

* Always ensure all languages exist in `texts` before save.

```ts
// Normalize before save
const normalized = { ...texts };
for (const lang of work.langs) if (!(lang in normalized)) normalized[lang] = "";
setTexts(normalized);
```

* Invisible editors still save empty strings.
* Keep “expand-on-click” UX for readability, but data model must always be full.

### Backend — models/verse.py or routes/verses.py

* Guarantee serialization has all expected keys.

```python
for lang in work["langs"]:
    verse["texts"].setdefault(lang, None)
    verse["segments"].setdefault(lang, [])
    verse["hash"].setdefault(lang, None)
```

* This ensures backend JSONs remain spec‑compliant, even if frontend omits fields.

---

## 2️⃣ Verse List + Pagination Sidebar

**Component:** `src/components/VerseNavigator.tsx`

**Purpose:** Quickly browse/search verses and jump between them.

**Behavior:**

* Fetch list from `/works/:id/verses?offset&limit&q`.
* Sidebar lists verse numbers + current review state.
* Pagination controls at bottom (`Prev` / `Next`).
* Keyboard shortcut `Ctrl+K` (Windows/Linux) or `⌘K` (Mac) opens quick search palette.

**Example Layout:**

```tsx
<aside className="w-64 bg-gray-900/30 p-3 overflow-y-auto border-r border-gray-800">
  <input type="search" placeholder="Search verse…" onChange={...} className="w-full rounded-md p-1" />
  {verses.map(v => (
    <button key={v.verse_id} onClick={() => loadVerse(v.verse_id)}
      className="block w-full text-left px-2 py-1 hover:bg-gray-800 rounded-md">
      {v.number_manual}
      <span className="text-xs opacity-60">{v.review.state}</span>
    </button>
  ))}
  <PaginationControls offset={offset} limit={limit} next={next} onNext={...} onPrev={...} />
</aside>
```

**Keyboard Shortcut:**

```tsx
useHotkeys('ctrl+k, meta+k', () => openSearchModal());
```

---

## 3️⃣ Acceptance Criteria

* Every verse JSON contains `texts`, `segments`, and `hash` for **bn, en, or, hi, as**.
* Backend saves full schema even when UI hides some langs.
* Sidebar fetches paginated list, supports search (`?q=`), and loads selected verse.
* Jump‑to‑verse modal works with `Ctrl+K / ⌘K`.
* Autosave and CSRF handling remain intact.
* Build passes: `cd frontend && npm run build`.

---

## 4️⃣ Testing Checklist

* Save verse with all five languages populated. Verify file: `data/library/<work>/verses/V####.json` has 5 `texts` keys.
* Add new verse → ensure all langs initialized.
* Reload → editors repopulate all fields.
* Sidebar search and pagination function correctly.
* Jump‑to‑verse works from keyboard shortcut.
* Run backend tests → all schema validations pass.
* No console or network errors.

---

## 5️⃣ Files Modified

* `frontend/src/tabs/VerseTab.tsx`
* `frontend/src/components/VerseNavigator.tsx`
* `backend_py/models/verse.py` or equivalent schema layer.

---

## 6️⃣ Reminder

> ⚠️ “Preferred language” is **display logic**, not data logic. Every verse JSON must still serialize all five languages. Stick the fuck to the schema.

---
# P4b — Populate Editor Tabs from Schema (Enhanced for Fresh Context start) ##IMPORTANT## Newly patched 10/21/2025

**Run context:** Continue directly after P4a. (autosave, CSRF, per‑work preferred language, navigator, palette). Do **not** duplicate files; replace placeholders in place.

---

## 🎯 Objective

Replace all "Coming Soon" placeholders with fully functional, schema‑accurate tabs. Every tab must read/write through the shared `verseDraft` and persist via existing Save/Save&Next flows to the FastAPI backend.

---

## 🔧 Tabs to Implement (map 1:1 to schema/UI flows)

1. **Translations Tab**

* Render editors for all languages in `work.langs` bound to `verseDraft.texts[lang]`.
* Preserve 5‑language completeness (bn, en, or, hi, as).
* Validation: canonical language must be non‑empty for Validate/Approve.

2. **Segments Tab**

* For each `lang`, editable ordered list of sentences from `verseDraft.segments[lang]`.
* Provide split/merge/reorder; keep in sync with text (basic checks only).
* Persist arrays exactly as saved (no auto-trim of empty unless user deletes).

3. **Origin Tab**

* Table rows for `origin[]` items: { edition, page, para_index }.
* Edition dropdown values come from `work.source_editions[].id`.
* Add/Remove rows; at least one origin required before Approve.

4. **Commentary Tab**

* List existing commentary linked to the verse with minimal cards (speaker, source, genre, tags, texts).
* **Add Note** creates a new commentary item; **Duplicate to other verse** supported.
* Use backend routes in `api_contracts.md`; if a list endpoint is absent, add a minimal list handler consistent with current design.

5. **Review Tab**

* State dropdown gated by role (`draft|review_pending|approved|locked|rejected|flagged`).
* Issues[] editor with fields: path, lang, problem, found, expected, suggestion, severity.
* Wire buttons to backend: Approve, Reject, Flag, Lock.
* On transitions, refresh `review.state` and append history; show toasts for success/errors.

6. **History Tab**

* Timeline from `review.history[]` (ts, actor, action, from→to, issues count).
* Expand to reveal entry JSON; copy affordance.

7. **Preview Tab**

* Reader view with language fallback bn→en→or→hi→as.
* Render commentary excerpts beneath the verse text; collapsible blocks.
* Mirrors the clean export shape (no reviewer data shown here).

8. **Attachments Tab**

* Simple list of reference links (strings) bound to `verseDraft.attachments[]`.
* Add/Remove entries; no binary upload.

---

## 🧱 Technical Requirements

* All tabs read/write via the **single** `verseDraft` object shared with Verse tab.
* Persist using the existing Save handlers; maintain CSRF/cookie behavior.
* Do not change keys or shapes from `docs/schema_reference.md` and `docs/api_contracts.md`.
* Role gating: Author can edit and submit; Reviewer can approve/reject/flag; Final can lock. Buttons disabled when role is insufficient.

---

## ✅ Acceptance Criteria

* No placeholders remain; each tab is usable and persists to backend.
* Saved verse JSON includes complete `texts`, `segments`, `origin`, `tags`, `hash`, `review`, and `attachments` as specified.
* Review transitions call backend endpoints and append to `review.history`.
* Commentary list displays real items and supports create/duplicate.
* Preview reflects the same content the clean export would show.
* Autosave, navigator, and palette remain fully functional.
* Frontend build passes.

---

## 🧪 Testing Checklist

* Edit each tab → Save → verify corresponding fields in `data/library/<work_id>/verses/<V####>.json`.
* Validate/Approve/Reject/Flag/Lock → confirm state changes and history entries.
* Add a commentary note → verify it is created and linked; duplicate to another verse.
* Switch works and verses; ensure no stale state or missing fields.
* `npm run build` passes; backend tests for transitions stay green.

---

## 🗂 Scope of Changes (no new files unless essential)

* Replace placeholders in existing `*Tab` components (Translations, Segments, Origin, Commentary, Review, History, Preview, Attachments).
* Reuse current hooks, state, and save handlers.
* Add a minimal commentary list endpoint **only if necessary**, mirroring established API style.

---

## ☑️ House Rules

* Keep UI labels and copy consistent with `docs/ui_flows.md`.
* Do not introduce new state containers; extend the existing draft flow.
* Maintain responsiveness and a11y parity with Verse tab.
* Log any deviations in Change Log after completion.



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
