import { VerseDraft } from "../lib/types";

interface VerseTabProps {
  draft: VerseDraft;
  canonicalLang: string;
  onManualNumberChange: (value: string) => void;
  onTextChange: (lang: string, value: string) => void;
  onTagsChange: (tags: string[]) => void;
  errorMessage?: string | null;
}

export function VerseTab({
  draft,
  canonicalLang,
  onManualNumberChange,
  onTextChange,
  onTagsChange,
  errorMessage,
}: VerseTabProps) {
  const canonicalText = draft.texts[canonicalLang] ?? "";
  const englishText = draft.texts.en ?? "";
  const tagsAsString = draft.tags.join(", ");

  const handleTagInput = (value: string) => {
    const tokens = value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    onTagsChange(tokens);
  };

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

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <label className="font-medium text-slate-200">
              Canonical Text ({canonicalLang.toUpperCase()})
            </label>
            <span>{canonicalText.length} chars</span>
          </div>
          <textarea
            className="min-h-[160px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            value={canonicalText}
            placeholder="Canonical language content…"
            onChange={(event) =>
              onTextChange(canonicalLang, event.target.value)
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <label className="font-medium text-slate-200">English</label>
            <span>{englishText.length} chars</span>
          </div>
          <textarea
            className="min-h-[160px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            value={englishText}
            placeholder="English translation…"
            onChange={(event) => onTextChange("en", event.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">
          Tags (comma separated)
        </label>
        <input
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          placeholder="e.g. intro, devotion"
          value={tagsAsString}
          onChange={(event) => handleTagInput(event.target.value)}
        />
        <p className="text-xs text-slate-500">
          Tags help group related verses in the UI.
        </p>
      </section>
    </div>
  );
}
