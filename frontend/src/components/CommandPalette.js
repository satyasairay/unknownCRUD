import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
export function CommandPalette({ isOpen, query, items, loading, onQueryChange, onClose, onSelect, }) {
    const inputRef = useRef(null);
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
        const handler = (event) => {
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
    return (_jsx("div", { className: "fixed inset-0 z-40 flex items-start justify-center bg-black/60 px-4 py-20 backdrop-blur", children: _jsxs("div", { className: "w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/70", children: [_jsxs("div", { className: "flex items-center gap-2 border-b border-slate-800 px-4 py-3", children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Jump to verse" }), _jsx("span", { className: "ml-auto text-xs text-slate-500", children: loading ? "Loading…" : `${items.length} result(s)` })] }), _jsx("div", { className: "px-4 py-3", children: _jsx("input", { ref: inputRef, type: "search", value: query, onChange: (event) => onQueryChange(event.target.value), onKeyDown: (event) => {
                            if (event.key === "ArrowDown") {
                                event.preventDefault();
                                setActiveIndex((prev) => Math.min(prev + 1, visibleItems.length - 1));
                            }
                            else if (event.key === "ArrowUp") {
                                event.preventDefault();
                                setActiveIndex((prev) => Math.max(prev - 1, 0));
                            }
                            else if (event.key === "Enter") {
                                event.preventDefault();
                                const target = visibleItems[activeIndex];
                                if (target) {
                                    onSelect(target.verse_id);
                                    onClose();
                                }
                            }
                        }, placeholder: "Type to search verses\u2026", className: "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none" }) }), _jsxs("ul", { className: "max-h-64 overflow-y-auto px-2 pb-3", children: [visibleItems.map((item, index) => {
                            const isActive = index === activeIndex;
                            return (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => {
                                        onSelect(item.verse_id);
                                        onClose();
                                    }, className: `flex w-full flex-col rounded-lg border px-3 py-2 text-left transition ${isActive
                                        ? "border-brand bg-brand/10 text-white"
                                        : "border-transparent bg-slate-900/40 text-slate-200 hover:border-brand/40 hover:bg-slate-900/70"}`, children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-semibold", children: item.number_manual ?? item.verse_id }), _jsx("span", { className: "text-[10px] uppercase text-slate-400", children: item.review?.state ?? "draft" })] }), item.texts?.bn && (_jsx("p", { className: "mt-1 line-clamp-1 text-xs text-slate-400", children: item.texts.bn }))] }) }, item.verse_id));
                        }), !visibleItems.length && !loading && (_jsx("li", { className: "rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-3 py-4 text-center text-xs text-slate-500", children: "No results found." }))] })] }) }));
}
