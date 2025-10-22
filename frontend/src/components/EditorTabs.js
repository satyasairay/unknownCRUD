import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
export function TranslationsTab({ languages, canonicalLang, texts, onChange, }) {
    return (_jsx("div", { className: "flex flex-col gap-4", children: languages.map((lang) => {
            const value = texts[lang] ?? "";
            return (_jsxs("div", { className: "flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { htmlFor: `translations-${lang}`, className: "text-sm font-semibold uppercase tracking-wide text-slate-200", children: [lang, lang === canonicalLang && (_jsx("span", { className: "ml-2 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand-light", children: "Canonical" }))] }), _jsxs("span", { className: "text-xs text-slate-500", children: [value.length, " chars"] })] }), _jsx("textarea", { id: `translations-${lang}`, value: value, onChange: (event) => onChange(lang, event.target.value), className: "min-h-[6rem] rounded-lg border border-slate-700 bg-black/30 p-3 text-sm text-slate-100 focus:border-brand focus:outline-none", placeholder: `Enter ${lang} translation…` })] }, lang));
        }) }));
}
export function SegmentsTab({ languages, segments, texts, onChange, }) {
    const handleSplit = (lang, index) => {
        const current = segments[lang] ?? [];
        const value = current[index] ?? "";
        const pieces = value.includes("\n")
            ? value.split("\n").map((entry) => entry.trim()).filter(Boolean)
            : value
                .split(/(?<=[.?!])\s+/)
                .map((entry) => entry.trim())
                .filter(Boolean);
        if (pieces.length <= 1) {
            return;
        }
        const next = [...current.slice(0, index), ...pieces, ...current.slice(index + 1)];
        onChange(lang, next);
    };
    const handleMerge = (lang, index) => {
        const current = segments[lang] ?? [];
        if (index >= current.length - 1) {
            return;
        }
        const merged = `${current[index]} ${current[index + 1]}`.trim();
        const next = [...current];
        next.splice(index, 2, merged);
        onChange(lang, next);
    };
    const handleReorder = (lang, index, direction) => {
        const current = segments[lang] ?? [];
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= current.length) {
            return;
        }
        const next = [...current];
        const [moved] = next.splice(index, 1);
        next.splice(nextIndex, 0, moved);
        onChange(lang, next);
    };
    const handleInsert = (lang, index) => {
        const current = segments[lang] ?? [];
        const next = [...current];
        next.splice(index + 1, 0, "");
        onChange(lang, next);
    };
    const handleRemove = (lang, index) => {
        const current = segments[lang] ?? [];
        const next = [...current];
        next.splice(index, 1);
        onChange(lang, next);
    };
    return (_jsx("div", { className: "flex flex-col gap-6", children: languages.map((lang) => {
            const languageSegments = segments[lang] ?? [];
            const baseText = texts[lang] ?? "";
            return (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-semibold uppercase tracking-wide text-slate-200", children: [lang, " Segments"] }), _jsx("button", { type: "button", onClick: () => onChange(lang, [...languageSegments, ""]), className: "rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-brand hover:text-white", children: "+ Add Segment" })] }), !languageSegments.length && (_jsx("p", { className: "text-xs text-slate-500", children: "No segments defined. Use \u201CAdd Segment\u201D to start or click \u201CAutofill from text\u201D." })), languageSegments.map((segment, index) => (_jsxs("div", { className: "mb-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3", children: [_jsx("textarea", { value: segment, onChange: (event) => {
                                    const next = [...languageSegments];
                                    next[index] = event.target.value;
                                    onChange(lang, next);
                                }, className: "w-full rounded-md border border-slate-700 bg-black/40 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none", placeholder: `Segment ${index + 1}` }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-xs text-slate-400", children: [_jsxs("span", { children: [segment.length, " chars"] }), _jsxs("div", { className: "ml-auto flex gap-2", children: [_jsx("button", { type: "button", onClick: () => handleReorder(lang, index, -1), className: "rounded border border-slate-700 px-2 py-1 hover:border-brand", disabled: index === 0, children: "\u2191" }), _jsx("button", { type: "button", onClick: () => handleReorder(lang, index, 1), className: "rounded border border-slate-700 px-2 py-1 hover:border-brand", disabled: index === languageSegments.length - 1, children: "\u2193" }), _jsx("button", { type: "button", onClick: () => handleSplit(lang, index), className: "rounded border border-slate-700 px-2 py-1 hover:border-brand", children: "Split" }), _jsx("button", { type: "button", onClick: () => handleMerge(lang, index), className: "rounded border border-slate-700 px-2 py-1 hover:border-brand", disabled: index === languageSegments.length - 1, children: "Merge \u2193" }), _jsx("button", { type: "button", onClick: () => handleInsert(lang, index), className: "rounded border border-slate-700 px-2 py-1 hover:border-brand", children: "+ Insert" }), _jsx("button", { type: "button", onClick: () => handleRemove(lang, index), className: "rounded border border-rose-700 px-2 py-1 text-rose-300 hover:border-rose-500", children: "\u2715 Remove" })] })] })] }, `${lang}-${index}`))), _jsxs("button", { type: "button", onClick: () => {
                            const newSegments = baseText
                                .split(/(?<=[.?!])\s+/)
                                .map((entry) => entry.trim())
                                .filter(Boolean);
                            if (newSegments.length) {
                                onChange(lang, newSegments);
                            }
                        }, className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-brand hover:text-white", children: ["Autofill from ", lang, " text"] })] }, lang));
        }) }));
}
export function OriginTab({ origin, editions, onAdd, onUpdate, onRemove, }) {
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-200", children: "Source references" }), _jsx("button", { type: "button", onClick: onAdd, className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-brand hover:text-white", children: "+ Add Origin" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-slate-800 text-sm text-slate-200", children: [_jsx("thead", { className: "bg-slate-900/40 text-xs uppercase tracking-wide text-slate-400", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Edition" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Page" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Paragraph" }), _jsx("th", { className: "px-3 py-2" })] }) }), _jsxs("tbody", { className: "divide-y divide-slate-800", children: [origin.map((entry, index) => (_jsxs("tr", { className: "bg-slate-950/40", children: [_jsx("td", { className: "px-3 py-2", children: _jsxs("select", { value: entry.edition, onChange: (event) => onUpdate(index, { edition: event.target.value }), className: "w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm focus:border-brand focus:outline-none", children: [_jsx("option", { value: "", children: "Select edition\u2026" }), editions.map((edition) => (_jsx("option", { value: edition.id, children: edition.id }, edition.id)))] }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { type: "number", value: entry.page ?? "", onChange: (event) => onUpdate(index, {
                                                    page: event.target.value.length === 0
                                                        ? undefined
                                                        : Number(event.target.value),
                                                }), className: "w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm focus:border-brand focus:outline-none", placeholder: "Pg" }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { type: "number", value: entry.para_index ?? "", onChange: (event) => onUpdate(index, {
                                                    para_index: event.target.value.length === 0
                                                        ? undefined
                                                        : Number(event.target.value),
                                                }), className: "w-28 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm focus:border-brand focus:outline-none", placeholder: "Paragraph" }) }), _jsx("td", { className: "px-3 py-2 text-right", children: _jsx("button", { type: "button", onClick: () => onRemove(index), className: "rounded-md border border-rose-700 px-2 py-1 text-xs text-rose-300 transition hover:border-rose-500", children: "\u2715 Remove" }) })] }, `origin-${index}`))), !origin.length && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-3 py-4 text-center text-xs text-slate-500", children: "No origin references yet. Add at least one before approval." }) }))] })] }) })] }));
}
export function CommentaryTab({ verseId, languages, entries, loading, onCreate, onDuplicate, }) {
    const [isCreating, setCreating] = useState(false);
    const [tagDraft, setTagDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [newNote, setNewNote] = useState({
        speaker: undefined,
        source: undefined,
        genre: undefined,
        tags: [],
        texts: Object.fromEntries(languages.map((lang) => [lang, ""])),
        targets: verseId ? [{ kind: "verse", ids: [verseId] }] : [],
    });
    const resetForm = () => {
        setNewNote({
            speaker: undefined,
            source: undefined,
            genre: undefined,
            tags: [],
            texts: Object.fromEntries(languages.map((lang) => [lang, ""])),
            targets: verseId ? [{ kind: "verse", ids: [verseId] }] : [],
        });
        setTagDraft("");
        setCreating(false);
    };
    const addTag = () => {
        const next = tagDraft.trim();
        if (!next) {
            return;
        }
        setNewNote((prev) => ({
            ...prev,
            tags: Array.from(new Set([...(prev.tags ?? []), next])),
        }));
        setTagDraft("");
    };
    const removeTag = (tag) => {
        setNewNote((prev) => ({
            ...prev,
            tags: (prev.tags ?? []).filter((item) => item !== tag),
        }));
    };
    const handleSubmit = async () => {
        if (!verseId) {
            return;
        }
        setSubmitting(true);
        try {
            await onCreate({
                ...newNote,
                texts: Object.fromEntries(languages.map((lang) => [lang, newNote.texts?.[lang] ?? ""])),
                targets: [{ kind: "verse", ids: [verseId] }],
            });
            resetForm();
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-200", children: ["Commentary linked to verse ", verseId ?? "…"] }), _jsx("button", { type: "button", onClick: () => setCreating((value) => !value), className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-brand hover:text-white", disabled: !verseId, children: isCreating ? "Cancel" : "Add Note" })] }), isCreating && (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/70 p-4", children: [_jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Speaker" }), _jsx("input", { value: newNote.speaker ?? "", onChange: (event) => setNewNote((prev) => ({ ...prev, speaker: event.target.value })), className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Source" }), _jsx("input", { value: newNote.source ?? "", onChange: (event) => setNewNote((prev) => ({ ...prev, source: event.target.value })), className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Genre" }), _jsx("input", { value: newNote.genre ?? "", onChange: (event) => setNewNote((prev) => ({ ...prev, genre: event.target.value })), className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none" })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Tags" }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2", children: [(newNote.tags ?? []).map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200", children: [tag, _jsx("button", { type: "button", className: "text-slate-400 transition hover:text-rose-300", onClick: () => removeTag(tag), children: "\u2715" })] }, tag))), _jsx("input", { value: tagDraft, onChange: (event) => setTagDraft(event.target.value), onKeyDown: (event) => {
                                            if (event.key === "Enter" || event.key === ",") {
                                                event.preventDefault();
                                                addTag();
                                            }
                                        }, className: "flex-1 min-w-[6rem] bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none", placeholder: "Add tag" })] })] }), _jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: languages.map((lang) => (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("label", { className: "text-xs uppercase text-slate-400", children: [lang.toUpperCase(), " Text"] }), _jsx("textarea", { value: newNote.texts?.[lang] ?? "", onChange: (event) => setNewNote((prev) => ({
                                        ...prev,
                                        texts: {
                                            ...(prev.texts ?? {}),
                                            [lang]: event.target.value,
                                        },
                                    })), className: "min-h-[5rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" })] }, `commentary-text-${lang}`))) }), _jsxs("div", { className: "mt-4 flex items-center justify-end gap-2 text-sm", children: [_jsx("button", { type: "button", onClick: resetForm, className: "rounded-md border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-slate-500 hover:text-white", disabled: submitting, children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSubmit, className: "rounded-md bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:bg-slate-600", disabled: submitting, children: submitting ? "Saving…" : "Create Commentary" })] })] })), loading && (_jsx("div", { className: "rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-400", children: "Loading commentary\u2026" })), _jsxs("div", { className: "space-y-3", children: [entries.map((entry) => (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/50 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm text-slate-300", children: [_jsx("span", { className: "font-semibold", children: entry.speaker ?? "Unknown speaker" }), entry.source && (_jsx("span", { className: "rounded-md border border-slate-700 px-2 py-0.5 text-xs text-slate-400", children: entry.source })), entry.genre && (_jsx("span", { className: "rounded-md border border-slate-700 px-2 py-0.5 text-xs text-slate-400", children: entry.genre })), _jsx("span", { className: "ml-auto text-xs text-slate-500", children: entry.review?.state ?? "review_pending" })] }), (entry.tags?.length ?? 0) > 0 && (_jsx("div", { className: "mt-2 flex flex-wrap gap-2 text-xs text-slate-400", children: entry.tags?.map((tag) => (_jsxs("span", { className: "rounded-full bg-slate-800 px-2 py-1", children: ["#", tag] }, `${entry.commentary_id}-tag-${tag}`))) })), _jsx("div", { className: "mt-3 space-y-2 text-sm text-slate-300", children: languages.map((lang) => {
                                    const text = entry.texts?.[lang];
                                    if (!text || !text.trim()) {
                                        return null;
                                    }
                                    return (_jsxs("p", { children: [_jsxs("span", { className: "mr-2 text-xs uppercase text-slate-500", children: [lang, ":"] }), text] }, `${entry.commentary_id}-text-${lang}`));
                                }) }), _jsx("div", { className: "mt-3 flex flex-wrap items-center gap-2 text-xs", children: _jsx("button", { type: "button", onClick: () => {
                                        const target = window.prompt("Duplicate to verse ID (e.g., V0002):", entry.verse_id ?? "");
                                        if (target) {
                                            void onDuplicate(entry.commentary_id, target.trim());
                                        }
                                    }, className: "rounded-md border border-slate-700 px-2 py-1 text-slate-300 transition hover:border-brand hover:text-white", children: "Duplicate to\u2026" }) })] }, entry.commentary_id))), !loading && !entries.length && (_jsx("div", { className: "rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-xs text-slate-500", children: "No commentary linked to this verse yet." }))] })] }));
}
export function ReviewTab({ status, requiredReviewers, validationErrors, canApprove, canReject, canFlag, canLock, isProcessing, onApprove, onReject, onFlag, onLock, }) {
    const [issues, setIssues] = useState([]);
    const updateIssue = (index, update) => {
        setIssues((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...update };
            return next;
        });
    };
    const addIssue = () => {
        setIssues((prev) => [
            ...prev,
            {
                path: "",
                lang: "",
                problem: "",
                found: "",
                expected: "",
                suggestion: "",
                severity: "minor",
            },
        ]);
    };
    const removeIssue = (index) => {
        setIssues((prev) => prev.filter((_, idx) => idx !== index));
    };
    const handleReject = async () => {
        await onReject(issues
            .map((issue) => ({
            ...issue,
            path: issue.path?.trim() || undefined,
            lang: issue.lang?.trim() || undefined,
            problem: issue.problem?.trim() || undefined,
            found: issue.found?.trim() || undefined,
            expected: issue.expected?.trim() || undefined,
            suggestion: issue.suggestion?.trim() || undefined,
            severity: issue.severity ?? "minor",
        }))
            .filter((issue) => issue.problem));
        setIssues([]);
    };
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm text-slate-300", children: [_jsxs("span", { className: "font-semibold uppercase tracking-wide text-slate-100", children: ["Review State: ", status.replace("_", " ")] }), _jsxs("span", { className: "text-xs text-slate-500", children: ["Required reviewers: ", requiredReviewers.join(", ") || "—"] })] }), !!validationErrors.length && (_jsxs("div", { className: "mt-3 rounded-md border border-amber-700 bg-amber-950/30 px-3 py-2 text-xs text-amber-200", children: [_jsx("strong", { className: "font-semibold", children: "Validation warnings:" }), _jsx("ul", { className: "mt-1 list-disc pl-4", children: validationErrors.map((warning, index) => (_jsx("li", { children: warning }, `validation-warning-${index}`))) })] }))] }), _jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-200", children: "Issues" }), _jsx("button", { type: "button", onClick: addIssue, className: "rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand hover:text-white", children: "+ Add issue" })] }), _jsxs("div", { className: "space-y-3", children: [issues.map((issue, index) => (_jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-950/50 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-slate-400", children: [_jsx("input", { placeholder: "JSON path (optional)", value: issue.path ?? "", onChange: (event) => updateIssue(index, { path: event.target.value }), className: "flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs focus:border-brand focus:outline-none" }), _jsx("input", { placeholder: "Lang", value: issue.lang ?? "", onChange: (event) => updateIssue(index, { lang: event.target.value }), className: "w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs uppercase focus:border-brand focus:outline-none" }), _jsxs("select", { value: issue.severity ?? "minor", onChange: (event) => updateIssue(index, { severity: event.target.value }), className: "rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs focus:border-brand focus:outline-none", children: [_jsx("option", { value: "minor", children: "Minor" }), _jsx("option", { value: "major", children: "Major" }), _jsx("option", { value: "critical", children: "Critical" })] }), _jsx("button", { type: "button", onClick: () => removeIssue(index), className: "ml-auto rounded-md border border-rose-700 px-2 py-1 text-rose-300 hover:border-rose-500", children: "\u2715 Remove" })] }), _jsxs("div", { className: "mt-2 grid gap-2 md:grid-cols-2", children: [_jsx("textarea", { placeholder: "Describe the problem", value: issue.problem ?? "", onChange: (event) => updateIssue(index, { problem: event.target.value }), className: "min-h-[4rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" }), _jsx("textarea", { placeholder: "Found text", value: issue.found ?? "", onChange: (event) => updateIssue(index, { found: event.target.value }), className: "min-h-[4rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" }), _jsx("textarea", { placeholder: "Expected text", value: issue.expected ?? "", onChange: (event) => updateIssue(index, { expected: event.target.value }), className: "min-h-[4rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" }), _jsx("textarea", { placeholder: "Suggestion", value: issue.suggestion ?? "", onChange: (event) => updateIssue(index, { suggestion: event.target.value }), className: "min-h-[4rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" })] })] }, `issue-${index}`))), !issues.length && (_jsx("p", { className: "text-xs text-slate-500", children: "No blocking issues provided. Add issues before rejecting." }))] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: () => void onApprove(), disabled: !canApprove || isProcessing, className: "rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700", children: "Approve" }), _jsx("button", { type: "button", onClick: handleReject, disabled: !canReject || isProcessing, className: "rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-700", children: "Reject" }), _jsx("button", { type: "button", onClick: () => void onFlag(), disabled: !canFlag || isProcessing, className: "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700", children: "Flag" }), _jsx("button", { type: "button", onClick: () => void onLock(), disabled: !canLock || isProcessing, className: "rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500 disabled:cursor-not-allowed disabled:bg-slate-700", children: "Lock" })] })] }));
}
export function HistoryTab({ history }) {
    const handleCopy = async (entry) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
        }
        catch (error) {
            console.warn("Clipboard copy failed", error);
        }
    };
    return (_jsxs("div", { className: "space-y-3", children: [history.map((entry, index) => (_jsxs("details", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("summary", { className: "flex cursor-pointer flex-wrap items-center gap-2 text-sm text-slate-200", children: [_jsx("span", { className: "font-semibold", children: new Date(entry.ts).toLocaleString() }), _jsxs("span", { className: "text-xs text-slate-400", children: ["@", entry.actor] }), _jsx("span", { className: "rounded-md border border-slate-700 px-2 py-0.5 text-xs uppercase text-slate-400", children: entry.action }), entry.from && entry.to && (_jsxs("span", { className: "text-xs text-slate-400", children: [entry.from, " \u2192 ", entry.to] })), _jsxs("span", { className: "ml-auto text-xs text-slate-500", children: [(entry.issues?.length ?? 0) || 0, " issue(s)"] })] }), _jsxs("div", { className: "mt-3 space-y-2 text-xs text-slate-300", children: [entry.issues?.length ? (_jsx("div", { className: "space-y-2", children: entry.issues.map((issue, idx) => (_jsxs("div", { className: "rounded-md border border-slate-800 bg-slate-950/40 p-2", children: [_jsxs("div", { className: "flex flex-wrap gap-2 text-slate-400", children: [issue.path && _jsxs("span", { children: ["path: ", issue.path] }), issue.lang && _jsxs("span", { children: ["lang: ", issue.lang] }), issue.severity && _jsxs("span", { children: ["severity: ", issue.severity] })] }), issue.problem && (_jsxs("p", { className: "text-slate-200", children: ["Problem: ", issue.problem] })), issue.found && (_jsxs("p", { className: "text-slate-400", children: ["Found: ", issue.found] })), issue.expected && (_jsxs("p", { className: "text-slate-400", children: ["Expected: ", issue.expected] })), issue.suggestion && (_jsxs("p", { className: "text-slate-400", children: ["Suggestion: ", issue.suggestion] }))] }, `history-${index}-issue-${idx}`))) })) : (_jsx("p", { className: "text-slate-500", children: "No issues recorded." })), _jsx("button", { type: "button", onClick: () => void handleCopy(entry), className: "rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand hover:text-white", children: "Copy entry JSON" })] })] }, `history-${index}`))), !history.length && (_jsx("div", { className: "rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-xs text-slate-500", children: "No review history yet." }))] }));
}
export function PreviewTab({ canonicalLang, languages, texts, commentary, }) {
    const fallbackOrder = useMemo(() => Array.from(new Set([canonicalLang, "bn", "en", "or", "hi", "as", ...languages])), [canonicalLang, languages]);
    const primaryText = fallbackOrder
        .map((lang) => texts[lang]?.trim())
        .find((value) => value && value.length) ?? "(No canonical text)";
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-slate-100", children: [_jsx("h3", { className: "mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400", children: "Verse Preview" }), _jsx("p", { className: "whitespace-pre-wrap text-base leading-relaxed", children: primaryText }), _jsx("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: fallbackOrder.map((lang) => {
                            if (lang === canonicalLang) {
                                return null;
                            }
                            const text = texts[lang];
                            if (!text || !text.trim()) {
                                return null;
                            }
                            return (_jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300", children: [_jsx("h4", { className: "mb-1 text-xs uppercase text-slate-500", children: lang }), _jsx("p", { className: "whitespace-pre-wrap", children: text })] }, `preview-lang-${lang}`));
                        }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-200", children: "Commentary" }), commentary.map((entry) => (_jsxs("details", { className: "rounded-xl border border-slate-800 bg-slate-900/50 p-4", children: [_jsxs("summary", { className: "cursor-pointer text-sm text-slate-200", children: [entry.speaker ?? "Commentary", " ", _jsx("span", { className: "text-xs text-slate-500", children: entry.source ?? entry.commentary_id })] }), _jsx("div", { className: "mt-3 space-y-2 text-sm text-slate-300", children: fallbackOrder.map((lang) => {
                                    const text = entry.texts?.[lang];
                                    if (!text || !text.trim()) {
                                        return null;
                                    }
                                    return (_jsxs("p", { children: [_jsxs("span", { className: "mr-2 text-xs uppercase text-slate-500", children: [lang, ":"] }), text] }, `${entry.commentary_id}-preview-${lang}`));
                                }) })] }, `preview-commentary-${entry.commentary_id}`))), !commentary.length && (_jsx("div", { className: "rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-xs text-slate-500", children: "No commentary to preview." }))] })] }));
}
export function AttachmentsTab({ attachments, onAdd, onUpdate, onRemove, }) {
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-200", children: "Reference links & attachments" }), _jsx("button", { type: "button", onClick: onAdd, className: "rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-brand hover:text-white", children: "+ Add Attachment" })] }), _jsxs("div", { className: "space-y-3", children: [attachments.map((attachment, index) => (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Label" }), _jsx("input", { value: attachment.label, onChange: (event) => onUpdate(index, { label: event.target.value }), className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none", placeholder: "Attachment label" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "URL" }), _jsx("input", { value: attachment.url, onChange: (event) => onUpdate(index, { url: event.target.value }), className: "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-brand focus:outline-none", placeholder: "https://\u2026" })] })] }), _jsxs("div", { className: "mt-3 flex flex-col gap-1", children: [_jsx("label", { className: "text-xs uppercase text-slate-400", children: "Notes" }), _jsx("textarea", { value: attachment.notes ?? "", onChange: (event) => onUpdate(index, { notes: event.target.value }), className: "min-h-[4rem] rounded-md border border-slate-700 bg-black/30 p-2 text-sm text-slate-100 focus:border-brand focus:outline-none" })] }), _jsx("div", { className: "mt-3 text-right", children: _jsx("button", { type: "button", onClick: () => onRemove(index), className: "rounded-md border border-rose-700 px-2 py-1 text-xs text-rose-300 transition hover:border-rose-500", children: "\u2715 Remove" }) })] }, `attachment-${index}`))), !attachments.length && (_jsx("div", { className: "rounded-md border border-slate-800 bg-slate-900/60 px-3 py-4 text-center text-xs text-slate-500", children: "No attachments yet." }))] })] }));
}
