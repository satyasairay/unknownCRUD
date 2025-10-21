import { useEffect, useMemo, useState } from "react";
import { VerseDraft } from "../lib/types";

const REQUIRED_LANG_CODES = ["bn", "en", "or", "hi", "as"] as const;
const TAG_DELIMITERS = new Set(["Enter", "Tab", ",", "Comma"]);

interface VerseTabProps {
  draft: VerseDraft;
  canonicalLang: string;
  workId: string;
  workLangs: string[];
  onManualNumberChange: (value: string) => void;
  onTextChange: (lang: string, value: string) => void;
  onTagsChange: (tags: string[]) => void;
  errorMessage?: string | null;
}

export function VerseTab({
  draft,
  canonicalLang,
  workId,
  workLangs,
  onManualNumberChange,
  onTextChange,
  onTagsChange,
  errorMessage,
}: VerseTabProps) {
  const normalizedWorkLangs = useMemo(
    () =>
      Array.from(
        new Set<string>([
          ...REQUIRED_LANG_CODES,
          canonicalLang,
          "en",
          ...workLangs,
        ]),
      ),
    [canonicalLang, workLangs],
  );

  const storageKey = useMemo(() => `ucl.prefLang.${workId}`, [workId]);

  const initialPreferred = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(storageKey);
      if (stored && normalizedWorkLangs.includes(stored)) {
        return stored;
      }
    }
    return normalizedWorkLangs[0] ?? canonicalLang;
  }, [storageKey, normalizedWorkLangs, canonicalLang]);

  const [preferredLang, setPreferredLang] = useState(initialPreferred);
  const [extraVisible, setExtraVisible] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setPreferredLang(initialPreferred);
    setExtraVisible([]);
  }, [initialPreferred]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, preferredLang);
    }
  }, [preferredLang, storageKey]);

  useEffect(() => {
    normalizedWorkLangs.forEach((lang) => {
      if (!(lang in draft.texts)) {
        onTextChange(lang, draft.texts[lang] ?? "");
      }
    });
  }, [draft.texts, normalizedWorkLangs, onTextChange]);

  const baseVisible = useMemo(
    () => Array.from(new Set([preferredLang, "en"])),
    [preferredLang],
  );

  const visibleLangs = useMemo(
    () => Array.from(new Set([...baseVisible, ...extraVisible])),
    [baseVisible, extraVisible],
  );

  const remainingLangs = useMemo(
    () => normalizedWorkLangs.filter((lang) => !visibleLangs.includes(lang)),
    [normalizedWorkLangs, visibleLangs],
  );

  useEffect(() => {
    const nonBaseWithContent = normalizedWorkLangs.filter(
      (lang) =>
        !baseVisible.includes(lang) &&
        (draft.texts[lang]?.trim() ?? "").length > 0,
    );
    if (nonBaseWithContent.length) {
      setExtraVisible((prev) => {
        const merged = new Set([...prev, ...nonBaseWithContent]);
        return Array.from(merged);
      });
    }
  }, [normalizedWorkLangs, baseVisible, draft.texts]);

  const addTags = (rawInput: string) => {
    const candidates = rawInput
      .split(/,+/)
      .map((token) => token.trim())
      .filter(Boolean);
    if (!candidates.length) {
      return;
    }
    const unique = Array.from(new Set([...draft.tags, ...candidates]));
    onTagsChange(unique);
  };

  const removeTag = (tag: string) => {
    onTagsChange(draft.tags.filter((item) => item !== tag));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (
      TAG_DELIMITERS.has(key) ||
      (key === "Backspace" && !tagInput.trim() && draft.tags.length)
    ) {
      event.preventDefault();
      if (key === "Backspace" && !tagInput.trim()) {
        const next = [...draft.tags];
        const removed = next.pop();
        if (removed) {
          onTagsChange(next);
        }
        return;
      }
      if (tagInput.trim()) {
        addTags(tagInput);
        setTagInput("");
      }
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTags(tagInput);
      setTagInput("");
    }
  };

  useEffect(() => {
    setTagInput("");
  }, [draft.tags]);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">
            Manual Verse Number
          </label>
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            placeholder="Enter manual number…"
            value={draft.manualNumber}
            onChange={(event) => onManualNumberChange(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            Must be unique within the work.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">
            System Verse ID
          </label>
          <input
            className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400"
            value={draft.verseId ?? "New verse (unsaved)"}
            readOnly
          />
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center gap-3 text-sm text-slate-300">
          <span className="opacity-80">Preferred language</span>
          <select
            value={preferredLang}
            onChange={(event) => setPreferredLang(event.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs uppercase tracking-wide focus:border-brand focus:outline-none"
          >
            {normalizedWorkLangs.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleLangs.map((lang) => {
            const value = draft.texts[lang] ?? "";
            return (
              <div
                key={lang}
                className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`verse-text-${lang}`}
                    className="text-sm font-semibold uppercase tracking-wide text-slate-200"
                  >
                    {lang}
                    {lang === canonicalLang && (
                      <span className="ml-2 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand-light">
                        Canonical
                      </span>
                    )}
                  </label>
                  {!baseVisible.includes(lang) && (
                    <button
                      type="button"
                      onClick={() =>
                        setExtraVisible((prev) =>
                          prev.filter((item) => item !== lang),
                        )
                      }
                      className="text-xs text-rose-300 transition hover:text-rose-200"
                      aria-label={`Remove ${lang} editor`}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                <textarea
                  id={`verse-text-${lang}`}
                  value={value}
                  onChange={(event) => onTextChange(lang, event.target.value)}
                  className="min-h-[6rem] rounded-lg border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none"
                  placeholder={`Enter ${lang} text…`}
                />
                <div className="text-right text-xs text-slate-500">
                  {value.length} chars
                </div>
              </div>
            );
          })}
        </div>

        {remainingLangs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
            {remainingLangs.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() =>
                  setExtraVisible((prev) =>
                    prev.includes(lang) ? prev : [...prev, lang],
                  )
                }
                className="underline underline-offset-4 transition hover:text-white"
              >
                + {lang}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Tags</label>
        <div className="flex min-h-[3rem] flex-wrap gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200"
            >
              {tag}
              <button
                type="button"
                className="text-slate-400 transition hover:text-rose-300"
                aria-label={`Remove tag ${tag}`}
                onClick={() => removeTag(tag)}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onBlur={handleTagBlur}
            onKeyDown={handleTagKeyDown}
            placeholder={
              draft.tags.length ? "Add another tag…" : "e.g. intro devotion"
            }
            className="flex-1 min-w-[8rem] bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-500">
          Press Enter, comma, or Tab to add a tag. Use Backspace to remove the
          last tag.
        </p>
      </section>
    </div>
  );
}
