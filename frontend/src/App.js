import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { VerseNavigator } from "./components/VerseNavigator";
import { EditorModal } from "./components/EditorModal";
import { VerseTab } from "./components/VerseTab";
import { AuthModal } from "./components/AuthModal";
import { CommandPalette } from "./components/CommandPalette";
import { AttachmentsTab, CommentaryTab, HistoryTab, OriginTab, PreviewTab, ReviewTab, SegmentsTab, TranslationsTab, } from "./components/EditorTabs";
import { useAuth } from "./context/AuthContext";
import { useAutosave } from "./hooks/useAutosave";
import { API_BASE_URL, apiClient, formatError } from "./lib/apiClient";
const REQUIRED_LANGS = ["bn", "en", "or", "hi", "as"];
const AUTOSAVE_INTERVAL = 30_000;
const DEFAULT_TABS = [
    { key: "verse", label: "Verse" },
    { key: "translations", label: "Translations" },
    { key: "segments", label: "Segments" },
    { key: "origin", label: "Origin" },
    { key: "commentary", label: "Commentary" },
    { key: "review", label: "Review" },
    { key: "history", label: "History" },
    { key: "preview", label: "Preview" },
    { key: "attachments", label: "Attachments" },
];
const STATUS_DEFAULT = "draft";
function buildInitialDraft(work) {
    const canonicalLang = work?.canonical_lang ?? "bn";
    const languageSet = new Set([
        canonicalLang,
        "en",
        ...REQUIRED_LANGS,
        ...(work?.langs ?? []),
    ]);
    const languages = Array.from(languageSet);
    const initialTexts = {};
    const initialSegments = {};
    languages.forEach((lang) => {
        initialTexts[lang] = "";
        initialSegments[lang] = [];
    });
    const origin = work?.source_editions?.length && work.source_editions[0]
        ? [
            {
                edition: work.source_editions[0].id,
                page: 1,
                para_index: 1,
            },
        ]
        : [];
    return {
        verseId: undefined,
        manualNumber: "",
        systemOrder: null,
        texts: initialTexts,
        segments: initialSegments,
        tags: [],
        origin,
        status: STATUS_DEFAULT,
        reviewRequired: ["editor", "linguist", "final"],
        commentary: [],
        history: [],
        attachments: [],
    };
}
function formatTimestamp(iso) {
    if (!iso) {
        return null;
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export default function App() {
    const [works, setWorks] = useState([]);
    const [selectedWorkId, setSelectedWorkId] = useState("");
    const [workDetail, setWorkDetail] = useState(null);
    const [verseDraft, setVerseDraft] = useState(buildInitialDraft(null));
    const [activeTab, setActiveTab] = useState("verse");
    const [isSaving, setIsSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [bannerMessage, setBannerMessage] = useState(null);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isPaletteOpen, setPaletteOpen] = useState(false);
    const [paletteQuery, setPaletteQuery] = useState("");
    const [verseList, setVerseList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [commentaryLoading, setCommentaryLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });
    const [connection, setConnection] = useState({
        healthy: null,
        checking: true,
        baseUrl: API_BASE_URL,
    });
    const [isReviewProcessing, setReviewProcessing] = useState(false);
    const { user, logout } = useAuth();
    const rolePriority = {
        author: 1,
        reviewer: 2,
        final: 3,
        admin: 4,
    };
    const userRoleLevel = useMemo(() => {
        if (!user?.roles?.length) {
            return 0;
        }
        return user.roles.reduce((max, role) => Math.max(max, rolePriority[role] ?? 1), 1);
    }, [user?.roles]);
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            setBannerMessage("Signed out successfully.");
        }
        catch (error) {
            setBannerMessage(`Logout failed: ${formatError(error)}`);
        }
    }, [logout]);
    const pingConnection = useCallback(async () => {
        setConnection((prev) => ({ ...prev, checking: true }));
        try {
            await apiClient.get("/health", { timeout: 5000 });
            setConnection({ healthy: true, checking: false, baseUrl: API_BASE_URL });
        }
        catch {
            setConnection({ healthy: false, checking: false, baseUrl: API_BASE_URL });
        }
    }, []);
    const fetchWorks = useCallback(async () => {
        try {
            const response = await apiClient.get("/works");
            setWorks(response.data);
            if (!selectedWorkId && response.data.length > 0) {
                setSelectedWorkId(response.data[0].work_id);
            }
        }
        catch (error) {
            setWorks([]);
            setBannerMessage(`Failed to load works: ${formatError(error)}`);
        }
    }, [selectedWorkId]);
    const fetchWorkDetail = useCallback(async (workId) => {
        if (!workId) {
            return;
        }
        try {
            const response = await apiClient.get(`/works/${workId}`);
            setWorkDetail(response.data);
            setVerseDraft(buildInitialDraft(response.data));
            setDirty(false);
            setLastSavedAt(null);
            setErrorMessage(null);
        }
        catch (error) {
            setWorkDetail(null);
            setBannerMessage(`Failed to load work: ${formatError(error)}`);
        }
    }, []);
    const fetchVerseCommentary = useCallback(async (workId, verseId) => {
        setCommentaryLoading(true);
        try {
            const response = await apiClient.get(`/works/${workId}/verses/${verseId}/commentary`);
            setVerseDraft((prev) => ({ ...prev, commentary: response.data }));
        }
        catch (error) {
            setBannerMessage(`Failed to load commentary: ${formatError(error)}`);
        }
        finally {
            setCommentaryLoading(false);
        }
    }, []);
    const loadVerseList = useCallback(async (options) => {
        if (!selectedWorkId) {
            return;
        }
        const offset = options?.offset ?? 0;
        const query = options?.query ?? searchTerm;
        setListLoading(true);
        try {
            const response = await apiClient.get(`/works/${selectedWorkId}/verses`, { params: { offset, limit: pagination.limit, q: query || undefined } });
            setVerseList(response.data.items ?? []);
            const total = response.data.total ?? response.data.items?.length ?? 0;
            setPagination((prev) => ({ offset, limit: prev.limit, total }));
        }
        catch (error) {
            setVerseList([]);
            setBannerMessage(`Failed to load verses: ${formatError(error)}`);
        }
        finally {
            setListLoading(false);
        }
    }, [selectedWorkId, pagination.limit, searchTerm]);
    const loadVerseDetail = useCallback(async (verseId) => {
        if (!selectedWorkId) {
            return;
        }
        try {
            const response = await apiClient.get(`/works/${selectedWorkId}/verses/${verseId}`);
            const verse = response.data;
            const languages = Array.from(new Set([
                ...REQUIRED_LANGS,
                ...(workDetail?.langs ?? []),
                ...Object.keys(verse?.texts ?? {}),
            ]));
            const textMap = {};
            languages.forEach((lang) => {
                const value = verse?.texts?.[lang];
                textMap[lang] = value ?? "";
            });
            const segments = {};
            languages.forEach((lang) => {
                const rawSegments = verse?.segments?.[lang];
                segments[lang] = Array.isArray(rawSegments) ? rawSegments : [];
            });
            const reviewBlock = verse?.review ?? {};
            const history = reviewBlock.history ?? [];
            setVerseDraft({
                verseId: verse?.verse_id ?? verseId,
                manualNumber: verse?.number_manual ?? "",
                systemOrder: verse?.order ?? null,
                texts: textMap,
                segments,
                tags: verse?.tags ?? [],
                origin: verse?.origin ?? [],
                status: reviewBlock.state ?? STATUS_DEFAULT,
                reviewRequired: reviewBlock.required_reviewers ?? ["editor", "linguist", "final"],
                commentary: [],
                history,
                attachments: verse?.attachments ?? [],
            });
            setDirty(false);
            setErrorMessage(null);
            await fetchVerseCommentary(selectedWorkId, verseId);
            setLastSavedAt(null);
        }
        catch (error) {
            setCommentaryLoading(false);
            setBannerMessage(`Failed to load verse: ${formatError(error)}`);
        }
    }, [selectedWorkId, workDetail, fetchVerseCommentary]);
    useEffect(() => {
        void fetchWorks();
    }, [fetchWorks]);
    useEffect(() => {
        const handler = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setPaletteQuery((current) => (current ? current : searchTerm));
                setPaletteOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchTerm]);
    useEffect(() => {
        if (!isPaletteOpen) {
            setPaletteQuery("");
        }
    }, [isPaletteOpen]);
    useEffect(() => {
        void pingConnection();
        const id = window.setInterval(() => {
            void pingConnection();
        }, 20_000);
        return () => window.clearInterval(id);
    }, [pingConnection]);
    useEffect(() => {
        if (selectedWorkId) {
            void fetchWorkDetail(selectedWorkId);
            void loadVerseList({ offset: 0 });
        }
        else {
            setVerseList([]);
            setPagination((prev) => ({ ...prev, offset: 0, total: 0 }));
        }
    }, [selectedWorkId, fetchWorkDetail, loadVerseList]);
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        void loadVerseList({ offset: 0, query: term });
    }, [loadVerseList]);
    const handlePageChange = useCallback((nextOffset) => {
        if (nextOffset < 0) {
            nextOffset = 0;
        }
        void loadVerseList({ offset: nextOffset });
    }, [loadVerseList]);
    const handleVerseSelect = useCallback((verseId) => {
        if (verseId) {
            void loadVerseDetail(verseId);
            return;
        }
        const nextDraft = buildInitialDraft(workDetail);
        setVerseDraft(nextDraft);
        setDirty(false);
        setLastSavedAt(null);
        setErrorMessage(null);
    }, [loadVerseDetail, workDetail]);
    const openCommandPalette = useCallback(() => {
        setPaletteQuery(searchTerm);
        setPaletteOpen(true);
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);
    const handleCommandSelect = useCallback((verseId) => {
        handleVerseSelect(verseId);
        setPaletteOpen(false);
        setPaletteQuery("");
    }, [handleVerseSelect]);
    const setDraft = useCallback((updater) => {
        setVerseDraft((prev) => {
            const next = updater(prev);
            return next;
        });
        setDirty(true);
    }, []);
    const handleManualNumberChange = (value) => {
        setErrorMessage(null);
        setDraft((prev) => ({ ...prev, manualNumber: value }));
    };
    const handleTextChange = (lang, value) => {
        setDraft((prev) => {
            const languageUniverse = Array.from(new Set([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])]));
            const nextTexts = { ...prev.texts };
            languageUniverse.forEach((item) => {
                if (!(item in nextTexts)) {
                    nextTexts[item] = "";
                }
            });
            nextTexts[lang] = value;
            return {
                ...prev,
                texts: nextTexts,
            };
        });
    };
    const handleTagsChange = (tags) => {
        setDraft((prev) => ({ ...prev, tags }));
    };
    const handleSegmentsChange = useCallback((lang, nextSegments) => {
        setDraft((prev) => ({
            ...prev,
            segments: {
                ...prev.segments,
                [lang]: nextSegments,
            },
        }));
    }, [setDraft]);
    const handleOriginAdd = useCallback(() => {
        setDraft((prev) => ({
            ...prev,
            origin: [
                ...prev.origin,
                {
                    edition: "",
                    page: undefined,
                    para_index: undefined,
                },
            ],
        }));
    }, [setDraft]);
    const handleOriginUpdate = useCallback((index, update) => {
        setDraft((prev) => {
            const next = [...prev.origin];
            next[index] = { ...next[index], ...update };
            return { ...prev, origin: next };
        });
    }, [setDraft]);
    const handleOriginRemove = useCallback((index) => {
        setDraft((prev) => {
            const next = prev.origin.filter((_, idx) => idx !== index);
            return { ...prev, origin: next };
        });
    }, [setDraft]);
    const handleAttachmentAdd = useCallback(() => {
        setDraft((prev) => ({
            ...prev,
            attachments: [
                ...prev.attachments,
                { label: "", url: "", notes: "" },
            ],
        }));
    }, [setDraft]);
    const handleAttachmentUpdate = useCallback((index, update) => {
        setDraft((prev) => {
            const next = [...prev.attachments];
            next[index] = { ...next[index], ...update };
            return { ...prev, attachments: next };
        });
    }, [setDraft]);
    const handleAttachmentRemove = useCallback((index) => {
        setDraft((prev) => {
            const next = prev.attachments.filter((_, idx) => idx !== index);
            return { ...prev, attachments: next };
        });
    }, [setDraft]);
    const handleCommentaryCreate = useCallback(async (payload) => {
        if (!selectedWorkId || !verseDraft.verseId) {
            setBannerMessage("Select a verse before adding commentary.");
            return;
        }
        const textsPayload = Object.fromEntries(Object.entries(payload.texts ?? {}).map(([lang, value]) => [lang, value?.trim() || ""]));
        try {
            await apiClient.post(`/works/${selectedWorkId}/verses/${verseDraft.verseId}/commentary`, {
                speaker: payload.speaker,
                source: payload.source,
                genre: payload.genre,
                tags: payload.tags,
                texts: textsPayload,
            });
            await fetchVerseCommentary(selectedWorkId, verseDraft.verseId);
            setBannerMessage("Commentary note added.");
        }
        catch (error) {
            setBannerMessage(`Failed to add commentary: ${formatError(error)}`);
        }
    }, [selectedWorkId, verseDraft.verseId, fetchVerseCommentary]);
    const handleCommentaryDuplicate = useCallback(async (commentaryId, targetVerseId) => {
        if (!selectedWorkId) {
            return;
        }
        const source = verseDraft.commentary.find((entry) => entry.commentary_id === commentaryId);
        if (!source) {
            setBannerMessage("Unable to duplicate commentary: entry not found.");
            return;
        }
        try {
            await apiClient.post(`/works/${selectedWorkId}/verses/${targetVerseId}/commentary`, {
                speaker: source.speaker,
                source: source.source,
                genre: source.genre,
                tags: source.tags ?? [],
                texts: Object.fromEntries(Object.entries(source.texts ?? {}).map(([lang, value]) => [lang, value ?? ""])),
            });
            if (targetVerseId === verseDraft.verseId) {
                await fetchVerseCommentary(selectedWorkId, targetVerseId);
            }
            setBannerMessage(`Commentary duplicated to ${targetVerseId}.`);
        }
        catch (error) {
            setBannerMessage(`Failed to duplicate commentary: ${formatError(error)}`);
        }
    }, [selectedWorkId, verseDraft.commentary, verseDraft.verseId, fetchVerseCommentary]);
    const preparePayload = useCallback((options) => {
        if (!workDetail) {
            return null;
        }
        const manualNumber = verseDraft.manualNumber.trim();
        if (!manualNumber) {
            if (!options?.silent) {
                setErrorMessage("Manual verse number is required.");
            }
            return null;
        }
        const canonicalLang = workDetail.canonical_lang;
        const canonicalText = verseDraft.texts[canonicalLang]?.trim() ?? "";
        if (!canonicalText) {
            if (!options?.silent) {
                setErrorMessage(`Canonical text (${canonicalLang.toUpperCase()}) must not be empty.`);
            }
            return null;
        }
        const textPayload = {};
        Object.entries(verseDraft.texts).forEach(([lang, value]) => {
            const trimmed = value?.trim() ?? "";
            textPayload[lang] = trimmed.length ? trimmed : null;
        });
        const segmentPayload = {};
        Object.entries(verseDraft.segments ?? {}).forEach(([lang, entries]) => {
            const sanitized = (entries ?? []).map((item) => item.trim()).filter(Boolean);
            if (sanitized.length) {
                segmentPayload[lang] = sanitized;
            }
        });
        const languageUniverse = Array.from(new Set([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])]));
        languageUniverse.forEach((lang) => {
            if (!(lang in textPayload)) {
                textPayload[lang] = null;
            }
            if (!(lang in segmentPayload)) {
                segmentPayload[lang] = [];
            }
        });
        return {
            number_manual: manualNumber,
            texts: textPayload,
            origin: verseDraft.origin.length
                ? verseDraft.origin
                : [
                    {
                        edition: workDetail.source_editions[0]?.id ?? "UNKNOWN",
                        page: 1,
                        para_index: 1,
                    },
                ],
            tags: verseDraft.tags,
            segments: segmentPayload,
            attachments: verseDraft.attachments,
        };
    }, [verseDraft, workDetail]);
    const handleSave = useCallback(async (options) => {
        if (!selectedWorkId || !workDetail) {
            return;
        }
        const payload = preparePayload({ silent: options?.silent });
        if (!payload) {
            return;
        }
        setIsSaving(true);
        setErrorMessage(null);
        try {
            let savedVerseId = verseDraft.verseId;
            if (verseDraft.verseId) {
                await apiClient.put(`/works/${selectedWorkId}/verses/${verseDraft.verseId}`, payload);
            }
            else {
                const response = await apiClient.post(`/works/${selectedWorkId}/verses`, payload);
                const verseId = response.data?.verse_id;
                if (verseId) {
                    savedVerseId = verseId;
                    setVerseDraft((prev) => ({ ...prev, verseId }));
                }
            }
            setDirty(false);
            setLastSavedAt(new Date().toISOString());
            if (!options?.silent) {
                setBannerMessage("Verse saved successfully.");
            }
            if (!options?.silent) {
                void loadVerseList({ offset: pagination.offset, query: searchTerm });
            }
            if (options?.advance) {
                setVerseDraft((prev) => ({
                    ...buildInitialDraft(workDetail),
                    manualNumber: incrementManualNumber(prev.manualNumber),
                }));
                setLastSavedAt(null);
                setDirty(false);
            }
            else if (savedVerseId && !options?.silent) {
                void loadVerseDetail(savedVerseId);
            }
        }
        catch (error) {
            const message = formatError(error);
            setErrorMessage(message);
            if (!options?.silent) {
                setBannerMessage(`Save failed: ${message}`);
            }
        }
        finally {
            setIsSaving(false);
        }
    }, [preparePayload, selectedWorkId, verseDraft.verseId, workDetail, loadVerseList, pagination.offset, searchTerm, loadVerseDetail]);
    useAutosave(() => handleSave({ silent: true }), dirty && !isSaving, AUTOSAVE_INTERVAL);
    const handleSaveAndNext = () => {
        void handleSave({ advance: true });
    };
    const formattedSavedAt = useMemo(() => formatTimestamp(lastSavedAt), [lastSavedAt]);
    const canonicalLang = workDetail?.canonical_lang ?? "bn";
    const workLanguages = useMemo(() => Array.from(new Set([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])])), [workDetail?.langs]);
    const validationErrors = useMemo(() => {
        const errors = [];
        if (!(verseDraft.texts[canonicalLang]?.trim())) {
            errors.push(`Canonical text (${canonicalLang.toUpperCase()}) is required.`);
        }
        if (!verseDraft.origin.length) {
            errors.push("At least one origin reference is required before approval.");
        }
        return errors;
    }, [verseDraft.texts, verseDraft.origin, canonicalLang]);
    const canApprove = userRoleLevel >= 2 && !!verseDraft.verseId;
    const canReject = userRoleLevel >= 2 && !!verseDraft.verseId;
    const canFlag = userRoleLevel >= 2 && !!verseDraft.verseId;
    const canLock = userRoleLevel >= 3 && !!verseDraft.verseId;
    const handleValidate = useCallback(() => {
        if (validationErrors.length) {
            setBannerMessage(`Validation failed: ${validationErrors.join("; ")}`);
        }
        else {
            setBannerMessage("Validation passed. Ready for review.");
        }
    }, [validationErrors]);
    const performReviewAction = useCallback(async (action, issues) => {
        const currentVerseId = verseDraft.verseId;
        if (!selectedWorkId || !currentVerseId) {
            setBannerMessage("Select a verse before performing review actions.");
            return;
        }
        setReviewProcessing(true);
        try {
            const endpointMap = {
                approve: `/review/verse/${currentVerseId}/approve`,
                reject: `/review/verse/${currentVerseId}/reject`,
                flag: `/review/verse/${currentVerseId}/flag`,
                lock: `/review/verse/${currentVerseId}/lock`,
            };
            const payload = { work_id: selectedWorkId };
            if (action === "reject") {
                payload.issues = issues ?? [];
            }
            await apiClient.post(endpointMap[action], payload);
            await loadVerseDetail(currentVerseId);
            await loadVerseList({ offset: pagination.offset, query: searchTerm });
            const actionMessage = action === "approve"
                ? "approved"
                : action === "reject"
                    ? "sent back with requested changes"
                    : action === "flag"
                        ? "flagged for follow-up"
                        : "locked";
            setBannerMessage(`Verse ${currentVerseId} ${actionMessage}.`);
        }
        catch (error) {
            setBannerMessage(`Review action failed: ${formatError(error)}`);
        }
        finally {
            setReviewProcessing(false);
        }
    }, [
        verseDraft.verseId,
        selectedWorkId,
        loadVerseDetail,
        loadVerseList,
        pagination.offset,
        searchTerm,
    ]);
    const handleApproveAction = useCallback(async () => {
        if (validationErrors.length) {
            setBannerMessage(`Resolve validation issues before approval: ${validationErrors.join("; ")}`);
            return;
        }
        await performReviewAction("approve");
    }, [performReviewAction, validationErrors]);
    const handleRejectAction = useCallback(async (issues) => {
        await performReviewAction("reject", issues);
    }, [performReviewAction]);
    const handleFlagAction = useCallback(async () => {
        await performReviewAction("flag");
    }, [performReviewAction]);
    const renderActiveTab = () => {
        switch (activeTab) {
            case "verse":
                return (_jsx(VerseTab, { draft: verseDraft, canonicalLang: canonicalLang, workId: workDetail?.work_id ?? "", workLangs: workLanguages, errorMessage: errorMessage, onManualNumberChange: handleManualNumberChange, onTextChange: handleTextChange, onTagsChange: handleTagsChange }));
            case "translations":
                return (_jsx(TranslationsTab, { languages: workLanguages, canonicalLang: canonicalLang, texts: verseDraft.texts, onChange: handleTextChange }));
            case "segments":
                return (_jsx(SegmentsTab, { languages: workLanguages, segments: verseDraft.segments, texts: verseDraft.texts, onChange: handleSegmentsChange }));
            case "origin":
                return (_jsx(OriginTab, { origin: verseDraft.origin, editions: workDetail?.source_editions ?? [], onAdd: handleOriginAdd, onUpdate: handleOriginUpdate, onRemove: handleOriginRemove }));
            case "commentary":
                return (_jsx(CommentaryTab, { verseId: verseDraft.verseId, languages: workLanguages, entries: verseDraft.commentary, loading: commentaryLoading, onCreate: handleCommentaryCreate, onDuplicate: handleCommentaryDuplicate }));
            case "review":
                return (_jsx(ReviewTab, { status: verseDraft.status, requiredReviewers: verseDraft.reviewRequired, validationErrors: validationErrors, canApprove: !isReviewProcessing && canApprove, canReject: !isReviewProcessing && canReject, canFlag: !isReviewProcessing && canFlag, canLock: !isReviewProcessing && canLock, isProcessing: isReviewProcessing, onApprove: handleApproveAction, onReject: handleRejectAction, onFlag: handleFlagAction, onLock: handleLockAction }));
            case "history":
                return _jsx(HistoryTab, { history: verseDraft.history });
            case "preview":
                return (_jsx(PreviewTab, { canonicalLang: canonicalLang, languages: workLanguages, texts: verseDraft.texts, commentary: verseDraft.commentary }));
            case "attachments":
                return (_jsx(AttachmentsTab, { attachments: verseDraft.attachments, onAdd: handleAttachmentAdd, onUpdate: handleAttachmentUpdate, onRemove: handleAttachmentRemove }));
            default:
                return null;
        }
    };
    const handleLockAction = useCallback(async () => {
        await performReviewAction("lock");
    }, [performReviewAction]);
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 pb-12", children: [_jsx(HeaderBar, { works: works, selectedWorkId: selectedWorkId, onWorkChange: setSelectedWorkId, status: verseDraft.status, isSaving: isSaving, lastSavedAt: formattedSavedAt, connection: connection, userEmail: user?.email ?? null, onLoginClick: () => setAuthModalOpen(true), onLogoutClick: () => void handleLogout(), onSave: () => void handleSave(), onSaveNext: handleSaveAndNext, onValidate: handleValidate, onApprove: () => void handleApproveAction(), onReject: () => { setActiveTab("review"); setBannerMessage("Enter rejection issues in the Review tab before submitting."); }, onFlag: () => void handleFlagAction(), onLock: () => void handleLockAction(), onOpenVerseJump: openCommandPalette, canApprove: !isReviewProcessing && canApprove, canReject: !isReviewProcessing && canReject, canFlag: !isReviewProcessing && canFlag, canLock: !isReviewProcessing && canLock }), _jsxs("main", { className: "mx-auto max-w-7xl px-6", children: [bannerMessage && (_jsx("div", { className: "mt-6 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: bannerMessage }), _jsx("button", { type: "button", className: "text-xs text-slate-400 hover:text-white", onClick: () => setBannerMessage(null), children: "Dismiss" })] }) })), _jsxs("div", { className: "mt-6 flex flex-col gap-6 lg:flex-row", children: [_jsx(VerseNavigator, { items: verseList, loading: listLoading, total: pagination.total, offset: pagination.offset, limit: pagination.limit, searchTerm: searchTerm, onSearch: handleSearch, onSelect: handleVerseSelect, selectedVerseId: verseDraft.verseId, onPageChange: handlePageChange, onCreateNew: () => handleVerseSelect(null) }), _jsx("div", { className: "flex-1", children: _jsx(EditorModal, { title: workDetail
                                        ? `${workDetail.title.en ?? workDetail.work_id} - Verse Editor`
                                        : "Verse Editor", tabs: DEFAULT_TABS, activeTab: activeTab, onTabChange: setActiveTab, children: renderActiveTab() }) })] })] }), _jsx(CommandPalette, { isOpen: isPaletteOpen, query: paletteQuery, items: verseList, loading: listLoading, onQueryChange: (value) => {
                    setPaletteQuery(value);
                    void handleSearch(value);
                }, onClose: () => setPaletteOpen(false), onSelect: (verseId) => handleCommandSelect(verseId) }), _jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: () => setAuthModalOpen(false) })] }));
}
function incrementManualNumber(current) {
    const numeric = parseInt(current, 10);
    if (Number.isNaN(numeric)) {
        return current;
    }
    return String(numeric + 1);
}
