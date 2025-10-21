import { useEffect, useMemo, useRef, useState } from "react";
import { VerseListItem } from "../lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  query: string;
  items: VerseListItem[];
  loading: boolean;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSelect: (verseId: string) => void;
}

export function CommandPalette({
  isOpen,
  query,
  items,
  loading,
  onQueryChange,
  onClose,
  onSelect,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(items.length ? items.length - 1 : 0);
    }
  }, [items, activeIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const visibleItems = useMemo(() => items.slice(0, 20), [items]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 px-4 py-20 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/70">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">Jump to verse</div>
          <span className="ml-auto text-xs text-slate-500">{loading ? "Loading…" : `${items.length} result(s)`}</span>
        </div>
        <div className="px-4 py-3">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, visibleItems.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                const target = visibleItems[activeIndex];
                if (target) {
                  onSelect(target.verse_id);
                  onClose();
                }
              }
            }}
            placeholder="Type to search verses…"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto px-2 pb-3">
          {visibleItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.verse_id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item.verse_id);
                    onClose();
                  }}
                  className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-brand bg-brand/10 text-white"
                      : "border-transparent bg-slate-900/40 text-slate-200 hover:border-brand/40 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {item.number_manual ?? item.verse_id}
                    </span>
                    <span className="text-[10px] uppercase text-slate-400">
                      {item.review?.state ?? "draft"}
                    </span>
                  </div>
                  {item.texts?.bn && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {item.texts.bn}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
          {!visibleItems.length && !loading && (
            <li className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-3 py-4 text-center text-xs text-slate-500">
              No results found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
