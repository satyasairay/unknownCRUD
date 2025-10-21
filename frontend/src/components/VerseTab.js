import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
const REQUIRED_LANG_CODES = ["bn", "en", "or", "hi", "as"];
const TAG_DELIMITERS = new Set(["Enter", "Tab", ",", "Comma"]);
export function VerseTab({ draft, canonicalLang, workId, workLangs, onManualNumberChange, onTextChange, onTagsChange, errorMessage, }) {
    const normalizedWorkLangs = useMemo(() => Array.from(new Set([
        ...REQUIRED_LANG_CODES,
        canonicalLang,
        "en",
        ...workLangs,
    ])), [canonicalLang, workLangs]);
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
    const [extraVisible, setExtraVisible] = useState([]);
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
    const baseVisible = useMemo(() => Array.from(new Set([preferredLang, "en"])), [preferredLang]);
    const visibleLangs = useMemo(() => Array.from(new Set([...baseVisible, ...extraVisible])), [baseVisible, extraVisible]);
    const remainingLangs = useMemo(() => normalizedWorkLangs.filter((lang) => !visibleLangs.includes(lang)), [normalizedWorkLangs, visibleLangs]);
    useEffect(() => {
        const nonBaseWithContent = normalizedWorkLangs.filter((lang) => !baseVisible.includes(lang) &&
            (draft.texts[lang]?.trim() ?? "").length > 0);
        if (nonBaseWithContent.length) {
            setExtraVisible((prev) => {
                const merged = new Set([...prev, ...nonBaseWithContent]);
                return Array.from(merged);
            });
        }
    }, [normalizedWorkLangs, baseVisible, draft.texts]);
    const addTags = (rawInput) => {
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
    const removeTag = (tag) => {
        onTagsChange(draft.tags.filter((item) => item !== tag));
    };
    const handleTagKeyDown = (event) => {
        const { key } = event;
        if (TAG_DELIMITERS.has(key) ||
            (key === "Backspace" && !tagInput.trim() && draft.tags.length)) {
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
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Manual Verse Number" }), _jsx("input", { className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none", placeholder: "Enter manual number\u2026", value: draft.manualNumber, onChange: (event) => onManualNumberChange(event.target.value) }), _jsx("p", { className: "text-xs text-slate-500", children: "Must be unique within the work." })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "System Verse ID" }), _jsx("input", { className: "rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400", value: draft.verseId ?? "New verse (unsaved)", readOnly: true })] })] }), errorMessage && (_jsx("div", { className: "rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200", children: errorMessage })), _jsxs("section", { children: [_jsxs("div", { className: "mb-3 flex items-center gap-3 text-sm text-slate-300", children: [_jsx("span", { className: "opacity-80", children: "Preferred language" }), _jsx("select", { value: preferredLang, onChange: (event) => setPreferredLang(event.target.value), className: "rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs uppercase tracking-wide focus:border-brand focus:outline-none", children: normalizedWorkLangs.map((lang) => (_jsx("option", { value: lang, children: lang }, lang))) })] }), _jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", children: visibleLangs.map((lang) => {
                            const value = draft.texts[lang] ?? "";
                            return (_jsxs("div", { className: "flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { htmlFor: `verse-text-${lang}`, className: "text-sm font-semibold uppercase tracking-wide text-slate-200", children: [lang, lang === canonicalLang && (_jsx("span", { className: "ml-2 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand-light", children: "Canonical" }))] }), !baseVisible.includes(lang) && (_jsx("button", { type: "button", onClick: () => setExtraVisible((prev) => prev.filter((item) => item !== lang)), className: "text-xs text-rose-300 transition hover:text-rose-200", "aria-label": `Remove ${lang} editor`, children: "\u2715 Remove" }))] }), _jsx("textarea", { id: `verse-text-${lang}`, value: value, onChange: (event) => onTextChange(lang, event.target.value), className: "min-h-[6rem] rounded-lg border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none", placeholder: `Enter ${lang} text…` }), _jsxs("div", { className: "text-right text-xs text-slate-500", children: [value.length, " chars"] })] }, lang));
                        }) }), remainingLangs.length > 0 && (_jsx("div", { className: "mt-3 flex flex-wrap gap-3 text-sm text-slate-300", children: remainingLangs.map((lang) => (_jsxs("button", { type: "button", onClick: () => setExtraVisible((prev) => prev.includes(lang) ? prev : [...prev, lang]), className: "underline underline-offset-4 transition hover:text-white", children: ["+ ", lang] }, lang))) }))] }), _jsxs("section", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Tags" }), _jsxs("div", { className: "flex min-h-[3rem] flex-wrap gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2", children: [draft.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200", children: [tag, _jsx("button", { type: "button", className: "text-slate-400 transition hover:text-rose-300", "aria-label": `Remove tag ${tag}`, onClick: () => removeTag(tag), children: "\u2715" })] }, tag))), _jsx("input", { value: tagInput, onChange: (event) => setTagInput(event.target.value), onBlur: handleTagBlur, onKeyDown: handleTagKeyDown, placeholder: draft.tags.length ? "Add another tag…" : "e.g. intro devotion", className: "flex-1 min-w-[8rem] bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none" })] }), _jsx("p", { className: "text-xs text-slate-500", children: "Press Enter, comma, or Tab to add a tag. Use Backspace to remove the last tag." })] })] }));
}
