import { useCallback, useEffect, useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { VerseNavigator } from "./components/VerseNavigator";
import { EditorModal, TabConfig } from "./components/EditorModal";
import { VerseTab } from "./components/VerseTab";
import { AuthModal } from "./components/AuthModal";
import { CommandPalette } from "./components/CommandPalette";
import { useAuth } from "./context/AuthContext";
import { useAutosave } from "./hooks/useAutosave";
import { API_BASE_URL, apiClient, formatError } from "./lib/apiClient";
import {
  OriginEntry,
  ReviewState,
  SavePayload,
  VerseDraft,
  VerseListItem,
  WorkDetail,
  WorkSummary,
} from "./lib/types";

interface SaveOptions {
  silent?: boolean;
  advance?: boolean;
}

const REQUIRED_LANGS = ["bn", "en", "or", "hi", "as"] as const;

const AUTOSAVE_INTERVAL = 30_000;

const DEFAULT_TABS: TabConfig[] = [
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

const STATUS_DEFAULT: ReviewState = "draft";

function buildInitialDraft(work: WorkDetail | null): VerseDraft {
  const canonicalLang = work?.canonical_lang ?? "bn";
  const languageSet = new Set<string>([
    canonicalLang,
    "en",
    ...REQUIRED_LANGS,
    ...(work?.langs ?? []),
  ]);
  const languages = Array.from(languageSet);

  const initialTexts: Record<string, string> = {};
  const initialSegments: Record<string, string[]> = {};
  languages.forEach((lang) => {
    initialTexts[lang] = "";
    initialSegments[lang] = [];
  });

  const origin: OriginEntry[] =
    work?.source_editions?.length && work.source_editions[0]
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
    commentary: [],
    history: [],
    attachments: [],
  };
}

function formatTimestamp(iso: string | null): string | null {
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
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [workDetail, setWorkDetail] = useState<WorkDetail | null>(null);
  const [verseDraft, setVerseDraft] = useState<VerseDraft>(buildInitialDraft(null));
  const [activeTab, setActiveTab] = useState<string>("verse");
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [verseList, setVerseList] = useState<VerseListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });
  const [connection, setConnection] = useState({
    healthy: null as boolean | null,
    checking: true,
    baseUrl: API_BASE_URL,
  });

  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setBannerMessage("Signed out successfully.");
    } catch (error) {
      setBannerMessage(`Logout failed: ${formatError(error)}`);
    }
  }, [logout]);

  const pingConnection = useCallback(async () => {
    setConnection((prev) => ({ ...prev, checking: true }));
    try {
      await apiClient.get("/health", { timeout: 5000 });
      setConnection({ healthy: true, checking: false, baseUrl: API_BASE_URL });
    } catch {
      setConnection({ healthy: false, checking: false, baseUrl: API_BASE_URL });
    }
  }, []);

  const fetchWorks = useCallback(async () => {
    try {
      const response = await apiClient.get<WorkSummary[]>("/works");
      setWorks(response.data);
      if (!selectedWorkId && response.data.length > 0) {
        setSelectedWorkId(response.data[0].work_id);
      }
    } catch (error) {
      setWorks([]);
      setBannerMessage(`Failed to load works: ${formatError(error)}`);
    }
  }, [selectedWorkId]);

  const fetchWorkDetail = useCallback(
    async (workId: string) => {
      if (!workId) {
        return;
      }
      try {
        const response = await apiClient.get<WorkDetail>(`/works/${workId}`);
        setWorkDetail(response.data);
        setVerseDraft(buildInitialDraft(response.data));
        setDirty(false);
        setLastSavedAt(null);
        setErrorMessage(null);
      } catch (error) {
        setWorkDetail(null);
        setBannerMessage(`Failed to load work: ${formatError(error)}`);
      }
    },
    [],
  );

  const loadVerseList = useCallback(
    async (options?: { offset?: number; query?: string }) => {
      if (!selectedWorkId) {
        return;
      }
      const offset = options?.offset ?? 0;
      const query = options?.query ?? searchTerm;
      setListLoading(true);
      try {
        const response = await apiClient.get<{ items: VerseListItem[]; next: { offset: number; limit: number } | null; total: number }>(
          `/works/${selectedWorkId}/verses`,
          { params: { offset, limit: pagination.limit, q: query || undefined } },
        );
        setVerseList(response.data.items ?? []);
        const total = response.data.total ?? response.data.items?.length ?? 0;
        setPagination((prev) => ({ offset, limit: prev.limit, total }));
      } catch (error) {
        setVerseList([]);
        setBannerMessage(`Failed to load verses: ${formatError(error)}`);
      } finally {
        setListLoading(false);
      }
    },
    [selectedWorkId, pagination.limit, searchTerm],
  );

  const loadVerseDetail = useCallback(
    async (verseId: string) => {
      if (!selectedWorkId) {
        return;
      }
      try {
        const response = await apiClient.get(`/works/${selectedWorkId}/verses/${verseId}`);
        const verse = response.data as any;
        const languages = Array.from(
          new Set<string>([
            ...REQUIRED_LANGS,
            ...(workDetail?.langs ?? []),
            ...(Object.keys(verse?.texts ?? {}) as string[]),
          ]),
        );
        const textMap: Record<string, string> = {};
        languages.forEach((lang) => {
          const value = verse?.texts?.[lang];
          textMap[lang] = value ?? "";
        });
        const segments: Record<string, string[]> = {};
        languages.forEach((lang) => {
          const rawSegments = verse?.segments?.[lang];
          segments[lang] = Array.isArray(rawSegments) ? rawSegments : [];
        });
        const history = verse?.review?.history ?? [];
        setVerseDraft({
          verseId: verse?.verse_id ?? verseId,
          manualNumber: verse?.number_manual ?? "",
          systemOrder: verse?.order ?? null,
          texts: textMap,
          segments,
          tags: verse?.tags ?? [],
          origin: verse?.origin ?? [],
          status: verse?.review?.state ?? STATUS_DEFAULT,
          commentary: verse?.commentary ?? [],
          history,
          attachments: verse?.attachments ?? [],
        });
        setDirty(false);
        setErrorMessage(null);
        setLastSavedAt(null);
      } catch (error) {
        setBannerMessage(`Failed to load verse: ${formatError(error)}`);
      }
    },
    [selectedWorkId, workDetail],
  );

  useEffect(() => {
    void fetchWorks();
  }, [fetchWorks]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
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
    } else {
      setVerseList([]);
      setPagination((prev) => ({ ...prev, offset: 0, total: 0 }));
    }
  }, [selectedWorkId, fetchWorkDetail, loadVerseList]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      void loadVerseList({ offset: 0, query: term });
    },
    [loadVerseList],
  );

  const handlePageChange = useCallback(
    (nextOffset: number) => {
      if (nextOffset < 0) {
        nextOffset = 0;
      }
      void loadVerseList({ offset: nextOffset });
    },
    [loadVerseList],
  );

  const handleVerseSelect = useCallback(
    (verseId: string | null) => {
      if (verseId) {
        void loadVerseDetail(verseId);
        return;
      }
      const nextDraft = buildInitialDraft(workDetail);
      setVerseDraft(nextDraft);
      setDirty(false);
      setLastSavedAt(null);
      setErrorMessage(null);
    },
    [loadVerseDetail, workDetail],
  );

  const openCommandPalette = useCallback(() => {
    setPaletteQuery(searchTerm);
    setPaletteOpen(true);
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  const handleCommandSelect = useCallback(
    (verseId: string) => {
      handleVerseSelect(verseId);
      setPaletteOpen(false);
      setPaletteQuery("");
    },
    [handleVerseSelect],
  );

  const setDraft = useCallback((updater: (prev: VerseDraft) => VerseDraft) => {
    setVerseDraft((prev) => {
      const next = updater(prev);
      return next;
    });
    setDirty(true);
  }, []);

  const handleManualNumberChange = (value: string) => {
    setErrorMessage(null);
    setDraft((prev) => ({ ...prev, manualNumber: value }));
  };

  const handleTextChange = (lang: string, value: string) => {
    setDraft((prev) => {
      const languageUniverse = Array.from(
        new Set<string>([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])]),
      );
      const nextTexts: Record<string, string> = { ...prev.texts };
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

  const handleTagsChange = (tags: string[]) => {
    setDraft((prev) => ({ ...prev, tags }));
  };

  const preparePayload = useCallback(
    (options?: { silent?: boolean }): SavePayload | null => {
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
          setErrorMessage(
            `Canonical text (${canonicalLang.toUpperCase()}) must not be empty.`,
          );
        }
        return null;
      }

      const textPayload: Record<string, string | null> = {};
      Object.entries(verseDraft.texts).forEach(([lang, value]) => {
        const trimmed = value?.trim() ?? "";
        textPayload[lang] = trimmed.length ? trimmed : null;
      });

      const segmentPayload: Record<string, string[]> = {};
      Object.entries(verseDraft.segments ?? {}).forEach(([lang, entries]) => {
        const sanitized = (entries ?? []).map((item) => item.trim()).filter(Boolean);
        if (sanitized.length) {
          segmentPayload[lang] = sanitized;
        }
      });

      const languageUniverse = Array.from(
        new Set<string>([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])]),
      );
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
    },
    [verseDraft, workDetail],
  );

  const handleSave = useCallback(
    async (options?: SaveOptions) => {
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
          await apiClient.put(
            `/works/${selectedWorkId}/verses/${verseDraft.verseId}`,
            payload,
          );
        } else {
          const response = await apiClient.post(
            `/works/${selectedWorkId}/verses`,
            payload,
          );
          const verseId = response.data?.verse_id as string | undefined;
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
        } else if (savedVerseId && !options?.silent) {
          void loadVerseDetail(savedVerseId);
        }
      } catch (error) {
        const message = formatError(error);
        setErrorMessage(message);
        if (!options?.silent) {
          setBannerMessage(`Save failed: ${message}`);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [preparePayload, selectedWorkId, verseDraft.verseId, workDetail, loadVerseList, pagination.offset, searchTerm, loadVerseDetail],
  );

  useAutosave(
    () => handleSave({ silent: true }),
    dirty && !isSaving,
    AUTOSAVE_INTERVAL,
  );

  const handleSaveAndNext = () => {
    void handleSave({ advance: true });
  };

  const onValidate = () => {
    setBannerMessage("Validation flow coming soon.");
  };

  const onApprove = () => {
    setBannerMessage("Approval flow coming soon.");
  };

  const onReject = () => {
    setBannerMessage("Rejection flow coming soon.");
  };

  const formattedSavedAt = useMemo(
    () => formatTimestamp(lastSavedAt),
    [lastSavedAt],
  );

  const canonicalLang = workDetail?.canonical_lang ?? "bn";
  const workLanguages = useMemo(
    () => Array.from(new Set([...REQUIRED_LANGS, ...(workDetail?.langs ?? [])])),
    [workDetail?.langs],
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <HeaderBar
        works={works}
        selectedWorkId={selectedWorkId}
        onWorkChange={setSelectedWorkId}
        status={verseDraft.status}
        isSaving={isSaving}
        lastSavedAt={formattedSavedAt}
        connection={connection}
        userEmail={user?.email ?? null}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogoutClick={() => void handleLogout()}
        onSave={() => void handleSave()}
        onSaveNext={handleSaveAndNext}
        onValidate={onValidate}
        onApprove={onApprove}
        onReject={onReject}
        onOpenVerseJump={openCommandPalette}
        disableReviewerActions={!user}
      />

      <main className="mx-auto max-w-7xl px-6">
        {bannerMessage && (
          <div className="mt-6 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>{bannerMessage}</span>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white"
                onClick={() => setBannerMessage(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <VerseNavigator
            items={verseList}
            loading={listLoading}
            total={pagination.total}
            offset={pagination.offset}
            limit={pagination.limit}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onSelect={handleVerseSelect}
            selectedVerseId={verseDraft.verseId}
            onPageChange={handlePageChange}
            onCreateNew={() => handleVerseSelect(null)}
          />

          <div className="flex-1">
            <EditorModal
              title={
                workDetail
                  ? `${workDetail.title.en ?? workDetail.work_id} • Verse Editor`
                  : "Verse Editor"
              }
              tabs={DEFAULT_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {activeTab === "verse" ? (
                <VerseTab
                  draft={verseDraft}
                  canonicalLang={canonicalLang}
                  workId={workDetail?.work_id ?? ""}
                  workLangs={workLanguages}
                  errorMessage={errorMessage}
                  onManualNumberChange={handleManualNumberChange}
                  onTextChange={handleTextChange}
                  onTagsChange={handleTagsChange}
                />
              ) : (
                <PlaceholderTab label={activeTab} />
              )}
            </EditorModal>
          </div>
        </div>
      </main>
      <CommandPalette
        isOpen={isPaletteOpen}
        query={paletteQuery}
        items={verseList}
        loading={listLoading}
        onQueryChange={(value) => {
          setPaletteQuery(value);
          handleSearch(value);
        }}
        onClose={() => setPaletteOpen(false)}
        onSelect={(verseId) => handleCommandSelect(verseId)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/40 px-4 py-14 text-center text-sm text-slate-400">
      {label} tab coming soon.
    </div>
  );
}

function incrementManualNumber(current: string): string {
  const numeric = parseInt(current, 10);
  if (Number.isNaN(numeric)) {
    return current;
  }
  return String(numeric + 1);
}
