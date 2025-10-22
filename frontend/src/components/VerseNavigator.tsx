import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ReviewState, VerseListItem } from "../lib/types";

interface VerseNavigatorProps {
  items: VerseListItem[];
  loading: boolean;
  total: number;
  offset: number;
  limit: number;
  searchTerm: string;
  onSearch: (term: string) => void;
  onSelect: (verseId: string | null) => void;
  selectedVerseId?: string;
  onPageChange: (offset: number) => void;
  onCreateNew: () => void;
}

const STATE_COLORS: Record<ReviewState, string> = {
  draft: "bg-slate-700 text-slate-100",
  review_pending: "bg-amber-500/80 text-amber-950",
  approved: "bg-emerald-500/80 text-emerald-950",
  locked: "bg-slate-500/80 text-slate-100",
  rejected: "bg-rose-500/80 text-rose-50",
  flagged: "bg-orange-500/80 text-orange-950",
};

export function VerseNavigator({
  items,
  loading,
  total,
  offset,
  limit,
  searchTerm,
  onSearch,
  onSelect,
  selectedVerseId,
  onPageChange,
  onCreateNew,
}: VerseNavigatorProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const pageInfo = useMemo(() => {
    if (!total) {
      return "0 of 0";
    }
    const start = offset + 1;
    const end = Math.min(offset + limit, total);
    const page = Math.floor(offset / limit) + 1;
    const pageCount = Math.ceil(total / limit);
    return `${start}-${end} of ${total} • Page ${page}/${pageCount}`;
  }, [offset, limit, total]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(localSearch.trim());
  };

  return (
    <aside className="w-full max-h-[calc(100vh-12rem)] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-inner shadow-black/30 lg:w-72">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">Verses</h3>
        <button
          type="button"
          onClick={onCreateNew}
          className="rounded-md border border-brand/60 bg-brand/10 px-2 py-1 text-xs font-semibold text-brand-light transition hover:border-brand hover:bg-brand/20 hover:text-white"
        >
          + New
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <label className="sr-only" htmlFor="verse-search">
          Search verses
        </label>
        <input
          id="verse-search"
          type="search"
          placeholder="Search verse…"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </form>

      <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
        <span>{pageInfo}</span>
        {loading && <span className="text-brand-light">Loading…</span>}
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = item.verse_id === selectedVerseId;
          const state = item.review?.state ?? "draft";
          return (
            <li key={item.verse_id}>
              <button
                type="button"
                onClick={() => onSelect(item.verse_id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  isActive
                    ? "border-brand bg-brand/10 text-white"
                    : "border-slate-800 bg-slate-900/60 text-slate-200 hover:border-brand/60 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">
                    {item.number_manual ?? item.verse_id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${STATE_COLORS[state]}`}
                  >
                    {state.replace("_", " ")}
                  </span>
                </div>
                {item.texts?.bn && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {item.texts.bn}
                  </p>
                )}
              </button>
            </li>
          );
        })}
        {!loading && items.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-3 py-4 text-center text-xs text-slate-500">
            No verses found.
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(offset - limit, 0))}
          disabled={offset === 0 || loading}
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-brand hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(offset + limit)}
          disabled={offset + limit >= total || loading}
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-brand hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
        >
          Next
        </button>
      </div>
    </aside>
  );
}
